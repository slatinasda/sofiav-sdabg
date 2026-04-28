import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppTitleService } from '../app-title.service';
import { BibleStudiesCtaComponent } from '../shared/components/bible-studies-cta/bible-studies-cta.component';

@Component({
  standalone: true,
  imports: [RouterModule, BibleStudiesCtaComponent],
  selector: 'app-beliefs',
  templateUrl: './beliefs.component.html',
  styleUrls: ['./beliefs.component.scss'],
})
export class BeliefsComponent {
  constructor(private appTitleService: AppTitleService) {
    this.appTitleService.setTitle('Вярвания');
  }
}
