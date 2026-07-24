import { RenderMode, ServerRoute } from '@angular/ssr';
import { BLOG_PAGE_SIZE } from './blog/blog-api.service';
import generatedIndex from '../assets/blog/generated/posts-index.json';

const BLOG_POSTS = generatedIndex as { slug: string; category: string }[];

async function blogSlugParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

async function blogPageParams() {
  const totalPages = Math.max(1, Math.ceil(BLOG_POSTS.length / BLOG_PAGE_SIZE));
  // Page 1 redirects to /blog (see blog.routes.ts), so only 2..totalPages need prerendering.
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

async function blogCategoryParams() {
  return [...new Set(BLOG_POSTS.map((post) => post.category))].map((category) => ({ category }));
}

export const serverRoutes: ServerRoute[] = [
  // Content relies on an external API, so serve a client-rendered shell instead of prerendering
  {
    path: 'sabbath-school/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'video-archive/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'blog',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'blog/page/:page',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: blogPageParams,
  },
  {
    path: 'blog/category/:category',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: blogCategoryParams,
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: blogSlugParams,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
