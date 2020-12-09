import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SongbookComponent } from './songbook.component';


const songbookRoutes: Routes = [
  { path: '', component: SongbookComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forChild(songbookRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class SongbookRoutingModule { }
