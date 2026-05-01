import { enableProdMode, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeBg from '@angular/common/locales/bg';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { AppTitleService } from './app/app-title.service';
import { appRoutes } from './app/app-routes';
import { environment } from './environments/environment';
import moment from 'moment';
import 'moment/locale/bg';

registerLocaleData(localeBg, 'bg');
moment.locale('bg');

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()),
    provideZoneChangeDetection(),
    AppTitleService,
    { provide: LOCALE_ID, useValue: 'bg' },
  ],
}).catch((err) => console.error(err));
