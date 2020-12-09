import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SongbookRoutingModule } from './songbook-routing.module';

import { SongbookComponent } from './songbook.component';

@NgModule({
  imports: [
    SongbookRoutingModule,
    CommonModule,
    RouterModule,
  ],
  declarations: [
    SongbookComponent,
  ]
})
export class SongbookModule { }
