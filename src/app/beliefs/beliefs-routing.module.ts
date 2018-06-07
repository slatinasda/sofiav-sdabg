import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BeliefsComponent } from './beliefs.component';


const beliefsRoutes: Routes = [
  {
    path: 'beliefs',
    component: BeliefsComponent,
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
