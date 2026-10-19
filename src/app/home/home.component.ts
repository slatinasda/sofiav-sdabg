import { Component, inject, OnInit } from '@angular/core';

import { CHURCH_NAME } from '../shared/church-info';
import { OG_IMAGE_ALT, OG_IMAGES, SeoService } from '../shared/services/seo.service';
import { ChurchAgendaService } from './services/church-agenda.service';
import { ChurchScheduleComponent } from './church-schedule/church-schedule.component';
import { HomeHeroComponent } from './hero/home-hero.component';
import { LatestPostsComponent } from './latest-posts/latest-posts.component';
import { LatestSermonsComponent } from './latest-sermons/latest-sermons.component';
import { LiveStreamComponent } from './live-stream/live-stream.component';

@Component({
  standalone: true,
  imports: [
    HomeHeroComponent,
    LiveStreamComponent,
    ChurchScheduleComponent,
    LatestSermonsComponent,
    LatestPostsComponent,
  ],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [ChurchAgendaService],
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPageMeta({
      title: 'Начало',
      socialTitle: CHURCH_NAME,
      description: `${CHURCH_NAME}. Богослужения всяка събота, групови дискусии, проповеди и песни. Заповядайте!`,
      path: '',
      image: OG_IMAGES.default,
      imageAlt: OG_IMAGE_ALT,
      keywords: [
        'адвентна църква София',
        'адвентна църква Слатина',
        'църква Слатина',
        'съботно училище',
        'богослужение София',
        'адвентисти от седмия ден',
      ],
    });
  }
}
