import { bootstrapApplication } from '@angular/platform-browser';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Vercel Analytics + Speed Insights are browser-only; this entry point
    // only runs in the browser, but guard anyway so it can never leak into SSR.
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      inject();
      injectSpeedInsights();
    }
  })
  .catch((err) => console.error(err));
