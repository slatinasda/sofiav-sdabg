import { isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  Provider,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';

import { ThemeService } from '../../../theme.service';
import {
  DEFAULT_READER_SIZE,
  DEFAULT_READER_THEME,
  MAX_READER_SIZE,
  MIN_READER_SIZE,
  READER_TYPOGRAPHY,
  ReaderSize,
  ReaderTheme,
  clampReaderSize,
  isReaderTheme,
} from './reader-settings.types';

const SEPIA_READER_THEME: ReaderTheme = 'sepia';

/** Storage scope for a reader instance, e.g. `songbook` or `ss`. */
export const READER_SETTINGS_SCOPE = new InjectionToken<string>('READER_SETTINGS_SCOPE');

/**
 * Provides reader settings scoped to a host component. Each scope persists to
 * its own localStorage keys, so readers don't overwrite each other's settings.
 */
export function provideReaderSettings(scope: string): Provider[] {
  return [ReaderSettingsService, { provide: READER_SETTINGS_SCOPE, useValue: scope }];
}

@Injectable()
export class ReaderSettingsService {
  private readonly themeService = inject(ThemeService);
  private readonly scope = inject(READER_SETTINGS_SCOPE);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly themeKey = `${this.scope}-reader-theme`;
  private readonly sizeKey = `${this.scope}-reader-size`;

  private readonly themeState = signal<ReaderTheme>(DEFAULT_READER_THEME);
  private readonly sizeState = signal<ReaderSize>(DEFAULT_READER_SIZE);

  readonly theme = this.themeState.asReadonly();
  readonly size = this.sizeState.asReadonly();
  readonly typography = computed(() => READER_TYPOGRAPHY[this.sizeState()]);

  constructor() {
    this.load();

    if (!this.isBrowser) {
      return;
    }

    // Light/dark follow the site theme; sepia is a reader-exclusive choice.
    // Read the theme untracked so selecting a theme doesn't re-trigger this
    // effect and overwrite the user's choice.
    effect(() => {
      const resolvedTheme = this.themeService.resolvedTheme();
      const currentTheme = untracked(() => this.themeState());

      if (currentTheme === SEPIA_READER_THEME || currentTheme === resolvedTheme) {
        return;
      }

      this.themeState.set(resolvedTheme);
      this.persist(this.themeKey, resolvedTheme);
    });
  }

  setTheme(theme: ReaderTheme): void {
    if (this.themeState() === theme) {
      return;
    }

    this.themeState.set(theme);
    this.persist(this.themeKey, theme);
  }

  setSize(size: number): void {
    const nextSize = clampReaderSize(size);
    if (this.sizeState() === nextSize) {
      return;
    }

    this.sizeState.set(nextSize);
    this.persist(this.sizeKey, nextSize.toString());
  }

  increaseSize(): void {
    if (this.sizeState() >= MAX_READER_SIZE) {
      return;
    }

    this.setSize(this.sizeState() + 1);
  }

  decreaseSize(): void {
    if (this.sizeState() <= MIN_READER_SIZE) {
      return;
    }

    this.setSize(this.sizeState() - 1);
  }

  private load(): void {
    if (!this.isBrowser) {
      return;
    }

    const storedTheme = localStorage.getItem(this.themeKey);
    if (isReaderTheme(storedTheme)) {
      this.themeState.set(storedTheme);
    }

    const storedSize = Number.parseInt(localStorage.getItem(this.sizeKey) ?? '', 10);
    if (Number.isFinite(storedSize)) {
      this.sizeState.set(clampReaderSize(storedSize));
    }
  }

  private persist(key: string, value: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(key, value);
  }
}
