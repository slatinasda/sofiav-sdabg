import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OG_IMAGE_ALT, OG_IMAGES, SeoService } from '../shared/services/seo.service';

interface BeliefCategory {
  path: string;
  title: string;
  icon: string;
  teachingsCount: number;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-beliefs',
  templateUrl: './beliefs.component.html',
  styleUrls: ['./beliefs.component.scss'],
})
export class BeliefsComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly categories: BeliefCategory[] = [
    { path: 'god', title: 'Бог', icon: 'fa-dove', teachingsCount: 5 },
    { path: 'humanity', title: 'Човека', icon: 'fa-users', teachingsCount: 2 },
    { path: 'salvation', title: 'Спасението', icon: 'fa-life-ring', teachingsCount: 4 },
    { path: 'church', title: 'Църквата', icon: 'fa-church', teachingsCount: 7 },
    { path: 'living', title: 'Християнския живот', icon: 'fa-hands-helping', teachingsCount: 5 },
    {
      path: 'restoration',
      title: 'Събитията от последното време',
      icon: 'fa-hourglass-half',
      teachingsCount: 5,
    },
  ];

  ngOnInit(): void {
    this.seo.setPageMeta({
      title: 'Вярвания',
      socialTitle: 'Вярвания: 28 библейски учения',
      description:
        '28-те основни библейски учения на Адвентистите от седмия ден, подредени в 6 теми: Бог, човекът, спасението, църквата, християнският живот и последните събития.',
      path: 'beliefs',
      image: OG_IMAGES.beliefs,
      imageAlt: OG_IMAGE_ALT,
      keywords: [
        'адвентни вярвания',
        'библейски учения',
        '28 учения',
        'християнска вяра',
        'адвентисти от седмия ден',
      ],
    });
  }
}
