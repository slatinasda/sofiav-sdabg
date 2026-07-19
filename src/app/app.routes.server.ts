import { RenderMode, ServerRoute } from '@angular/ssr';

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
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
