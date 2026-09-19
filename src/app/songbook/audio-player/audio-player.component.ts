import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
  @Input() autoplay = true;
  @Output() closed = new EventEmitter<void>();
  @Output() timeUpdate = new EventEmitter<number>();
  @Output() durationChange = new EventEmitter<number>();
  @Output() playingChange = new EventEmitter<boolean>();

  @ViewChild('audioEl') audioElRef?: ElementRef<HTMLAudioElement>;

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
      this.timeUpdate.emit(0);
      this.durationChange.emit(0);
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
    this.setCurrentTime(value);
  }

  /**
   * Programmatic seek used by consumers (e.g. clicking a lyric line).
   */
  seekTo(seconds: number): void {
    const audioEl = this.audioElRef?.nativeElement;
    if (!audioEl) {
      return;
    }

    const max = isFinite(audioEl.duration) ? audioEl.duration : seconds;
    const clamped = Math.min(Math.max(seconds, 0), max);
    audioEl.currentTime = clamped;
    this.setCurrentTime(clamped);
  }

  onTimeUpdate(audioEl: HTMLAudioElement): void {
    this.setCurrentTime(audioEl.currentTime);
  }

  onLoadedMetadata(audioEl: HTMLAudioElement): void {
    this.duration = audioEl.duration;
    this.durationChange.emit(this.duration);
    // Loading a new src resets the browser's internal playbackRate to 1; reassert ours.
    audioEl.playbackRate = this.playbackRate;
    // play() belongs here, not ngOnChanges - the src swap hasn't landed there yet.
    if (this.autoplay) {
      audioEl.play().catch(() => {
        // Autoplay was blocked by the browser; the user can press play manually.
      });
    }
  }

  onPlay(): void {
    this.setPlaying(true);
  }

  onPause(): void {
    this.setPlaying(false);
  }

  onEnded(): void {
    this.setPlaying(false);
  }

  close(audioEl: HTMLAudioElement): void {
    audioEl.pause();
    this.closed.emit();
  }

  private setCurrentTime(seconds: number): void {
    this.currentTime = seconds;
    this.timeUpdate.emit(seconds);
  }

  private setPlaying(playing: boolean): void {
    this.isPlaying = playing;
    this.playingChange.emit(playing);
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
