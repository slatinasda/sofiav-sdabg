import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeBg from '@angular/common/locales/bg';

// Application modules
import { AppRoutingModule } from './app-routing.module';
import { AppTitleService } from './app-title.service';
import { HomeModule } from './home/home.module';
import { NotFoundModule } from './not-found/not-found.module';

// App is our top-level component
import { AppComponent } from './app.component';

registerLocaleData(localeBg, 'bg');

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HomeModule,
    NotFoundModule,
    AppRoutingModule,
  ],
  providers: [
    AppTitleService,
    { provide: LOCALE_ID, useValue: 'bg' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
