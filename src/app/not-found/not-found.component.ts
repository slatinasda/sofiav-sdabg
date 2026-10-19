import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SeoService } from '../shared/services/seo.service';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.seo.setPageMeta({
      title: 'Страницата не е намерена',
      description: 'Страницата, която търсите, не съществува или е преместена.',
      path: this.router.url,
      noIndex: true,
    });
  }
}
