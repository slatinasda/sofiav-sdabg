import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import moment from 'moment-timezone';

import { CurrentQuarterService } from '../../sabbath-school/current-quarter.service';
import { SabbathSchoolApiService } from '../../sabbath-school/sabbath-school-api.service';
import { CHURCH_TIME_ZONE } from '../../shared/constants/church-time';
import {
  Lesson,
  LessonDetail,
  Quarterly,
  QuarterlyDetail,
} from '../../sabbath-school/interfaces/quarterly.interface';
import { LessonCard } from './lesson-card.interface';

@Injectable({
  providedIn: 'root',
})
export class CurrentLessonService {
  private readonly sabbathSchoolApi = inject(SabbathSchoolApiService);
  private readonly quarterService = inject(CurrentQuarterService);

  /**
   * Resolves the current quarter, lesson and day for the home page card.
   * Returns `null` when the feed has no usable lesson.
   */
  getCurrentLesson(): Observable<LessonCard | null> {
    return this.sabbathSchoolApi.getQuarterlies().pipe(
      map((quarterlies) => this.pickCurrentQuarter(quarterlies)),
      switchMap((quarter) => this.loadQuarter(quarter)),
    );
  }

  private loadQuarter(quarter: Quarterly | null): Observable<LessonCard | null> {
    if (!quarter) {
      return of(null);
    }

    return this.sabbathSchoolApi
      .getQuarterly(quarter.id)
      .pipe(switchMap((detail) => this.loadLesson(detail)));
  }

  private loadLesson(detail: QuarterlyDetail): Observable<LessonCard | null> {
    const lesson = this.pickCurrentLesson(detail.lessons);
    if (!lesson) {
      return of(null);
    }

    return this.sabbathSchoolApi
      .getLesson(detail.quarterly.id, lesson.id)
      .pipe(map((lessonDetail) => this.buildLessonCard(detail.quarterly, lesson, lessonDetail)));
  }

  private buildLessonCard(
    quarter: Quarterly,
    lesson: Lesson,
    lessonDetail: LessonDetail,
  ): LessonCard | null {
    const days = lessonDetail.days;
    if (!days.length) {
      return null;
    }

    const today = this.today();
    const dayIndex = days.findIndex((day) => this.parseDate(day.date).isSame(today, 'day'));
    const hasToday = dayIndex >= 0;
    const day = hasToday ? days[dayIndex] : days[0];
    const dayNumber = String((hasToday ? dayIndex : 0) + 1).padStart(2, '0');

    return {
      quarterId: quarter.id,
      quarterTitle: quarter.title ?? '',
      quarterDate: quarter.human_date,
      cover: lesson.cover || quarter.cover || quarter.splash || '',
      lessonNumber: String(Number.parseInt(lesson.id, 10) || lesson.id),
      lessonTitle: lesson.title,
      dayLabel: hasToday ? 'Днес' : 'Започнете урока',
      dayTitle: day.title || lesson.title,
      ctaLabel: hasToday ? 'Прочетете днешния урок' : 'Прочетете урока',
      route: `/sabbath-school/${quarter.id}/lessons/${lesson.id}/${dayNumber}`,
    };
  }

  private pickCurrentQuarter(quarterlies: Quarterly[]): Quarterly | null {
    const today = this.today();
    const active = quarterlies.find((quarter) =>
      today.isBetween(
        this.parseDate(quarter.start_date),
        this.parseDate(quarter.end_date).endOf('day'),
        null,
        '[]',
      ),
    );

    if (active) {
      return active;
    }

    const calendarQuarter = this.quarterService.yearAndQuarter();
    return quarterlies.find((quarter) => quarter.id === calendarQuarter) ?? quarterlies[0] ?? null;
  }

  private pickCurrentLesson(lessons: Lesson[]): Lesson | null {
    const today = this.today();
    const active = lessons.find((lesson) =>
      today.isBetween(
        this.parseDate(lesson.start_date),
        this.parseDate(lesson.end_date).endOf('day'),
        null,
        '[]',
      ),
    );

    return active ?? lessons[0] ?? null;
  }

  private today(): moment.Moment {
    return moment().tz(CHURCH_TIME_ZONE).startOf('day');
  }

  private parseDate(value: string): moment.Moment {
    return moment.tz(value, 'DD/MM/YYYY', CHURCH_TIME_ZONE).startOf('day');
  }
}
