import { Component } from '@angular/core';
import { AppTitleService } from '../app-title.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  constructor(private appTitleService: AppTitleService) {
    this.appTitleService.setTitle('404');
  }
}
