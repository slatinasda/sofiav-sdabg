import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BeliefsComponent } from './beliefs.component';
import { DoctrineOfGodComponent } from './doctrine-of-god/doctrine-of-god.component';


const beliefsRoutes: Routes = [
  {
    path: 'beliefs',
    component: BeliefsComponent,
    children: [
      // Redirect /beliefs to /beliefs/god
      { path: '', redirectTo: 'god', pathMatch: 'full' },
      { path: 'god', component: DoctrineOfGodComponent },
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
