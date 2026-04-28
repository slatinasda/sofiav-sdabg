import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';


export const appRoutes: Routes = [
  { path: 'beliefs', loadChildren: () => import('./beliefs/beliefs.routes').then(mod => mod.beliefsRoutes) },
  { path: 'songbook', loadChildren: () => import('./songbook/songbook.routes').then(mod => mod.songbookRoutes) },
  { path: 'video-archive', loadChildren: () => import('./video-archive/video-archive.routes').then(mod => mod.videoArchiveRoutes) },
  { path: 'sabbath-school', loadChildren: () => import('./sabbath-school/sabbath-school.routes').then(mod => mod.sabbathSchoolRoutes) },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];
