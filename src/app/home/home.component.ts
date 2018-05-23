import { Component, OnInit } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';

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
  saturdayMorningStreamStartTime = '10:40';

  constructor(
    private titleService: Title,
    private sanitizer: DomSanitizer,
  ) {
    // TODO Create custom title service which is going to add site name automatically
    this.titleService.setTitle('Начало | Църква на Адвентистите от Седмия Ден - София "В" Слатина');
    this.serviceTime = new ServiceTime();
  }

  ngOnInit() {
    this.isDaylightSaving = this.serviceTime.isDaylightSaving();
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
        day: 'Петък вечер',
        label: 'Богослужение и молитвен час',
        time: this.serviceTime.calculate([18, 0], [19, 0]),
        icon: 'fas fa-book',
      },
      {
        day: 'Събота сутрин',
        label: this.sanitizer.bypassSecurityTrustHtml(
          'Групова дискусия върху <a href="http://sdabg.net/page.php?id=ss" target="_blank">съботно училищния урок</a>'
        ),
        time: this.serviceTime.calculate([9, 0], [10, 0], false),
        icon: 'fas fa-comments',
      },
      {
        day: 'Събота сутрин',
        label: 'Централно богослужение',
        time: this.serviceTime.calculate([10, 20], [11, 10], false),
        icon: 'fas fa-book-open',
      },
      {
        day: 'Събота вечер',
        label: 'Богослужение и молитвен час',
        time: this.serviceTime.calculate([18, 0], [19, 0]),
        icon: 'fas fa-user-friends',
      },
    ];
  }

}
