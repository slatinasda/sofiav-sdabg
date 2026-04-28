import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppTitleService } from '../app-title.service';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  constructor(private appTitleService: AppTitleService) {
    this.appTitleService.setTitle('404');
  }
}
