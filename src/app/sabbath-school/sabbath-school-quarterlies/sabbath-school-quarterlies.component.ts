import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./sabbath-school-quarterlies.component.scss'],
})
export class SabbathSchoolQuarterliesComponent implements OnInit {
  private static readonly YOUTH_GROUP_NAME = 'Уроци за юноши';

  loading = false;
  quarterlies: Quarterly[] = [];
  groupedQuarterlies: GroupedQuarterly[] = [];

  constructor(
    private api: SabbathSchoolApiService,
    private router: Router,
    private appTitleService: AppTitleService,
    private cdr: ChangeDetectorRef,
  ) {}

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
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private groupQuarterlies(): void {
    const groups = new Map<string, GroupedQuarterly>();
    const ungrouped: Quarterly[] = [];

    for (const quarterly of this.quarterlies) {
      if (!quarterly.quarterly_group) {
        ungrouped.push(quarterly);
        continue;
      }

      const { name, order } = quarterly.quarterly_group;
      const existing = groups.get(name);
      if (existing) {
        existing.quarterlies.push(quarterly);
      } else {
        groups.set(name, { name, order, quarterlies: [quarterly] });
      }
    }

    // Filter out "Уроци за юноши" as they require a PDF reader
    this.groupedQuarterlies = [...groups.values()]
      .filter((group) => group.name !== SabbathSchoolQuarterliesComponent.YOUTH_GROUP_NAME)
      .sort((a, b) => a.order - b.order);

    if (this.groupedQuarterlies.length && ungrouped.length) {
      this.groupedQuarterlies[0].quarterlies.push(...ungrouped);
    }
  }

  navigateToQuarterly(quarterlyId: string): void {
    this.router.navigate(['/sabbath-school', quarterlyId]);
  }
}
