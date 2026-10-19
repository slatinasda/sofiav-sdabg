import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../shared/services/seo.service';
import { doctrinePageMeta } from '../doctrine-seo';

@Component({
  standalone: true,
  selector: 'app-doctrine-of-salvation',
  templateUrl: './doctrine-of-salvation.component.html',
  styleUrls: ['./doctrine-of-salvation.component.scss'],
})
export class DoctrineOfSalvationComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPageMeta(
      doctrinePageMeta({
        slug: 'salvation',
        title: 'Спасението',
        description:
          'Спасението е дар по благодат чрез вяра в Исус Христос. Разберете Божия план за спасение, покаянието и новия живот.',
        keywords: ['спасение', 'благодат', 'вяра в Исус', 'покаяние', 'нов живот'],
      }),
    );
  }
}
