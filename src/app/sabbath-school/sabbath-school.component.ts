import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppTitleService } from '../app-title.service';

@Component({
  standalone: true,
  imports: [RouterModule],
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
