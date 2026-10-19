import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SeoService } from '../shared/services/seo.service';
import { SABBATH_SCHOOL_PAGE_META } from './sabbath-school-seo';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-sabbath-school',
  templateUrl: './sabbath-school.component.html',
  styleUrls: ['./sabbath-school.component.scss'],
})
export class SabbathSchoolComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPageMeta(SABBATH_SCHOOL_PAGE_META);
  }
}
