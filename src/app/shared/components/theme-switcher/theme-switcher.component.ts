import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeMode } from '../../../theme.service';
import { ModalComponent } from '../modal/modal.component';

export const THEME_MODES: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'system', label: 'Системна тема', icon: 'fa-desktop' },
  { value: 'light', label: 'Светла тема', icon: 'fa-sun' },
  { value: 'dark', label: 'Тъмна тема', icon: 'fa-moon' },
];

const DEFAULT_THEME_ICON = THEME_MODES[0].icon;

@Component({
  standalone: true,
  imports: [CommonModule, ModalComponent],
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
})
export class ThemeSwitcherComponent {
  readonly themeModes = THEME_MODES;
  modalOpen = false;

  constructor(public themeService: ThemeService) {}

  setTheme(mode: ThemeMode) {
    this.themeService.setMode(mode);
  }

  get currentIcon(): string {
    return (
      this.themeModes.find((t) => t.value === this.themeService.mode())?.icon ?? DEFAULT_THEME_ICON
    );
  }
}
