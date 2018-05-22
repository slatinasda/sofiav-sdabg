import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ServiceTime } from '../shared/classes/service-time';
import { IChurchServiceAgenda } from './interfaces/church-service-agenda.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  serviceTime: ServiceTime;
  isDaylightSaving: boolean;
  saturdayMorningSermon: IChurchServiceAgenda;

  constructor(private titleService: Title) {
    // TODO Create custom title service which is going to add site name automatically
    this.titleService.setTitle('Начало | Църква на Адвентистите от Седмия Ден - София "В" Слатина');
    this.serviceTime = new ServiceTime();
  }

  ngOnInit() {
    this.isDaylightSaving = this.serviceTime.isDaylightSaving();
    this.saturdayMorningSermon = this.churchServiceAgenda().find(service => service.id === 3);
  }

  mainSectionImages(): string[] {
    return [
      'assets/img/backgrounds/bible-book-christian.jpg',
      'assets/img/backgrounds/atmosphere-blue-cloud.jpg',
      'assets/img/backgrounds/back-view-backlit-clouds.jpg',
    ];
  }

  churchServiceAgenda(): IChurchServiceAgenda[] {
    return [
      {
        id: 1,
        day: 'Петък вечер',
        label: 'Богослужение и молитвен час',
        time: this.serviceTime.calculate([18, 0], [19, 0]),
        icon: 'fas fa-book',
      },
      {
        id: 2,
        day: 'Събота сутрин',
        label: 'Групова дискусия върху съботно училищния урок',
        time: this.serviceTime.calculate([9, 0], [10, 0], false),
        icon: 'fas fa-comments',
      },
      {
        id: 3,
        day: 'Събота сутрин',
        label: 'Централно богослужение',
        time: this.serviceTime.calculate([10, 20], [11, 10], false),
        icon: 'fas fa-book-open',
      },
      {
        id: 4,
        day: 'Събота вечер',
        label: 'Богослужение и молитвен час',
        time: this.serviceTime.calculate([18, 0], [19, 0]),
        icon: 'fas fa-user-friends',
      },
    ];
  }

}
