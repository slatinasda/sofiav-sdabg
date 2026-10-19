import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../shared/services/seo.service';
import { doctrinePageMeta } from '../doctrine-seo';

@Component({
  standalone: true,
  selector: 'app-doctrine-of-living',
  templateUrl: './doctrine-of-living.component.html',
  styleUrls: ['./doctrine-of-living.component.scss'],
})
export class DoctrineOfLivingComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPageMeta(
      doctrinePageMeta({
        slug: 'living',
        title: 'Християнският живот',
        description:
          'Християнският живот се изразява в любов, послушание и служба. Научете основните библейски принципи за ежедневния живот с Бога.',
        keywords: ['християнски живот', 'любов', 'послушание', 'служба', 'духовен растеж'],
      }),
    );
  }
}
