import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

import { AppTitleService } from '../app-title.service';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { LyricsPaneComponent } from './lyrics/lyrics-pane/lyrics-pane.component';
import { LyricsService } from './lyrics/lyrics.service';
import { LyricsManifest, ParsedLyrics } from './lyrics/lyrics.types';

const SEARCH_DEBOUNCE_MS = 300;
const LYRICS_UNAVAILABLE_MESSAGE = 'Няма наличен текст за тази песен.';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, AudioPlayerComponent, LyricsPaneComponent],
  selector: 'app-songbook',
  templateUrl: './songbook.component.html',
  styleUrls: ['./songbook.component.scss'],
})
export class SongbookComponent implements OnInit, OnDestroy {
  @ViewChild(AudioPlayerComponent) audioPlayer?: AudioPlayerComponent;

  manifest: LyricsManifest = {};
  songs: number[] = [];
  filteredSongs: number[] = [];
  searchQuery = '';

  selectedSong: number | null = null;
  mobileLyricsOpen = false;

  lyrics: ParsedLyrics | null = null;
  lyricsLoading = false;
  lyricsError: string | null = null;

  currentTime = 0;

  private readonly searchInput$ = new Subject<string>();
  private searchInputSub?: Subscription;
  private lyricsSub?: Subscription;

  constructor(
    private appTitleService: AppTitleService,
    private lyricsService: LyricsService,
    private cdr: ChangeDetectorRef,
  ) {
    this.appTitleService.setTitle('Песни');
  }

  ngOnInit(): void {
    this.searchInputSub = this.searchInput$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged())
      .subscribe((query) => {
        this.applyFilter(query);
        this.cdr.markForCheck();
      });

    this.loadManifest(this.lyricsService.manifest);
  }

  ngOnDestroy(): void {
    this.searchInputSub?.unsubscribe();
    this.lyricsSub?.unsubscribe();
  }

  onSearchChange(): void {
    this.searchInput$.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchInput$.next('');
  }

  songTitle(songNumber: number): string {
    return this.manifest[String(songNumber)]?.title ?? String(songNumber);
  }

  selectSong(songNumber: number): void {
    this.mobileLyricsOpen = true;

    if (this.selectedSong === songNumber) {
      return;
    }

    this.selectedSong = songNumber;
    this.currentTime = 0;
    this.loadLyrics(songNumber);
  }

  backToList(): void {
    this.mobileLyricsOpen = false;
  }

  onTimeUpdate(time: number): void {
    this.currentTime = time;
  }

  onSeek(time: number): void {
    this.audioPlayer?.seekTo(time);
  }

  closePlayer(): void {
    this.selectedSong = null;
    this.lyrics = null;
    this.lyricsError = null;
    this.mobileLyricsOpen = false;
    this.currentTime = 0;
  }

  get selectedSongSrc(): string {
    return this.selectedSong !== null
      ? (this.manifest[String(this.selectedSong)]?.audio ?? '')
      : '';
  }

  get selectedSongTitle(): string {
    return this.selectedSong !== null ? `Песен ${this.selectedSong}` : '';
  }

  get lyricsTitle(): string {
    return this.selectedSong !== null ? `Песен ${this.songTitle(this.selectedSong)}` : '';
  }

  private applyFilter(query: string): void {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      this.filteredSongs = [...this.songs];
      return;
    }

    this.filteredSongs = this.songs.filter((songNumber) =>
      this.songTitle(songNumber).toLowerCase().includes(normalized),
    );
  }

  private loadManifest(manifest: LyricsManifest): void {
    this.manifest = manifest;
    this.songs = Object.keys(manifest)
      .map(Number)
      .sort((a, b) => a - b);
    this.applyFilter(this.searchQuery);
  }

  private loadLyrics(songNumber: number): void {
    this.lyricsSub?.unsubscribe();
    this.lyrics = null;
    this.lyricsError = null;
    this.lyricsLoading = true;

    this.lyricsSub = this.lyricsService
      .getLyrics(songNumber)
      .pipe(
        finalize(() => {
          this.lyricsLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (lyrics) => {
          this.lyrics = lyrics;
        },
        error: () => {
          this.lyricsError = LYRICS_UNAVAILABLE_MESSAGE;
        },
      });
  }
}
