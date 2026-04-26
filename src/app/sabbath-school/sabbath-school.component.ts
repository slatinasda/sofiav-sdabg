import { Component } from '@angular/core';
import { AppTitleService } from '../app-title.service';

@Component({
  selector: 'app-sabbath-school',
  templateUrl: './sabbath-school.component.html',
  styleUrls: ['./sabbath-school.component.scss']
})
export class SabbathSchoolComponent {

  constructor(
    private appTitleService: AppTitleService,
  ) {
    this.appTitleService.setTitle('Съботен урок');
  }
}
