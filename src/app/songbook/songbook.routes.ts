import { Routes } from '@angular/router';
import { SongbookComponent } from './songbook.component';

export const songbookRoutes: Routes = [
  { path: '', component: SongbookComponent, pathMatch: 'full' },
];
