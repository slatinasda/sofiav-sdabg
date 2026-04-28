import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SabbathSchoolApiService } from '../sabbath-school-api.service';
import { AppTitleService } from '../../app-title.service';
import { Quarterly } from '../interfaces/quarterly.interface';

interface GroupedQuarterly {
  name: string;
  order: number;
  quarterlies: Quarterly[];
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-sabbath-school-quarterlies',
  templateUrl: './sabbath-school-quarterlies.component.html',
  styleUrls: ['./sabbath-school-quarterlies.component.scss']
})
export class SabbathSchoolQuarterliesComponent implements OnInit {
  loading = false;
  quarterlies: Quarterly[] = [];
  groups: GroupedQuarterly[] = [];
  groupedQuarterlies: GroupedQuarterly[] = [];
  selectedGroup: GroupedQuarterly | null = null;

  constructor(
    private api: SabbathSchoolApiService,
    private router: Router,
    private appTitleService: AppTitleService
  ) { }

  ngOnInit() {
    this.appTitleService.setTitle('Съботен урок');
    this.getQuarterlies();
  }

  getQuarterlies(): void {
    this.loading = true;
    this.api.getQuarterlies().subscribe({
      next: (data: Quarterly[]) => {
        this.quarterlies = data;
        this.groupQuarterlies();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private groupQuarterlies(): void {
    const emptyGroup: Quarterly[] = [];
    this.groupedQuarterlies = [];

    for (const quarterly of this.quarterlies) {
      if (quarterly.quarterly_group) {
        const quarterlyGroup: GroupedQuarterly = {
          name: quarterly.quarterly_group.name,
          order: quarterly.quarterly_group.order,
          quarterlies: [quarterly]
        };
        const quarterlyGroupIndex = this.groupedQuarterlies.findIndex(
          (item: GroupedQuarterly) => item.name === quarterlyGroup.name
        );
        if (quarterlyGroupIndex < 0) {
          this.groupedQuarterlies.push(quarterlyGroup);
        } else {
          this.groupedQuarterlies[quarterlyGroupIndex].quarterlies.push(quarterly);
        }
      } else {
        emptyGroup.push(quarterly);
      }
    }

    if (this.groupedQuarterlies.length) {
      this.groupedQuarterlies[0].quarterlies = [
        ...this.groupedQuarterlies[0].quarterlies,
        ...emptyGroup
      ];
      this.groupedQuarterlies = this.groupedQuarterlies.sort(
        (a: GroupedQuarterly, b: GroupedQuarterly) => a.order - b.order
      );
    }

    // Filter out "Уроци за юноши" as they require a PDF reader
    this.groupedQuarterlies = this.groupedQuarterlies.filter(q => q.name !== 'Уроци за юноши');
  }

  navigateToQuarterly(quarterlyId: string): void {
    this.router.navigate(['/sabbath-school', quarterlyId]);
  }
}
