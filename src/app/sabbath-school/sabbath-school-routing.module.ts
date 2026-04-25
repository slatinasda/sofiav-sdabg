import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SabbathSchoolComponent } from './sabbath-school.component';


const sabbathSchoolRoutes: Routes = [
  { path: '', component: SabbathSchoolComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forChild(sabbathSchoolRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class SabbathSchoolRoutingModule { }
