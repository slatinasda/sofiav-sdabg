import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../shared/services/seo.service';
import { doctrinePageMeta } from '../doctrine-seo';

@Component({
  standalone: true,
  selector: 'app-doctrine-of-restoration',
  templateUrl: './doctrine-of-restoration.component.html',
  styleUrls: ['./doctrine-of-restoration.component.scss'],
})
export class DoctrineOfRestorationComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPageMeta(
      doctrinePageMeta({
        slug: 'restoration',
        title: 'Последните събития',
        description:
          'Библията говори за Второто пришествие, възкресението и новото творение. Вижте какво учи Писанието за последните събития.',
        keywords: ['последни събития', 'Второ пришествие', 'възкресение', 'ново творение'],
      }),
    );
  }
}
