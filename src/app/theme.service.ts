import { Injectable, PLATFORM_ID, Inject, signal, computed, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser: boolean;
  private mediaQuery?: MediaQueryList;

  readonly mode = signal<ThemeMode>('system');

  private readonly systemPrefersDark = signal(false);

  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const mode = this.mode();
    if (mode === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return mode;
  });

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      if (this.isBrowser) {
        document.documentElement.setAttribute('data-bs-theme', this.resolvedTheme());
      }
    });

    if (!this.isBrowser) {
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    this.mode.set(isThemeMode(stored) ? stored : 'system');

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemPrefersDark.set(this.mediaQuery.matches);
    this.mediaQuery.addEventListener('change', (event) => {
      this.systemPrefersDark.set(event.matches);
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    if (!this.isBrowser) {
      return;
    }

    if (mode === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }
}
