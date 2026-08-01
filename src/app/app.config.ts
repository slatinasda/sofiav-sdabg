import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withNoIncrementalHydration,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppTitleService } from './app-title.service';
import { appRoutes } from './app-routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideZoneChangeDetection(),
    AppTitleService,
    { provide: LOCALE_ID, useValue: 'bg' },
    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
  ],
};
