import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Application modules
import { AppRoutingModule } from './app-routing.module';
import { HomeModule } from './home/home.module';

// App is our top-level component
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HomeModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
