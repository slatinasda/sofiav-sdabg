import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
  Inject,
  ViewEncapsulation,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SabbathSchoolApiService } from '../sabbath-school-api.service';
import { OG_IMAGE_ALT, SeoService } from '../../shared/services/seo.service';
import { SABBATH_SCHOOL_OG_IMAGE, SABBATH_SCHOOL_PAGE_META } from '../sabbath-school-seo';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ReaderSettingsComponent } from '../../shared/components/reader-settings/reader-settings.component';
import { ReaderSettingsTriggerDirective } from '../../shared/components/reader-settings/reader-settings-trigger.directive';
import {
  ReaderSettingsService,
  provideReaderSettings,
} from '../../shared/components/reader-settings/reader-settings.service';
import { AudioPlayerComponent } from '../../songbook/audio-player/audio-player.component';
import { SwipeNavigateDirective } from '../../shared/directives/swipe-navigate.directive';
import {
  QuarterlyDetail,
  LessonDetail,
  DayRead,
  AudioItem,
  BibleTranslation,
} from '../interfaces/quarterly.interface';
import { wrapBibleSections } from './bible-sections';

const PREFERRED_BIBLE_TRANSLATION = 'RIBBD';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ModalComponent,
    ReaderSettingsComponent,
    ReaderSettingsTriggerDirective,
    AudioPlayerComponent,
    SwipeNavigateDirective,
  ],
  selector: 'app-sabbath-school-read',
  templateUrl: './sabbath-school-read.component.html',
  styleUrls: ['./sabbath-school-read.component.scss'],
  // [innerHTML] content bypasses Angular's style encapsulation, so scoped styles won't reach it.
  encapsulation: ViewEncapsulation.None,
  providers: [provideReaderSettings('ss')],
})
export class SabbathSchoolReadComponent implements OnInit, OnDestroy {
  @ViewChild('readerContent') readerContent!: ElementRef;

  readonly readerSettings = inject(ReaderSettingsService);

  loading = false;
  quarterlyDetail: QuarterlyDetail | null = null;
  lessonDetail: LessonDetail | null = null;
  read: DayRead | null = null;
  readerHtml: SafeHtml = '';
  moment = moment;

  audio: AudioItem[] = [];
  audioOpen = false;
  audioMinimized = false;

  bibleData: BibleTranslation[] = [];
  bibleModalOpen = false;
  selectedBibleHtml: SafeHtml = '';
  selectedTranslation = '';
  private selectedVerseKey = '';

  private readonly BIBLE_TRANSLATION_KEY = 'ss-bible-translation';

  private routeSub!: Subscription;
  private routeParams: any = {};

  private readonly isBrowser: boolean;

  constructor(
    private api: SabbathSchoolApiService,
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.loadSettings();

    // Subscribe to route param changes so component reloads when day changes
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.routeParams = {
        quarter: params.get('quarter') || '',
        lessonId: params.get('lesson') || '',
        day: params.get('day') || '01',
      };
      this.loadData();
      this.cdr.markForCheck();
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
    if (!this.isBrowser) {
      return;
    }

    this.selectedTranslation = localStorage.getItem(this.BIBLE_TRANSLATION_KEY) || '';
  }

  private saveBibleTranslation(): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(this.BIBLE_TRANSLATION_KEY, this.selectedTranslation);
  }

  get quarter(): string {
    return this.routeParams.quarter;
  }
  get lessonId(): string {
    return this.routeParams.lessonId;
  }
  get dayParam(): string {
    return this.routeParams.day;
  }

  get readIndex(): string {
    return `bg-${this.quarter}-${this.lessonId}-${this.dayParam}`;
  }

  get bibleTranslations(): string[] {
    return this.bibleData.map((t) => t.name);
  }

  loadQuarterly(): void {
    if (!this.quarter) return;
    this.api.getQuarterly(this.quarter).subscribe({
      next: (data: QuarterlyDetail) => {
        this.quarterlyDetail = data;
        this.cdr.markForCheck();
      },
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
              String(dayIndex + 1).padStart(2, '0'),
            ]);
            return;
          }
        }
        this.loadDay();
        this.cdr.markForCheck();
      },
    });
  }

  loadDay(): void {
    this.loading = true;
    let day = this.dayParam;

    if (/^\d{2}-?/g.test(day) && this.lessonDetail) {
      if (
        this.lessonDetail.days.length &&
        this.lessonDetail.days[Number(day.substring(0, 2)) - 1]
      ) {
        day = this.lessonDetail.days[Number(day.substring(0, 2)) - 1].id;
      }
    }

    this.api.getDayRead(this.quarter, this.lessonId, day).subscribe({
      next: (data: DayRead) => {
        this.bibleData = data.bible || [];
        this.read = data;
        this.readerHtml = this.sanitizer.bypassSecurityTrustHtml(data.content || '');
        this.loading = false;
        this.updateSeo(data);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private updateSeo(read: DayRead): void {
    const readTitle = read.title?.trim();

    this.seo.setPageMeta({
      title: readTitle ? `${readTitle} - Съботен урок` : SABBATH_SCHOOL_PAGE_META.title,
      socialTitle: readTitle ? `${readTitle}: съботен урок` : SABBATH_SCHOOL_PAGE_META.socialTitle,
      description: readTitle
        ? `Съботен урок: ${readTitle}. Изучавайте Библията заедно с нас.`
        : SABBATH_SCHOOL_PAGE_META.description,
      path: `sabbath-school/${this.quarter}/lessons/${this.lessonId}/${this.dayParam}`,
      image: SABBATH_SCHOOL_OG_IMAGE,
      imageAlt: OG_IMAGE_ALT,
      keywords: readTitle
        ? ['съботен урок', 'съботно училище', readTitle]
        : SABBATH_SCHOOL_PAGE_META.keywords,
    });
  }

  loadAudio(): void {
    if (!this.quarter || !this.lessonId) {
      return;
    }

    // For bg locale, there is 1 audio per lesson. The target day is always 01
    const targetDay = '01';
    const audioIndex = `bg-${this.quarter}-${this.lessonId}-${targetDay}`;
    this.api.getAudio(this.quarter).subscribe({
      next: (data: AudioItem[]) => {
        this.audio = data.filter((item: AudioItem) => item.targetIndex === audioIndex);
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  slugify(dayIndex: number): string {
    return dayIndex.toString().padStart(2, '0');
  }

  onReaderClick(event: MouseEvent): void {
    const verseLink = (event.target as HTMLElement).closest('a.verse');
    if (!verseLink) {
      return;
    }

    event.preventDefault();
    this.openBibleVerse(verseLink.getAttribute('verse') || '');
  }

  openBibleVerse(verseKey = ''): void {
    this.selectedVerseKey = verseKey;
    this.selectedTranslation = this.resolveTranslation();
    this.renderBibleVerse();
    this.bibleModalOpen = true;
  }

  selectTranslation(name: string): void {
    if (name === this.selectedTranslation) {
      return;
    }

    this.selectedTranslation = name;
    this.saveBibleTranslation();
    this.renderBibleVerse();
  }

  private resolveTranslation(): string {
    const translations = this.bibleTranslations;

    if (translations.includes(this.selectedTranslation)) {
      return this.selectedTranslation;
    }

    if (translations.includes(PREFERRED_BIBLE_TRANSLATION)) {
      return PREFERRED_BIBLE_TRANSLATION;
    }

    return translations[0] || '';
  }

  private renderBibleVerse(): void {
    const translation = this.bibleData.find((t) => t.name === this.selectedTranslation);
    const markdown = this.buildBibleMarkdown(translation?.verses ?? {});

    if (!markdown.trim()) {
      this.selectedBibleHtml = '';
      return;
    }

    const html = marked.parse(markdown) as string;
    this.selectedBibleHtml = this.sanitizer.bypassSecurityTrustHtml(wrapBibleSections(html));
  }

  private buildBibleMarkdown(verses: Record<string, string>): string {
    const markdown = this.selectedVerseKey
      ? (verses[this.selectedVerseKey] ?? '')
      : Object.values(verses).join('\n\n');

    return markdown.replace(/\\n/g, '\n');
  }

  private get currentDayIndex(): number {
    if (!this.lessonDetail || !this.read) {
      return -1;
    }

    return this.lessonDetail.days.findIndex((d) => d.id === this.read!.id);
  }

  get prevDayRoute(): any[] | null {
    const ind = this.currentDayIndex;
    if (ind > 0) {
      return ['/sabbath-school', this.quarter, 'lessons', this.lessonId, this.slugify(ind)];
    }

    return null;
  }

  get nextDayRoute(): any[] | null {
    const ind = this.currentDayIndex;
    if (this.lessonDetail && ind >= 0 && ind < this.lessonDetail.days.length - 1) {
      return ['/sabbath-school', this.quarter, 'lessons', this.lessonId, this.slugify(ind + 2)];
    }

    return null;
  }
}
