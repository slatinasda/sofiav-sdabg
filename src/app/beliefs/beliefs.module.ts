import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BeliefsRoutingModule } from './beliefs-routing.module';

import { BeliefsComponent } from './beliefs.component';

@NgModule({
  imports: [
    BeliefsRoutingModule,
    RouterModule,
  ],
  declarations: [
    BeliefsComponent,
  ]
})
export class BeliefsModule { }
