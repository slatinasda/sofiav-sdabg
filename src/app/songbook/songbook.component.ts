import { Component } from '@angular/core';

import { AppTitleService } from '../app-title.service';
import { RangePagination } from './range-pagination';


@Component({
  selector: 'app-songbook',
  templateUrl: './songbook.component.html',
  styleUrls: ['./songbook.component.scss']
})
export class SongbookComponent {
  public organPagination = new RangePagination(1, 25, 300);

  constructor(
    private appTitleService: AppTitleService,
  ) {
    this.appTitleService.setTitle('Песни');
  }

  organSongNumbers(): number[] {
    const [start, end] = this.organPagination.getCurrentRange();
    return Array.from({ length: end - start }, (_, ind) => ind + 1 + start)
  }
}
