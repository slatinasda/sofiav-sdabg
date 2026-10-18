import { TestBed } from '@angular/core/testing';
import moment from 'moment-timezone';
import { firstValueFrom, of } from 'rxjs';

import { CurrentQuarterService } from '../../sabbath-school/current-quarter.service';
import { SabbathSchoolApiService } from '../../sabbath-school/sabbath-school-api.service';
import {
  Lesson,
  LessonDetail,
  Quarterly,
  QuarterlyDetail,
} from '../../sabbath-school/interfaces/quarterly.interface';
import { CurrentLessonService } from './current-lesson.service';

const TIME_ZONE = 'Europe/Sofia';
const TODAY = moment().tz(TIME_ZONE).startOf('day');

function formatDate(value: moment.Moment): string {
  return value.format('DD/MM/YYYY');
}

function makeQuarter(id: string, start: moment.Moment, end: moment.Moment): Quarterly {
  return {
    id,
    title: 'Изпитание',
    human_date: 'Октомври - Декември 2026',
    start_date: formatDate(start),
    end_date: formatDate(end),
    color_primary: '#000000',
    color_primary_dark: '#000000',
    cover: 'cover.jpg',
    lang: 'bg',
    index: '1',
    path: '',
    full_path: '',
  };
}

function makeLesson(id: string, start: moment.Moment, end: moment.Moment): Lesson {
  return {
    id,
    title: 'Урок',
    start_date: formatDate(start),
    end_date: formatDate(end),
    index: id,
    path: '',
    full_path: '',
    pdfOnly: false,
    cover: '',
  };
}

function makeLessonDetail(lesson: Lesson, days: moment.Moment[]): LessonDetail {
  return {
    lesson,
    days: days.map((day, index) => ({
      title: `Ден ${index + 1}`,
      date: formatDate(day),
      id: String(index + 1),
      index: String(index + 1),
      path: '',
      full_path: '',
      read_path: '',
      full_read_path: '',
    })),
    pdfs: [],
  };
}

describe('CurrentLessonService', () => {
  const api = {
    getQuarterlies: vi.fn(),
    getQuarterly: vi.fn(),
    getLesson: vi.fn(),
  };
  const quarterService = {
    yearAndQuarter: vi.fn(() => '2026-04'),
  };

  let service: CurrentLessonService;

  beforeEach(() => {
    vi.resetAllMocks();
    quarterService.yearAndQuarter.mockReturnValue('2026-04');

    TestBed.configureTestingModule({
      providers: [
        CurrentLessonService,
        { provide: SabbathSchoolApiService, useValue: api },
        { provide: CurrentQuarterService, useValue: quarterService },
      ],
    });

    service = TestBed.inject(CurrentLessonService);
  });

  it('opens today in the active lesson', async () => {
    const quarter = makeQuarter(
      '2026-04',
      TODAY.clone().subtract(30, 'days'),
      TODAY.clone().add(30, 'days'),
    );
    const lesson = makeLesson(
      '05',
      TODAY.clone().subtract(2, 'days'),
      TODAY.clone().add(2, 'days'),
    );
    const detail: QuarterlyDetail = { quarterly: quarter, lessons: [lesson] };
    const lessonDetail = makeLessonDetail(lesson, [
      TODAY.clone().subtract(1, 'day'),
      TODAY,
      TODAY.clone().add(1, 'day'),
    ]);

    api.getQuarterlies.mockReturnValue(of([quarter]));
    api.getQuarterly.mockReturnValue(of(detail));
    api.getLesson.mockReturnValue(of(lessonDetail));

    const result = await firstValueFrom(service.getCurrentLesson());

    expect(result).toMatchObject({
      quarterId: '2026-04',
      lessonNumber: '5',
      dayLabel: 'Днес',
      ctaLabel: 'Прочетете днешния урок',
      route: '/sabbath-school/2026-04/lessons/05/02',
    });
    expect(api.getQuarterly).toHaveBeenCalledWith('2026-04');
    expect(api.getLesson).toHaveBeenCalledWith('2026-04', '05');
  });

  it('falls back to the first day when today is outside the lesson', async () => {
    const quarter = makeQuarter(
      '2026-04',
      TODAY.clone().subtract(30, 'days'),
      TODAY.clone().add(30, 'days'),
    );
    const lesson = makeLesson(
      '01',
      TODAY.clone().subtract(10, 'days'),
      TODAY.clone().subtract(3, 'days'),
    );
    const detail: QuarterlyDetail = { quarterly: quarter, lessons: [lesson] };
    const lessonDetail = makeLessonDetail(lesson, [
      TODAY.clone().subtract(10, 'days'),
      TODAY.clone().subtract(9, 'days'),
    ]);

    api.getQuarterlies.mockReturnValue(of([quarter]));
    api.getQuarterly.mockReturnValue(of(detail));
    api.getLesson.mockReturnValue(of(lessonDetail));

    const result = await firstValueFrom(service.getCurrentLesson());

    expect(result).toMatchObject({
      dayLabel: 'Започнете урока',
      ctaLabel: 'Прочетете урока',
      route: '/sabbath-school/2026-04/lessons/01/01',
    });
  });

  it('returns null when there are no quarterlies', async () => {
    api.getQuarterlies.mockReturnValue(of([]));

    const result = await firstValueFrom(service.getCurrentLesson());

    expect(result).toBeNull();
    expect(api.getQuarterly).not.toHaveBeenCalled();
  });

  it('returns null when the lesson has no days', async () => {
    const quarter = makeQuarter(
      '2026-04',
      TODAY.clone().subtract(30, 'days'),
      TODAY.clone().add(30, 'days'),
    );
    const lesson = makeLesson(
      '01',
      TODAY.clone().subtract(2, 'days'),
      TODAY.clone().add(2, 'days'),
    );

    api.getQuarterlies.mockReturnValue(of([quarter]));
    api.getQuarterly.mockReturnValue(of({ quarterly: quarter, lessons: [lesson] }));
    api.getLesson.mockReturnValue(of(makeLessonDetail(lesson, [])));

    const result = await firstValueFrom(service.getCurrentLesson());

    expect(result).toBeNull();
  });
});
