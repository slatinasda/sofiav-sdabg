import { Routes } from '@angular/router';
import { VideoArchiveComponent } from './video-archive.component';

export const videoArchiveRoutes: Routes = [
  { path: '', component: VideoArchiveComponent, pathMatch: 'full' },
];
