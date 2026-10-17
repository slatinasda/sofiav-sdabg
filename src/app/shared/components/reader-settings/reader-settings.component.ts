import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ReaderSettingsService } from './reader-settings.service';
import {
  MAX_READER_SIZE,
  MIN_READER_SIZE,
  READER_THEMES,
  ReaderTheme,
} from './reader-settings.types';

@Component({
  selector: 'app-reader-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reader-settings.component.html',
  styleUrls: ['./reader-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReaderSettingsComponent {
  protected readonly settings = inject(ReaderSettingsService);

  protected readonly themes = READER_THEMES;
  protected readonly minSize = MIN_READER_SIZE;
  protected readonly maxSize = MAX_READER_SIZE;

  protected selectTheme(theme: ReaderTheme): void {
    this.settings.setTheme(theme);
  }

  protected decreaseSize(): void {
    this.settings.decreaseSize();
  }

  protected increaseSize(): void {
    this.settings.increaseSize();
  }
}
