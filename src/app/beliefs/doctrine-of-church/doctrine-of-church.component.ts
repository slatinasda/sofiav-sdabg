import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../shared/services/seo.service';
import { doctrinePageMeta } from '../doctrine-seo';

@Component({
  standalone: true,
  selector: 'app-doctrine-of-church',
  templateUrl: './doctrine-of-church.component.html',
  styleUrls: ['./doctrine-of-church.component.scss'],
})
export class DoctrineOfChurchComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPageMeta(
      doctrinePageMeta({
        slug: 'church',
        title: 'Църквата',
        description:
          'Църквата е Христовото тяло, общност от вярващи, призвана да обича, служи и свидетелства. Научете библейското учение за църквата.',
        keywords: ['църква', 'Христовото тяло', 'общност', 'служене', 'свидетелство'],
      }),
    );
  }
}
