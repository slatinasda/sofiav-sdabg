import { Routes } from '@angular/router';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { blogPostResolver } from './blog-post.resolver';

export const blogRoutes: Routes = [
  { path: '', component: BlogListComponent, pathMatch: 'full' },
  { path: 'page/:page', component: BlogListComponent },
  { path: 'category/:category', component: BlogListComponent },
  { path: ':slug', component: BlogPostComponent, resolve: { post: blogPostResolver } },
];
