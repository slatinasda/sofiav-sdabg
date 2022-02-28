import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VideoArchiveRoutingModule } from './video-archive-routing.module';

import { VideoArchiveComponent } from './video-archive.component';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    VideoArchiveRoutingModule,
    CommonModule,
    RouterModule,
    SharedModule,
  ],
  declarations: [
    VideoArchiveComponent,
  ]
})
export class VideoArchiveModule { }
