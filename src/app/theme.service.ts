import { Injectable, PLATFORM_ID, Inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser: boolean;
  private mediaQuery?: MediaQueryList;

  readonly mode = signal<ThemeMode>('system');
  readonly resolvedTheme = signal<ResolvedTheme>('light');

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (!this.isBrowser) {
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    this.mode.set(stored === 'light' || stored === 'dark' ? stored : 'system');

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', () => {
      if (this.mode() === 'system') {
        this.applyTheme();
      }
    });

    this.applyTheme();
  }

  setMode(mode: ThemeMode) {
    this.mode.set(mode);
    if (!this.isBrowser) {
      return;
    }

    if (mode === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }

    this.applyTheme();
  }

  private computeResolvedTheme(): ResolvedTheme {
    if (this.mode() === 'system') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }

    return this.mode() as ResolvedTheme;
  }

  private applyTheme() {
    const resolved = this.computeResolvedTheme();
    this.resolvedTheme.set(resolved);
    document.documentElement.setAttribute('data-bs-theme', resolved);
  }
}
