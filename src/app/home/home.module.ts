import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { PipesModule } from '../shared/pipes/pipes.module';

@NgModule({
  imports: [
    HomeRoutingModule,
    PipesModule
  ],
  declarations: [HomeComponent]
})
export class HomeModule { }
