import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SabbathSchoolApiService } from '../sabbath-school-api.service';
import { AppTitleService } from '../../app-title.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import moment from 'moment';
import { marked } from 'marked';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { QuarterlyDetail, Lesson, PublishingInfo } from '../interfaces/quarterly.interface';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  selector: 'app-sabbath-school-lessons',
  templateUrl: './sabbath-school-lessons.component.html',
  styleUrls: ['./sabbath-school-lessons.component.scss'],
})
export class SabbathSchoolLessonsComponent implements OnInit {
  private static readonly DEFAULT_DAY = '01';
  private readonly lang = 'bg';

  loading = false;
  quarterlyDetail: QuarterlyDetail | null = null;
  publishingInfo: PublishingInfo | null = null;
  open = false;
  moment = moment;

  constructor(
    private api: SabbathSchoolApiService,
    private route: ActivatedRoute,
    private router: Router,
    private appTitleService: AppTitleService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.getQuarterly();
  }

  get lessonTarget(): string | null {
    if (!this.quarterlyDetail?.lessons?.length) {
      return null;
    }

    const now = moment().startOf('day');
    const lesson =
      this.quarterlyDetail.lessons.find((x: Lesson) => {
        const startDate = moment(x.start_date, 'DD/MM/YYYY').startOf('day');
        const endDate = moment(x.end_date, 'DD/MM/YYYY').endOf('day');
        return moment(now).isBetween(startDate, endDate, null, '[]');
      }) || this.quarterlyDetail.lessons[0];
    return this.lessonRoute(lesson.id);
  }

  get quarter(): string {
    return this.route.snapshot.paramMap.get('quarter') || '';
  }

  getQuarterly(): void {
    this.loading = true;
    this.api.getQuarterly(this.quarter).subscribe({
      next: (data: QuarterlyDetail) => {
        this.quarterlyDetail = data;
        this.loading = false;
        this.appTitleService.setTitle(`${this.quarterlyDetail.quarterly.title} - Съботен урок`);
        this.loadPublishingInfo();
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadPublishingInfo(): void {
    this.api.getPublishingInfo(this.lang, this.lang).subscribe({
      next: (data: PublishingInfo) => {
        this.publishingInfo = data;
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  navigateToLesson(lessonId: string): void {
    this.router.navigateByUrl(this.lessonRoute(lessonId));
  }

  parseLessonNumber(value: string): number {
    return Number.parseInt(value, 10);
  }

  isNumericId(id: string): boolean {
    return /^\d*$/.test(id);
  }

  private lessonRoute(lessonId: string): string {
    return `/sabbath-school/${this.quarter}/lessons/${lessonId}/${SabbathSchoolLessonsComponent.DEFAULT_DAY}`;
  }

  parseMarkdown(markdown: string): SafeHtml {
    if (!markdown) {
      return '';
    }

    const html = marked.parse(markdown) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
