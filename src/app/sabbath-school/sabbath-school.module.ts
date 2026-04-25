import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SabbathSchoolRoutingModule } from './sabbath-school-routing.module';

import { SabbathSchoolComponent } from './sabbath-school.component';

@NgModule({
  imports: [
    SabbathSchoolRoutingModule,
    CommonModule,
    RouterModule,
  ],
  declarations: [
    SabbathSchoolComponent,
  ]
})
export class SabbathSchoolModule { }
