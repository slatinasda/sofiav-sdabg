import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AppTitleService } from '../app-title.service';
import { IChurchServiceAgenda } from './interfaces/church-service-agenda.interface';
import { WorshipTimeService } from './services/worship-time.service';

const serviceTimes = require('./agenda/service-times.json');
const serviceTimesDST = require('./agenda/service-times-dst.json');


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

  serviceTimesMoment(): { [key: string]: moment.Moment } {
    const times = this.isDaylightSaving ? serviceTimesDST : serviceTimes;
    const agenda = {};

    Object.keys(times).forEach(serviceTimeKey => {
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
          'Групова дискусия върху <a href="https://sabbath-school.adventech.io/bg/" target="_blank">съботно училищния урок</a>'
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
      // {
      //   day: 'Събота вечер',
      //   label: 'Богослужение и молитвен час',
      //   time: {
      //     startHour: agenda['saturdayEveningSermonStart'].format('HH:mm'),
      //     endHour: agenda['saturdayEveningSermonEnd'].format('HH:mm'),
      //   },
      //   icon: 'fas fa-user-friends',
      // },
    ];
  }

}
