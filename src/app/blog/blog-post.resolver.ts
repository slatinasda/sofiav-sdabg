import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { BlogApiService } from './blog-api.service';
import { BlogPost } from './interfaces/blog-post.interface';

// A resolver (not ngOnInit) so the SSR prerenderer awaits the post's dynamic import()
// before serializing the route - ngOnInit-level loading raced prerendering and could
// freeze the page on its loading state.
export const blogPostResolver: ResolveFn<BlogPost | null> = async (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  const post = await inject(BlogApiService).getPostBySlug(slug);
  return post ?? null;
};
