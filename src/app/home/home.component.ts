import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { AppTitleService } from '../app-title.service';
import { IChurchServiceAgenda } from './interfaces/church-service-agenda.interface';
import { WorshipTimeService } from './services/worship-time.service';
import { CurrentQuarterService } from '../sabbath-school/current-quarter.service';
import { JoinPipe } from '../shared/pipes/join.pipe';
import { BibleStudiesCtaComponent } from '../shared/components/bible-studies-cta/bible-studies-cta.component';
import serviceTimesJson from './agenda/service-times.json';
import serviceTimesDSTJson from './agenda/service-times-dst.json';

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
  imports: [CommonModule, RouterModule, JoinPipe, BibleStudiesCtaComponent],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  liveStreamApi: string = 'https://sofia-v.sdabg.net/api/next_live_stream.php';
  liveStreamEmbedUrl: SafeResourceUrl;
  isDaylightSaving: boolean;

  constructor(
    private appTitleService: AppTitleService,
    private sanitizer: DomSanitizer,
    private httpClient: HttpClient,
    private workshipTimeService: WorshipTimeService,
    private quarterService: CurrentQuarterService,
  ) {
    this.appTitleService.setTitle('Начало');
    this.liveStreamEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
    this.isDaylightSaving = this.workshipTimeService.isDaylightSaving();
  }

  ngOnInit() {
    this.nextLiveStream();
  }

  nextLiveStream() {
    this.httpClient
      .get<NextLiveStream>(this.liveStreamApi)
      .subscribe((response: NextLiveStream) => {
        this.liveStreamEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.embedUrl);
      });
  }

  mainSectionImages(): string[] {
    return [
      'assets/img/backgrounds/bible-book-christian.jpg',
      'assets/img/backgrounds/atmosphere-blue-cloud.jpg',
      'assets/img/backgrounds/back-view-backlit-clouds.jpg',
    ];
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
