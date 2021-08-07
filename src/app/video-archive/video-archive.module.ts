import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VideoArchiveRoutingModule } from './video-archive-routing.module';

import { VideoArchiveComponent } from './video-archive.component';

@NgModule({
  imports: [
    VideoArchiveRoutingModule,
    CommonModule,
    RouterModule,
  ],
  declarations: [
    VideoArchiveComponent,
  ]
})
export class VideoArchiveModule { }
