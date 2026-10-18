import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { CurrentQuarterService } from '../../sabbath-school/current-quarter.service';
import { CurrentLessonService } from './current-lesson.service';
import { LessonCard } from './lesson-card.interface';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-hero-lesson-card',
  templateUrl: './hero-lesson-card.component.html',
  styleUrls: ['./hero-lesson-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroLessonCardComponent implements OnInit {
  private readonly currentLessonService = inject(CurrentLessonService);
  private readonly quarterService = inject(CurrentQuarterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly currentLesson = signal<LessonCard | null>(null);
  protected readonly isLessonLoading = signal(true);

  private readonly failedCoverUrl = signal<string | null>(null);

  protected readonly coverVisible = computed(() => {
    const cover = this.currentLesson()?.cover;
    return !!cover && this.failedCoverUrl() !== cover;
  });

  protected readonly currentQuarterLink = computed(() => {
    const quarterId = this.currentLesson()?.quarterId ?? this.quarterService.yearAndQuarter();
    return `/sabbath-school/${quarterId}`;
  });

  ngOnInit(): void {
    // Skip during SSR prerendering; the skeleton is part of the static HTML.
    if (!this.isBrowser) {
      return;
    }

    this.loadCurrentLesson();
  }

  protected onCoverError(): void {
    this.failedCoverUrl.set(this.currentLesson()?.cover ?? null);
  }

  private loadCurrentLesson(): void {
    this.currentLessonService
      .getCurrentLesson()
      .pipe(
        catchError((error: unknown) => {
          // Keep the fallback card visible instead of leaving the skeleton forever.
          console.error('Failed to load the current Sabbath School lesson', error);
          return of<LessonCard | null>(null);
        }),
        finalize(() => this.isLessonLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((lesson) => this.currentLesson.set(lesson));
  }
}
