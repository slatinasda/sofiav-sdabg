import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../shared/services/seo.service';
import { doctrinePageMeta } from '../doctrine-seo';

@Component({
  standalone: true,
  selector: 'app-doctrine-of-god',
  templateUrl: './doctrine-of-god.component.html',
  styleUrls: ['./doctrine-of-god.component.scss'],
})
export class DoctrineOfGodComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPageMeta(
      doctrinePageMeta({
        slug: 'god',
        title: 'Бог',
        description:
          'Бог е един, вечен и всемогъщ: Отец, Син и Свети Дух. Разберете библейското учение за Бога, Неговия характер и Неговите дела.',
        keywords: ['Бог', 'Света Троица', 'Отец', 'Син', 'Свети Дух'],
      }),
    );
  }
}
