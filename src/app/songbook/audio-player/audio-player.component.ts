import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

const SPEED_STEP = 0.05;
const MIN_SPEED = 0.5;
const MAX_SPEED = 2;

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnChanges {
  @Input({ required: true }) src!: string;
  @Input({ required: true }) title!: string;
  @Input() downloadHref?: string;
  @Input() downloadOpenInNewTab = false;

  readonly minSpeed = MIN_SPEED;
  readonly maxSpeed = MAX_SPEED;
  readonly speedStep = SPEED_STEP;

  isPlaying = false;
  currentTime = 0;
  duration = 0;
  playbackRate = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && !changes['src'].firstChange) {
      this.currentTime = 0;
      this.duration = 0;
    }
  }

  togglePlay(audioEl: HTMLAudioElement): void {
    if (audioEl.paused) {
      audioEl.play().catch(() => {});
    } else {
      audioEl.pause();
    }
  }

  skip(audioEl: HTMLAudioElement, seconds: number): void {
    const max = isFinite(audioEl.duration) ? audioEl.duration : Infinity;
    audioEl.currentTime = Math.min(Math.max(audioEl.currentTime + seconds, 0), max);
  }

  seek(audioEl: HTMLAudioElement, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    audioEl.currentTime = value;
    this.currentTime = value;
  }

  onTimeUpdate(audioEl: HTMLAudioElement): void {
    this.currentTime = audioEl.currentTime;
  }

  onLoadedMetadata(audioEl: HTMLAudioElement): void {
    this.duration = audioEl.duration;
    // Loading a new src resets the browser's internal playbackRate to 1; reassert ours.
    audioEl.playbackRate = this.playbackRate;
    // play() belongs here, not ngOnChanges - the src swap hasn't landed there yet.
    audioEl.play().catch(() => {
      // Autoplay was blocked by the browser; the user can press play manually.
    });
  }

  changeSpeed(delta: number): void {
    const next = Math.round((this.playbackRate + delta) * 100) / 100;
    this.playbackRate = Math.min(Math.max(next, MIN_SPEED), MAX_SPEED);
  }

  get playbackRateLabel(): string {
    return `${Math.round(this.playbackRate * 100)}%`;
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
