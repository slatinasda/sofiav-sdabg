import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AppTitleService } from '../app-title.service';
import { IChurchServiceAgenda } from './interfaces/church-service-agenda.interface';
import { WorshipTimeService } from './services/worship-time.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isDaylightSaving: boolean;

  constructor(
    private appTitleService: AppTitleService,
    private sanitizer: DomSanitizer,
    private workshipTimeService: WorshipTimeService,
  ) {
    this.appTitleService.setTitle('Начало');
  }

  ngOnInit() {
    this.isDaylightSaving = this.workshipTimeService.isDaylightSaving();
  }

  mainSectionImages(): string[] {
    return [
      'assets/img/backgrounds/bible-book-christian.jpg',
      'assets/img/backgrounds/atmosphere-blue-cloud.jpg',
      'assets/img/backgrounds/back-view-backlit-clouds.jpg',
    ];
  }

  saturdayMorningSermonStartTime(): moment.Moment {
    return this.workshipTimeService.getTime(11, 20);
  }

  saturdayMorningSermonEndTime(): moment.Moment {
    return this.workshipTimeService.getTime(12, 10);
  }

  saturdayMorningStreamStartTime(): string {
    const time = this.saturdayMorningSermonStartTime();
    time.add(20, 'minutes');
    return time.format('HH:mm');
  }

  churchServiceAgenda(): IChurchServiceAgenda[] {
    return [
      {
        day: 'Петък вечер',
        label: 'Богослужение и молитвен час',
        time: {
          startHour: this.workshipTimeService.getTimeDST(18, 0).format('HH:mm'),
          endHour: this.workshipTimeService.getTimeDST(19, 0).format('HH:mm'),
        },
        icon: 'fas fa-book',
      },
      {
        day: 'Събота сутрин',
        label: this.sanitizer.bypassSecurityTrustHtml(
          'Групова дискусия върху <a href="https://sdabg.net/page.php?id=ss" target="_blank">съботно училищния урок</a>'
        ),
        time: {
          startHour: this.workshipTimeService.getTime(10, 0).format('HH:mm'),
          endHour: this.workshipTimeService.getTime(11, 0).format('HH:mm'),
        },
        icon: 'fas fa-comments',
      },
      {
        day: 'Събота сутрин',
        label: 'Централно богослужение',
        time: {
          startHour: this.saturdayMorningSermonStartTime().format('HH:mm'),
          endHour: this.saturdayMorningSermonEndTime().format('HH:mm'),
        },
        icon: 'fas fa-book-open',
      },
      {
        day: 'Събота вечер',
        label: 'Богослужение и молитвен час',
        time: {
          startHour: this.workshipTimeService.getTimeDST(18, 0).format('HH:mm'),
          endHour: this.workshipTimeService.getTimeDST(19, 0).format('HH:mm'),
        },
        icon: 'fas fa-user-friends',
      },
    ];
  }

}
