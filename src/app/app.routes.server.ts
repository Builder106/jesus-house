import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'visit',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'rcf',
    renderMode: RenderMode.Prerender
  }
];
