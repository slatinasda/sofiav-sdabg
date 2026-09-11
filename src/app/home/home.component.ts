import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { AppTitleService } from '../app-title.service';
import { IChurchServiceAgenda } from './interfaces/church-service-agenda.interface';
import { WorshipTimeService } from './services/worship-time.service';
import { CurrentQuarterService } from '../sabbath-school/current-quarter.service';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import serviceTimesJson from './agenda/service-times.json';
import serviceTimesDSTJson from './agenda/service-times-dst.json';
import { BlogApiService } from '../blog/blog-api.service';
import { BlogPostSummary } from '../blog/interfaces/blog-post.interface';
import { BlogPostCardComponent } from '../blog/blog-post-card/blog-post-card.component';
import { environment } from '../../environments/environment';

const LATEST_POSTS_COUNT = 3;

const serviceTimes = serviceTimesJson as ServiceTimes;
const serviceTimesDST = serviceTimesDSTJson as ServiceTimes;

interface NextLiveStream {
  title: string;
  url: string;
  embedUrl: string;
  videoId: string;
  published: string;
}

type ServiceTimeKey =
  | 'fridayEveningSermonStart'
  | 'fridayEveningSermonEnd'
  | 'saturdayMorningSchoolStart'
  | 'saturdayMorningSchoolEnd'
  | 'saturdayMorningSermonStart'
  | 'saturdayMorningSermonEnd'
  | 'saturdayEveningSermonStart'
  | 'saturdayEveningSermonEnd';

type ServiceTimes = Record<ServiceTimeKey, number[]>;

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, NgbCarousel, NgbSlide, BlogPostCardComponent],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private readonly isBrowser: boolean;
  private readonly liveStreamApi = `${environment.apiUrl}/next_live_stream.php`;
  liveStreamEmbedUrl: SafeResourceUrl;
  latestPosts: BlogPostSummary[] = [];
  isDaylightSaving: boolean;
  private readonly agenda: Record<ServiceTimeKey, moment.Moment>;

  constructor(
    private appTitleService: AppTitleService,
    private sanitizer: DomSanitizer,
    private httpClient: HttpClient,
    private worshipTimeService: WorshipTimeService,
    private quarterService: CurrentQuarterService,
    private blogApi: BlogApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.appTitleService.setTitle('Начало');
    this.liveStreamEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
    this.isDaylightSaving = this.worshipTimeService.isDaylightSaving();
    this.agenda = this.buildAgenda();
    this.latestPosts = this.blogApi.getPosts().slice(0, LATEST_POSTS_COUNT);
  }

  ngOnInit() {
    // Skip during SSR prerendering phase, hydrate when page JS loads
    if (this.isBrowser) {
      this.nextLiveStream();
    }
  }

  nextLiveStream() {
    this.httpClient
      .get<NextLiveStream>(this.liveStreamApi)
      .subscribe((response: NextLiveStream) => {
        this.liveStreamEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.embedUrl);
        this.cdr.markForCheck();
      });
  }

  get saturdayMorningStreamStartTime(): string {
    return this.agenda.saturdayMorningSermonStart.clone().add(10, 'minutes').format('HH:mm');
  }

  get churchServiceAgenda(): IChurchServiceAgenda[] {
    return [
      this.agendaItem(
        'Петък вечер',
        'Богослужение и молитвен час',
        this.agenda.fridayEveningSermonStart,
        this.agenda.fridayEveningSermonEnd,
        'fas fa-book',
      ),
      this.agendaItem(
        'Събота сутрин',
        this.sanitizer.bypassSecurityTrustHtml(
          `Групова дискусия върху <a href="/sabbath-school/${this.quarterService.yearAndQuarter()}">съботно училищния урок</a>`,
        ),
        this.agenda.saturdayMorningSchoolStart,
        this.agenda.saturdayMorningSchoolEnd,
        'fas fa-comments',
      ),
      this.agendaItem(
        'Събота сутрин',
        'Централно богослужение',
        this.agenda.saturdayMorningSermonStart,
        this.agenda.saturdayMorningSermonEnd,
        'fas fa-book-open',
      ),
      this.agendaItem(
        'Събота вечер',
        'Богослужение и молитвен час',
        this.agenda.saturdayEveningSermonStart,
        this.agenda.saturdayEveningSermonEnd,
        'fas fa-user-friends',
      ),
    ];
  }

  private buildAgenda(): Record<ServiceTimeKey, moment.Moment> {
    const times = this.isDaylightSaving ? serviceTimesDST : serviceTimes;
    return Object.fromEntries(
      (Object.keys(times) as ServiceTimeKey[]).map((key) => [
        key,
        this.worshipTimeService.getTime(times[key][0], times[key][1]),
      ]),
    ) as Record<ServiceTimeKey, moment.Moment>;
  }

  private agendaItem(
    day: string,
    label: string | SafeHtml,
    start: moment.Moment,
    end: moment.Moment,
    icon: string,
  ): IChurchServiceAgenda {
    return {
      day,
      label,
      time: { startHour: start.format('HH:mm'), endHour: end.format('HH:mm') },
      icon,
    };
  }
}
