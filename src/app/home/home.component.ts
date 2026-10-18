import { Component } from '@angular/core';

import { AppTitleService } from '../app-title.service';
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
export class HomeComponent {
  constructor(appTitleService: AppTitleService) {
    appTitleService.setTitle('Начало');
  }
}
