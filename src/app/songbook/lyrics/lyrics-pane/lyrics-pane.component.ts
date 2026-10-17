import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReaderSettingsComponent } from '../../../shared/components/reader-settings/reader-settings.component';
import { ReaderSettingsTriggerDirective } from '../../../shared/components/reader-settings/reader-settings-trigger.directive';
import {
  ReaderSettingsService,
  provideReaderSettings,
} from '../../../shared/components/reader-settings/reader-settings.service';
import { LyricLine, ParsedLyrics } from '../lyrics.types';

const USER_SCROLL_COOLDOWN_MS = 3000;
const CENTER_TOLERANCE_PX = 2;
const COPY_FEEDBACK_MS = 2000;

@Component({
  standalone: true,
  imports: [CommonModule, ReaderSettingsComponent, ReaderSettingsTriggerDirective],
  selector: 'app-lyrics-pane',
  templateUrl: './lyrics-pane.component.html',
  styleUrls: ['./lyrics-pane.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideReaderSettings('songbook')],
})
export class LyricsPaneComponent implements OnChanges, OnDestroy {
  @Input() lyrics: ParsedLyrics | null = null;
  @Input() currentTime = 0;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() title = '';
  @Output() seek = new EventEmitter<number>();
  @Output() back = new EventEmitter<void>();

  readonly readerSettings = inject(ReaderSettingsService);

  activeIndex = -1;
  copied = false;

  private scrollContainer?: ElementRef<HTMLElement>;
  private resizeObserver?: ResizeObserver;
  private userScrolling = false;
  private resumeTimeout: ReturnType<typeof setTimeout> | null = null;
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  @ViewChild('scrollContainer')
  set scrollContainerRef(ref: ElementRef<HTMLElement> | undefined) {
    this.scrollContainer = ref;
    this.disconnectResizeObserver();

    const element = ref?.nativeElement;
    if (element && typeof ResizeObserver !== 'undefined') {
      this.observeContainerSize(element);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lyrics']) {
      this.activeIndex = -1;
      this.userScrolling = false;
      this.clearResumeTimeout();
      this.resetCopyState();
    }

    if (changes['currentTime'] || changes['lyrics']) {
      this.updateActiveLine();
    }
  }

  ngOnDestroy(): void {
    this.disconnectResizeObserver();
    this.clearResumeTimeout();
    this.resetCopyState();
  }

  onLineClick(line: LyricLine): void {
    if (line.time === null) {
      return;
    }
    this.seek.emit(line.time);
  }

  copyLyrics(): void {
    const text = this.lyrics?.lines
      .map((line) => line.text)
      .join('\n')
      .trim();

    if (!text || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.copied = true;
        this.cdr.markForCheck();
        if (this.copyTimeout !== null) {
          clearTimeout(this.copyTimeout);
        }
        this.copyTimeout = setTimeout(() => {
          this.copied = false;
          this.copyTimeout = null;
          this.cdr.markForCheck();
        }, COPY_FEEDBACK_MS);
      })
      .catch(() => {});
  }

  onUserScroll(): void {
    this.userScrolling = true;
    this.clearResumeTimeout();
    this.resumeTimeout = setTimeout(() => {
      this.userScrolling = false;
      this.resumeTimeout = null;
      this.scrollToActiveLine();
    }, USER_SCROLL_COOLDOWN_MS);
  }

  private observeContainerSize(element: HTMLElement): void {
    // Half the viewport is reserved above/below so any line can reach the centre.
    this.resizeObserver = new ResizeObserver(() => this.updateCenterPadding());
    this.resizeObserver.observe(element);
    this.updateCenterPadding();
  }

  private disconnectResizeObserver(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  private clearResumeTimeout(): void {
    if (this.resumeTimeout !== null) {
      clearTimeout(this.resumeTimeout);
      this.resumeTimeout = null;
    }
  }

  private resetCopyState(): void {
    if (this.copyTimeout !== null) {
      clearTimeout(this.copyTimeout);
      this.copyTimeout = null;
    }
    this.copied = false;
  }

  private updateCenterPadding(): void {
    const element = this.scrollContainer?.nativeElement;
    if (!element) {
      return;
    }
    element.style.setProperty('--lyrics-center-pad', `${element.clientHeight / 2}px`);
  }

  private updateActiveLine(): void {
    const lines = this.lyrics?.lines;
    if (!this.lyrics?.timed || !lines?.length) {
      this.activeIndex = -1;
      return;
    }

    const next = this.findActiveIndex(lines);
    if (next === this.activeIndex) {
      return;
    }

    this.activeIndex = next;
    if (!this.userScrolling) {
      this.scrollToActiveLine();
    }
  }

  private findActiveIndex(lines: LyricLine[]): number {
    let low = 0;
    let high = lines.length - 1;
    let index = -1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const time = lines[mid].time;
      if (time !== null && time <= this.currentTime) {
        index = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return index;
  }

  private scrollToActiveLine(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container || this.activeIndex < 0) {
      return;
    }

    const line = container.querySelector<HTMLElement>(`[data-line-index="${this.activeIndex}"]`);
    if (!line) {
      return;
    }

    // getBoundingClientRect is viewport-relative, so it stays correct even though
    // .lyrics-scroll is not a positioned ancestor (offsetTop would be page-relative).
    const containerRect = container.getBoundingClientRect();
    const lineRect = line.getBoundingClientRect();
    const delta =
      lineRect.top + lineRect.height / 2 - (containerRect.top + containerRect.height / 2);

    if (Math.abs(delta) < CENTER_TOLERANCE_PX) {
      return;
    }

    container.scrollTo({ top: Math.max(container.scrollTop + delta, 0), behavior: 'smooth' });
  }
}
