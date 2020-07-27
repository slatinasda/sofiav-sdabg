import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { PipesModule } from '../shared/pipes/pipes.module';
import { WorshipTimeService } from './services/worship-time.service';

@NgModule({
  imports: [
    HomeRoutingModule,
    CommonModule,
    PipesModule,
  ],
  declarations: [HomeComponent],
  providers: [
    WorshipTimeService,
  ],
})
export class HomeModule { }
