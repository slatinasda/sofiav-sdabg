import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { BlogApiService } from './blog-api.service';
import { BlogPost } from './interfaces/blog-post.interface';

// A resolver (not ngOnInit) so the SSR prerenderer awaits the post's dynamic import()
// before serializing the route - ngOnInit-level loading raced prerendering and could
// freeze the page on its loading state.
export const blogPostResolver: ResolveFn<BlogPost | null> = async (route) => {
  const year = route.paramMap.get('year');
  const month = route.paramMap.get('month');
  const slug = route.paramMap.get('slug');

  if (!year || !month || !slug) {
    return null;
  }

  const post = await inject(BlogApiService).getPostByPath(year, month, slug);
  return post ?? null;
};
