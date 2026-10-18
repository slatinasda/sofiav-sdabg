import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ChurchAgendaService } from '../services/church-agenda.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-church-schedule',
  templateUrl: './church-schedule.component.html',
  styleUrls: ['./church-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block' },
})
export class ChurchScheduleComponent {
  protected readonly agenda = inject(ChurchAgendaService);

  protected trackByIndex(index: number): number {
    return index;
  }
}
