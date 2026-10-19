import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../shared/services/seo.service';
import { doctrinePageMeta } from '../doctrine-seo';

@Component({
  standalone: true,
  selector: 'app-doctrine-of-humanity',
  templateUrl: './doctrine-of-humanity.component.html',
  styleUrls: ['./doctrine-of-humanity.component.scss'],
})
export class DoctrineOfHumanityComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPageMeta(
      doctrinePageMeta({
        slug: 'humanity',
        title: 'Човекът',
        description:
          'Човекът е създаден по Божи образ с достойнство, свобода и призвание. Научете какво учи Библията за произхода и смисъла на човешкия живот.',
        keywords: ['човекът', 'сътворение', 'Божи образ', 'смисъл на живота'],
      }),
    );
  }
}
