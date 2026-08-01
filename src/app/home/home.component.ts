import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { AppTitleService } from '../app-title.service';
import { IChurchServiceAgenda } from './interfaces/church-service-agenda.interface';
import { WorshipTimeService } from './services/worship-time.service';
import { CurrentQuarterService } from '../sabbath-school/current-quarter.service';
import { BibleStudiesCtaComponent } from '../shared/components/bible-studies-cta/bible-studies-cta.component';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import serviceTimesJson from './agenda/service-times.json';
import serviceTimesDSTJson from './agenda/service-times-dst.json';
import { BlogApiService } from '../blog/blog-api.service';
import { BlogPostSummary } from '../blog/interfaces/blog-post.interface';
import { BlogPostCardComponent } from '../blog/blog-post-card/blog-post-card.component';

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

interface ServiceTimes {
  [key: string]: number[];
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BibleStudiesCtaComponent,
    NgbCarousel,
    NgbSlide,
    BlogPostCardComponent,
  ],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private readonly isBrowser: boolean;
  liveStreamApi: string = 'https://sofia-v.sdabg.net/api/next_live_stream.php';
  liveStreamEmbedUrl: SafeResourceUrl;
  latestPosts: BlogPostSummary[] = [];
  isDaylightSaving: boolean;

  constructor(
    private appTitleService: AppTitleService,
    private sanitizer: DomSanitizer,
    private httpClient: HttpClient,
    private workshipTimeService: WorshipTimeService,
    private quarterService: CurrentQuarterService,
    private blogApi: BlogApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.appTitleService.setTitle('Начало');
    this.liveStreamEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
    this.isDaylightSaving = this.workshipTimeService.isDaylightSaving();
    this.latestPosts = this.blogApi.getPosts().slice(0, LATEST_POSTS_COUNT);
    this.isBrowser = isPlatformBrowser(platformId);
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

  serviceTimesMoment(): { [key: string]: moment.Moment } {
    const times = this.isDaylightSaving ? serviceTimesDST : serviceTimes;
    const agenda: { [key: string]: moment.Moment } = {};

    Object.keys(times).forEach((serviceTimeKey: string) => {
      const hour = times[serviceTimeKey][0];
      const minute = times[serviceTimeKey][1];
      agenda[serviceTimeKey] = this.workshipTimeService.getTime(hour, minute);
    });

    return agenda;
  }

  saturdayMorningStreamStartTime(): string {
    const agenda = this.serviceTimesMoment();
    return agenda['saturdayMorningSermonStart'].add(10, 'minutes').format('HH:mm');
  }

  churchServiceAgenda(): IChurchServiceAgenda[] {
    const agenda = this.serviceTimesMoment();

    return [
      {
        day: 'Петък вечер',
        label: 'Богослужение и молитвен час',
        time: {
          startHour: agenda['fridayEveningSermonStart'].format('HH:mm'),
          endHour: agenda['fridayEveningSermonEnd'].format('HH:mm'),
        },
        icon: 'fas fa-book',
      },
      {
        day: 'Събота сутрин',
        label: this.sanitizer.bypassSecurityTrustHtml(
          `Групова дискусия върху <a href="/sabbath-school/${this.quarterService.yearAndQuarter()}">съботно училищния урок</a>`,
        ),
        time: {
          startHour: agenda['saturdayMorningSchoolStart'].format('HH:mm'),
          endHour: agenda['saturdayMorningSchoolEnd'].format('HH:mm'),
        },
        icon: 'fas fa-comments',
      },
      {
        day: 'Събота сутрин',
        label: 'Централно богослужение',
        time: {
          startHour: agenda['saturdayMorningSermonStart'].format('HH:mm'),
          endHour: agenda['saturdayMorningSermonEnd'].format('HH:mm'),
        },
        icon: 'fas fa-book-open',
      },
      {
        day: 'Събота вечер',
        label: 'Богослужение и молитвен час',
        time: {
          startHour: agenda['saturdayEveningSermonStart'].format('HH:mm'),
          endHour: agenda['saturdayEveningSermonEnd'].format('HH:mm'),
        },
        icon: 'fas fa-user-friends',
      },
    ];
  }
}
