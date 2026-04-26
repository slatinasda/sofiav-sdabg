import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SabbathSchoolComponent } from './sabbath-school.component';
import { SabbathSchoolQuarterliesComponent } from './sabbath-school-quarterlies/sabbath-school-quarterlies.component';
import { SabbathSchoolLessonsComponent } from './sabbath-school-lessons/sabbath-school-lessons.component';
import { SabbathSchoolReadComponent } from './sabbath-school-read/sabbath-school-read.component';


const sabbathSchoolRoutes: Routes = [
  {
    path: '',
    component: SabbathSchoolComponent,
    children: [
      { path: '', component: SabbathSchoolQuarterliesComponent, pathMatch: 'full' },
      { path: ':quarter', component: SabbathSchoolLessonsComponent },
      { path: ':quarter/lessons/:lesson', redirectTo: ':quarter/lessons/:lesson/01', pathMatch: 'full' },
      { path: ':quarter/lessons/:lesson/:day', component: SabbathSchoolReadComponent },
    ]
  },
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
