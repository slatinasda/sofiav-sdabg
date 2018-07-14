import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-beliefs',
  templateUrl: './beliefs.component.html',
  styleUrls: ['./beliefs.component.scss']
})
export class BeliefsComponent {
  constructor(private titleService: Title) {
    // TODO Create custom title service which is going to add site name automatically
    this.titleService.setTitle('Вярвания | Църква на Адвентистите от Седмия Ден - София "В" Слатина');
  }
}
