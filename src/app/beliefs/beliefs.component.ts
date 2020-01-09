import { Component, OnInit } from '@angular/core';
import { AppTitleService } from '../app-title.service';

@Component({
  selector: 'app-beliefs',
  templateUrl: './beliefs.component.html',
  styleUrls: ['./beliefs.component.scss']
})
export class BeliefsComponent {
  constructor(private appTitleService: AppTitleService) {
    this.appTitleService.setTitle('Вярвания');
  }
}
