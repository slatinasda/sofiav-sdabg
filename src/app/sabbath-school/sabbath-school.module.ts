import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { SabbathSchoolRoutingModule } from './sabbath-school-routing.module';
import { SharedModule } from '../shared/shared.module';

import { SabbathSchoolComponent } from './sabbath-school.component';
import { SabbathSchoolQuarterliesComponent } from './sabbath-school-quarterlies/sabbath-school-quarterlies.component';
import { SabbathSchoolLessonsComponent } from './sabbath-school-lessons/sabbath-school-lessons.component';
import { SabbathSchoolReadComponent } from './sabbath-school-read/sabbath-school-read.component';

@NgModule({
  imports: [
    SabbathSchoolRoutingModule,
    CommonModule,
    RouterModule,
    HttpClientModule,
    SharedModule,
  ],
  declarations: [
    SabbathSchoolComponent,
    SabbathSchoolQuarterliesComponent,
    SabbathSchoolLessonsComponent,
    SabbathSchoolReadComponent,
  ]
})
export class SabbathSchoolModule { }
