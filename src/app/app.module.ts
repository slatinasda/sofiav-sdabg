import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Application modules
import { AppRoutingModule } from './app-routing.module';
import { AppTitleService } from './app-title.service';
import { HomeModule } from './home/home.module';
import { NotFoundModule } from './not-found/not-found.module';

// App is our top-level component
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HomeModule,
    NotFoundModule,
    AppRoutingModule,
  ],
  providers: [
    AppTitleService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
