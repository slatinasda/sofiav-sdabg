import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BeliefsRoutingModule } from './beliefs-routing.module';

import { BeliefsComponent } from './beliefs.component';
import { DoctrineOfGodComponent } from './doctrine-of-god/doctrine-of-god.component';
import { DoctrineOfHumanityComponent } from './doctrine-of-humanity/doctrine-of-humanity.component';

@NgModule({
  imports: [
    BeliefsRoutingModule,
    RouterModule,
  ],
  declarations: [
    BeliefsComponent,
    DoctrineOfGodComponent,
    DoctrineOfHumanityComponent,
  ]
})
export class BeliefsModule { }
