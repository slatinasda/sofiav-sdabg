import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppTitleService } from '../app-title.service';

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
export class BeliefsComponent {
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

  constructor(private appTitleService: AppTitleService) {
    this.appTitleService.setTitle('Вярвания');
  }
}
