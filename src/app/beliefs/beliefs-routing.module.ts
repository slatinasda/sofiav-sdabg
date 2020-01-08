import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BeliefsComponent } from './beliefs.component';
import { DoctrineOfGodComponent } from './doctrine-of-god/doctrine-of-god.component';
import { DoctrineOfHumanityComponent } from './doctrine-of-humanity/doctrine-of-humanity.component';
import { DoctrineOfSalvationComponent } from './doctrine-of-salvation/doctrine-of-salvation.component';
import { DoctrineOfChurchComponent } from './doctrine-of-church/doctrine-of-church.component';
import { DoctrineOfLivingComponent } from './doctrine-of-living/doctrine-of-living.component';
import { DoctrineOfRestorationComponent } from './doctrine-of-restoration/doctrine-of-restoration.component';


const beliefsRoutes: Routes = [
  {
    path: '',
    component: BeliefsComponent,
    children: [
      // Redirect /beliefs to /beliefs/god
      { path: '', redirectTo: 'god', pathMatch: 'full' },
      { path: 'god', component: DoctrineOfGodComponent },
      { path: 'humanity', component: DoctrineOfHumanityComponent },
      { path: 'salvation', component: DoctrineOfSalvationComponent },
      { path: 'church', component: DoctrineOfChurchComponent },
      { path: 'living', component: DoctrineOfLivingComponent },
      { path: 'restoration', component: DoctrineOfRestorationComponent },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(beliefsRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class BeliefsRoutingModule { }
