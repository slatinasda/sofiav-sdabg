import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Църква на Адвентистите от Седмия Ден - София "В" Слатина');
  }
}
