import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./sabbath-school-lessons.component.scss']
})
export class SabbathSchoolLessonsComponent implements OnInit {
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
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.getQuarterly();
  }

  get lessonTarget(): string | null {
    if (!this.quarterlyDetail || !this.quarterlyDetail.lessons || !this.quarterlyDetail.lessons.length) {
      return null;
    }
    const now = moment().startOf('day');
    const lesson = this.quarterlyDetail.lessons.find((x: Lesson) => {
      const startDate = moment(x.start_date, 'DD/MM/YYYY').startOf('day');
      const endDate = moment(x.end_date, 'DD/MM/YYYY').endOf('day');
      return moment(now).isBetween(startDate, endDate, null, '[]');
    }) || this.quarterlyDetail.lessons[0];
    return `/sabbath-school/${this.quarter}/lessons/${lesson.id}/01`;
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
        this.appTitleService.setTitle(
          `${this.quarterlyDetail.quarterly.title} - Съботен урок`
        );
        this.loadPublishingInfo();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadPublishingInfo(): void {
    try {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // We'll use a simple country detection
      const timezone = browserTimezone;
      if (timezone) {
        this.api.getPublishingInfo(this.lang, this.lang).subscribe({
          next: (data: PublishingInfo) => {
            this.publishingInfo = data;
          },
          error: () => {}
        });
      }
    } catch (e) {}
  }

  navigateToLesson(lessonId: string): void {
    this.router.navigate([
      '/sabbath-school',
      this.quarter,
      'lessons',
      lessonId,
      '01'
    ]);
  }

  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  isNumericId(id: string): boolean {
    return /^\d*$/.test(id);
  }

  parseMarkdown(markdown: string): SafeHtml {
    if (!markdown) {
      return '';
    }

    const html = marked.parse(markdown) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
