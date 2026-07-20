import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppTitleService } from '../app-title.service';
import { RangePagination } from './range-pagination';
import { AudioPlayerComponent } from './audio-player/audio-player.component';

const FIRST_SONG = 1;
const TOTAL_SONGS = 300;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, AudioPlayerComponent],
  selector: 'app-songbook',
  templateUrl: './songbook.component.html',
  styleUrls: ['./songbook.component.scss'],
})
export class SongbookComponent {
  public organPagination = new RangePagination(FIRST_SONG, TOTAL_SONGS, 30);

  readonly firstSongNumber = FIRST_SONG;
  readonly totalSongs = TOTAL_SONGS;

  selectedSong: number | null = null;
  songNumberInput: number | null = null;
  songJumpError: string | null = null;

  constructor(private appTitleService: AppTitleService) {
    this.appTitleService.setTitle('Песни');
  }

  organSongNumbers(): number[] {
    const [start, end] = this.organPagination.getCurrentRange();
    return Array.from({ length: end - start }, (_, ind) => ind + 1 + start);
  }

  get selectedSongSrc(): string {
    return this.selectedSong !== null
      ? `/files/church-songbook/organ/${this.selectedSong}.mp3`
      : '';
  }

  get selectedSongTitle(): string {
    return this.selectedSong !== null ? `Песен ${this.selectedSong}` : '';
  }

  playSong(songNum: number): void {
    this.selectedSong = songNum;
  }

  goToSongNumber(): void {
    const num = this.songNumberInput;
    if (!num || num < FIRST_SONG || num > TOTAL_SONGS) {
      this.songJumpError = `Моля, въведете номер на песен между ${FIRST_SONG} и ${TOTAL_SONGS}.`;
      return;
    }

    this.songJumpError = null;
    this.organPagination.setPage(this.organPagination.getPageForItem(num));
    this.playSong(num);
  }
}
