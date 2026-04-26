import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SabbathSchoolApiService } from '../sabbath-school-api.service';
import { AppTitleService } from '../../app-title.service';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { QuarterlyDetail, LessonDetail, DayRead, AudioItem } from '../interfaces/quarterly.interface';

@Component({
  selector: 'app-sabbath-school-read',
  templateUrl: './sabbath-school-read.component.html',
  styleUrls: ['./sabbath-school-read.component.scss']
})
export class SabbathSchoolReadComponent implements OnInit, OnDestroy {
  @ViewChild('readerContent') readerContent!: ElementRef;

  loading = false;
  quarterlyDetail: QuarterlyDetail | null = null;
  lessonDetail: LessonDetail | null = null;
  read: DayRead | null = null;
  moment = moment;

  audio: AudioItem[] = [];
  audioOpen = false;
  audioMinimized = false;

  bibleData: any[] = [];
  bibleModalOpen = false;
  selectedBibleHtml: SafeHtml = '';

  readerTheme = 'light';
  readerSize = '3';

  private readonly READER_THEME_KEY = 'ss-reader-theme';
  private readonly READER_SIZE_KEY = 'ss-reader-size';

  private routeSub!: Subscription;
  private routeParams: any = {};

  constructor(
    private api: SabbathSchoolApiService,
    private route: ActivatedRoute,
    private router: Router,
    private appTitleService: AppTitleService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.loadSettings();
    // Subscribe to route param changes so component reloads when day changes
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.routeParams = {
        quarter: params.get('quarter') || '',
        lessonId: params.get('lesson') || '',
        day: params.get('day') || '01'
      };
      this.loadData();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  private loadData(): void {
    this.loadQuarterly();
    this.loadLesson();
    this.loadAudio();
  }

  private loadSettings(): void {
    this.readerTheme = localStorage.getItem(this.READER_THEME_KEY) || 'light';
    this.readerSize = localStorage.getItem(this.READER_SIZE_KEY) || '3';
  }

  private saveSettings(): void {
    localStorage.setItem(this.READER_THEME_KEY, this.readerTheme);
    localStorage.setItem(this.READER_SIZE_KEY, this.readerSize);
  }

  setTheme(theme: string): void {
    this.readerTheme = theme;
    this.saveSettings();
  }

  setSize(size: string): void {
    this.readerSize = size;
    this.saveSettings();
  }

  onSizeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.setSize(target.value);
    }
  }

  get fontSizeClass(): string {
    const sizeMap: { [key: string]: string } = {
      '1': 'ss-size-xs',
      '2': 'ss-size-sm',
      '3': 'ss-size-md',
      '4': 'ss-size-lg',
      '5': 'ss-size-xl'
    };
    return sizeMap[this.readerSize] || 'ss-size-md';
  }

  get quarter(): string { return this.routeParams.quarter; }
  get lessonId(): string { return this.routeParams.lessonId; }
  get dayParam(): string { return this.routeParams.day; }

  get readIndex(): string {
    return `bg-${this.quarter}-${this.lessonId}-${this.dayParam}`;
  }

  loadQuarterly(): void {
    if (!this.quarter) return;
    this.api.getQuarterly(this.quarter).subscribe({
      next: (data: QuarterlyDetail) => {
        this.quarterlyDetail = data;
      }
    });
  }

  loadLesson(): void {
    if (!this.quarter || !this.lessonId) return;
    this.api.getLesson(this.quarter, this.lessonId).subscribe({
      next: (data: LessonDetail) => {
        this.lessonDetail = data;

        // When there's no day param, redirect to today's day
        if (!this.route.snapshot.paramMap.get('day')) {
          const today = moment().startOf('day');
          const dayIndex = this.lessonDetail.days.findIndex((x) => {
            const dayDate = moment(x.date, 'DD/MM/YYYY').startOf('day');
            return moment(today).isSame(dayDate);
          });
          if (dayIndex >= 0) {
            this.router.navigate([
              '/sabbath-school',
              this.quarter,
              'lessons',
              this.lessonId,
              String(dayIndex + 1).padStart(2, '0')
            ]);
            return;
          }
        }
        this.loadDay();
      }
    });
  }

  loadDay(): void {
    this.loading = true;
    let day = this.dayParam;

    if (/^\d{2}-?/g.test(day) && this.lessonDetail) {
      if (this.lessonDetail.days.length && this.lessonDetail.days[Number(day.substring(0, 2)) - 1]) {
        day = this.lessonDetail.days[Number(day.substring(0, 2)) - 1].id;
      }
    }

    this.api.getDayRead(this.quarter, this.lessonId, day).subscribe({
      next: (data: DayRead) => {
        this.bibleData = data.bible || [];
        this.read = data;
        this.loading = false;
        this.appTitleService.setTitle(`${this.read.title} - Съботен урок`);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadAudio(): void {
    if (!this.quarter || !this.lessonId) {
      return;
    }

    // For bg locale, there is 1 audio per lesson. The target day is always 01
    const targetDay = '01'
    const audioIndex = `bg-${this.quarter}-${this.lessonId}-${targetDay}`;
    this.api.getAudio(this.quarter).subscribe({
      next: (data: AudioItem[]) => {
        this.audio = data.filter((item: AudioItem) =>
          item.targetIndex === audioIndex
        );
      },
      error: () => {}
    });
  }

  slugify(dayIndex: number): string {
    return dayIndex.toString().padStart(2, '0');
  }

  onReaderClick(event: MouseEvent): void {
    const verseLink = (event.target as HTMLElement).closest('a.verse');
    if (verseLink) {
      event.preventDefault();
      this.openBibleVerse();
    }
  }

  openBibleVerse(): void {
    // Find RIBBD first, fall back to any available translation
    const preferred = 'RIBBD';

    let translation: any = this.bibleData.find(t => t.name === preferred);
    if (!translation && this.bibleData.length) {
      translation = this.bibleData[0];
    }

    if (!translation) {
      this.selectedBibleHtml = '';
      this.bibleModalOpen = true;
      return;
    }

    const verses = translation.verses || {};
    const entries: string[] = [];
    for (const md of Object.values(verses)) {
      if (typeof md === 'string') {
        entries.push(md);
      }
    }

    const markdown = entries.join('\n\n').replace(/\\n/g, '\n');

    if (!markdown.trim()) {
      this.selectedBibleHtml = '';
      this.bibleModalOpen = true;
      return;
    }

    const html = marked.parse(markdown) as string;
    const htmlStyles = `
      <style>
        h2:first-of-type {
          margin-top: 0;
        }
        h2 {
          font-size: 1.75rem;
          margin-top: 1.5rem;
        }
      </style>
    `
    const content = htmlStyles + html;
    this.selectedBibleHtml = this.sanitizer.bypassSecurityTrustHtml(content);
    this.bibleModalOpen = true;
  }
}
