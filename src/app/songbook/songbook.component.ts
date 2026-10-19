import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, SubscriptionLike } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { OG_IMAGE_ALT, OG_IMAGES, SeoService } from '../shared/services/seo.service';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { LyricsPaneComponent } from './lyrics/lyrics-pane/lyrics-pane.component';
import { LyricsService } from './lyrics/lyrics.service';
import { LyricsManifest, ParsedLyrics } from './lyrics/lyrics.types';

const LYRICS_UNAVAILABLE_MESSAGE = 'Няма наличен текст за тази песен.';
const CHAPTER_SIZE = 50;

interface ChapterPill {
  label: string;
  start: number;
}

function buildChapterPills(songs: number[]): ChapterPill[] {
  if (!songs.length) {
    return [];
  }

  const firstSong = songs[0];
  const lastSong = songs[songs.length - 1];
  const pills: ChapterPill[] = [];

  for (let start = firstSong; start <= lastSong; start += CHAPTER_SIZE) {
    const end = Math.min(start + CHAPTER_SIZE - 1, lastSong);
    pills.push({ label: start === end ? `${start}` : `${start}-${end}`, start });
  }

  return pills;
}

function buildSongRangeLabel(songs: number[]): string {
  if (!songs.length) {
    return '';
  }

  const first = songs[0];
  const last = songs[songs.length - 1];
  return first === last ? `${first}` : `${first} до ${last}`;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, AudioPlayerComponent, LyricsPaneComponent],
  selector: 'app-songbook',
  templateUrl: './songbook.component.html',
  styleUrls: ['./songbook.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongbookComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  private readonly lyricsService = inject(LyricsService);
  private readonly location = inject(Location);

  @ViewChild(AudioPlayerComponent) audioPlayer?: AudioPlayerComponent;

  readonly manifest: LyricsManifest = this.lyricsService.manifest;
  readonly songs = Object.keys(this.manifest)
    .map(Number)
    .sort((a, b) => a - b);
  readonly chapterPills = buildChapterPills(this.songs);
  readonly songRangeLabel = buildSongRangeLabel(this.songs);

  readonly searchQuery = signal('');
  readonly chapterStart = signal(this.songs[0] ?? 1);
  readonly selectedSong = signal<number | null>(null);
  readonly readerOpen = signal(false);

  readonly lyrics = signal<ParsedLyrics | null>(null);
  readonly lyricsLoading = signal(false);
  readonly lyricsError = signal<string | null>(null);
  readonly currentTime = signal(0);

  readonly searchActive = computed(() => this.searchQuery().trim().length > 0);

  readonly filteredSongs = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return [];
    }

    return this.songs.filter((songNumber) =>
      this.songTitle(songNumber).toLowerCase().includes(query),
    );
  });

  readonly visibleSongs = computed(() => {
    if (this.searchActive()) {
      return this.filteredSongs();
    }

    const start = this.chapterStart();
    return this.songs.filter(
      (songNumber) => songNumber >= start && songNumber < start + CHAPTER_SIZE,
    );
  });

  readonly selectedSongSrc = computed(() => {
    const songNumber = this.selectedSong();
    return songNumber === null ? '' : (this.manifest[String(songNumber)]?.audio ?? '');
  });

  readonly selectedSongTitle = computed(() => {
    const songNumber = this.selectedSong();
    return songNumber === null ? '' : `Песен ${songNumber}`;
  });

  readonly lyricsTitle = computed(() => {
    const songNumber = this.selectedSong();
    return songNumber === null ? '' : this.songTitle(songNumber);
  });

  private lyricsSub?: Subscription;
  private locationSub?: SubscriptionLike;

  // Tracks whether opening the reader added a history entry, so closing it
  // pops that entry instead of leaving the page.
  private readerHistoryPushed = false;

  ngOnInit(): void {
    this.seo.setPageMeta({
      title: 'Църковни песни',
      socialTitle: 'Църковни песни и химни',
      description:
        'Адвентна църковна песнарка с текстове, ноти, MIDI файлове и аудио. Търсете по номер и пейте заедно с нас.',
      path: 'songbook',
      image: OG_IMAGES.songbook,
      imageAlt: OG_IMAGE_ALT,
      keywords: ['църковни песни', 'адвентна песнарка', 'химни', 'ноти', 'текстове на песни'],
    });

    this.locationSub = this.location.subscribe(() => {
      if (!this.readerOpen()) {
        return;
      }

      this.readerHistoryPushed = false;
      this.readerOpen.set(false);
    });
  }

  ngOnDestroy(): void {
    this.lyricsSub?.unsubscribe();
    this.locationSub?.unsubscribe();
  }

  onSearchSubmit(): void {
    const songNumber = Number(this.searchQuery().trim());
    if (!Number.isInteger(songNumber) || !this.manifest[String(songNumber)]) {
      return;
    }

    this.selectSong(songNumber);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  selectPill(start: number): void {
    this.chapterStart.set(start);
    this.searchQuery.set('');
  }

  selectSong(songNumber: number): void {
    const songUrl = `${this.location.path(false)}#song-${songNumber}`;
    if (!this.readerOpen()) {
      this.readerHistoryPushed = true;
      this.location.go(songUrl);
    } else {
      // Switching songs updates the hash in place, without adding a history entry.
      this.location.replaceState(songUrl);
    }
    this.readerOpen.set(true);

    if (this.selectedSong() === songNumber) {
      return;
    }

    this.selectedSong.set(songNumber);
    this.currentTime.set(0);
    this.loadLyrics(songNumber);
  }

  backToList(): void {
    this.closeReader();
  }

  // Mirror the back button so closing the reader does not stop playback.
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (!this.readerOpen() || event.defaultPrevented) {
      return;
    }

    // Let an open settings dropdown consume Escape before closing the reader.
    const target = event.target as HTMLElement | null;
    if (target?.closest('.dropdown.show')) {
      return;
    }

    this.closeReader();
  }

  onTimeUpdate(time: number): void {
    this.currentTime.set(time);
  }

  onSeek(time: number): void {
    this.audioPlayer?.seekTo(time);
  }

  closePlayer(): void {
    this.selectedSong.set(null);
    this.lyrics.set(null);
    this.lyricsError.set(null);
    this.currentTime.set(0);
    this.closeReader();
  }

  private closeReader(): void {
    if (this.readerHistoryPushed) {
      // Pop the pushed entry; the location subscription closes the reader.
      this.readerHistoryPushed = false;
      this.location.back();
      return;
    }

    this.readerOpen.set(false);
  }

  private songTitle(songNumber: number): string {
    return this.manifest[String(songNumber)]?.title ?? String(songNumber);
  }

  private loadLyrics(songNumber: number): void {
    this.lyricsSub?.unsubscribe();
    this.lyrics.set(null);
    this.lyricsError.set(null);
    this.lyricsLoading.set(true);

    this.lyricsSub = this.lyricsService
      .getLyrics(songNumber)
      .pipe(finalize(() => this.lyricsLoading.set(false)))
      .subscribe({
        next: (lyrics) => this.lyrics.set(lyrics),
        error: () => this.lyricsError.set(LYRICS_UNAVAILABLE_MESSAGE),
      });
  }
}
