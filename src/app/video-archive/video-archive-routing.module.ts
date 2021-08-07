import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoArchiveComponent } from './video-archive.component';


const videoArchiveRoutes: Routes = [
  { path: '', component: VideoArchiveComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forChild(videoArchiveRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class VideoArchiveRoutingModule { }
