import { Component } from '@angular/core';

import { AppTitleService } from '../app-title.service';


@Component({
  selector: 'app-video-archive',
  templateUrl: './video-archive.component.html',
  styleUrls: ['./video-archive.component.scss']
})
export class VideoArchiveComponent {
  constructor(
    private appTitleService: AppTitleService,
  ) {
    this.appTitleService.setTitle('Архив');
  }
}
