import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BeliefsRoutingModule } from './beliefs-routing.module';

import { BeliefsComponent } from './beliefs.component';
import { DoctrineOfGodComponent } from './doctrine-of-god/doctrine-of-god.component';
import { DoctrineOfHumanityComponent } from './doctrine-of-humanity/doctrine-of-humanity.component';
import { DoctrineOfSalvationComponent } from './doctrine-of-salvation/doctrine-of-salvation.component';
import { DoctrineOfChurchComponent } from './doctrine-of-church/doctrine-of-church.component';
import { DoctrineOfLivingComponent } from './doctrine-of-living/doctrine-of-living.component';

@NgModule({
  imports: [
    BeliefsRoutingModule,
    RouterModule,
  ],
  declarations: [
    BeliefsComponent,
    DoctrineOfGodComponent,
    DoctrineOfHumanityComponent,
    DoctrineOfSalvationComponent,
    DoctrineOfChurchComponent,
    DoctrineOfLivingComponent,
  ]
})
export class BeliefsModule { }
