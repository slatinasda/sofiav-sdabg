import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { interval } from 'rxjs';

import { CHURCH_DISTRICT, CHURCH_FAMILY_NAME, CHURCH_PLACE_NAME } from '../../shared/church-info';
import { HeroLessonCardComponent } from '../hero-lesson-card/hero-lesson-card.component';
import { ChurchAgendaService } from '../services/church-agenda.service';

const LIVE_STATUS_REFRESH_MS = 60_000;

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, HeroLessonCardComponent],
  selector: 'app-home-hero',
  templateUrl: './home-hero.component.html',
  styleUrls: ['./home-hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block' },
})
export class HomeHeroComponent {
  protected readonly agenda = inject(ChurchAgendaService);
  protected readonly churchFamilyName = CHURCH_FAMILY_NAME;
  protected readonly churchPlaceName = CHURCH_PLACE_NAME;
  protected readonly churchDistrict = CHURCH_DISTRICT;

  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLiveNow = signal(false);

  constructor() {
    // Time-dependent state must not be evaluated during hydration, or the
    // prerendered markup (always "not live") would mismatch the client render.
    afterNextRender(() => {
      this.updateLiveStatus();
      interval(LIVE_STATUS_REFRESH_MS)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.updateLiveStatus());
    });
  }

  private updateLiveStatus(): void {
    this.isLiveNow.set(this.agenda.isLiveNow());
  }
}
