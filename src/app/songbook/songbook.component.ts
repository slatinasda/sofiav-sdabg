import { Component } from '@angular/core';

import { AppTitleService } from '../app-title.service';
import { RangePagination } from './range-pagination';


@Component({
  selector: 'app-songbook',
  templateUrl: './songbook.component.html',
  styleUrls: ['./songbook.component.scss']
})
export class SongbookComponent {
  public pianoPagination = new RangePagination(1, 25, 200);
  public organPagination = new RangePagination(1, 25, 210);

  constructor(
    private appTitleService: AppTitleService,
  ) {
    this.appTitleService.setTitle('Песни');
  }

  pianoSongNumbers(): number[] {
    const [start, end] = this.pianoPagination.getCurrentRange();
    return Array.from({ length: end - start }, (_, ind) => ind + 1 + start)
  }

  organSongNumbers(): number[] {
    const [start, end] = this.organPagination.getCurrentRange();
    return Array.from({ length: end - start }, (_, ind) => ind + 1 + start)
  }
}
