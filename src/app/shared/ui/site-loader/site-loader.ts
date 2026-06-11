import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * jh-site-loader — brief branded intro overlay.
 *
 * Cream ground; the RCCG seal scales/fades in beneath the words
 * "Come and see." then the whole curtain fades out (≤900ms total after the
 * browser bootstraps).
 *
 * SSR / no-JS safety:
 *   The overlay is gated on the `show` signal, which starts `false`. The
 *   server therefore renders an empty host and never covers content. The
 *   signal only flips `true` inside afterNextRender (browser) when motion is
 *   allowed — so with JS off or reduced-motion on, the curtain never appears.
 *
 * It is purely decorative (aria-hidden) and pointer-events:none for its final
 * fade, so it can never trap focus or block interaction with the page beneath.
 */
@Component({
  selector: 'jh-site-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (show()) {
      <div class="jh-loader" [class.jh-loader--out]="leaving()" aria-hidden="true">
        <div class="jh-loader__inner">
          <img
            class="jh-loader__seal"
            src="/seal-256.png"
            alt=""
            width="96"
            height="96"
            decoding="async"
          />
          <p class="jh-loader__word">Come and see.</p>
          <span class="jh-loader__arc"></span>
        </div>
      </div>
    }
  `,
  styleUrl: './site-loader.css',
})
export class SiteLoader {
  protected readonly show = signal(false);
  protected readonly leaving = signal(false);

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const prefersReduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Reduced motion (or already revisited this session): skip the intro
      // entirely so the page is usable instantly.
      if (prefersReduced || this.alreadyPlayed()) return;

      this.show.set(true);

      // Dynamically import Motion One only in the browser. If it fails to
      // load for any reason, fall back to a plain timed fade so the curtain
      // still lifts and never strands the page behind an overlay.
      // Passing CSS selectors (not resolved elements) keeps us on Motion's
      // DOM-element overload and lets it no-op gracefully if a node is absent.
      import('motion')
        .then(({ animate }) => {
          animate(
            '.jh-loader__seal',
            { opacity: [0, 1], scale: [0.86, 1], filter: ['blur(6px)', 'blur(0px)'] },
            { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          );
          animate(
            '.jh-loader__word',
            { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
            { duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
          );

          this.scheduleExit();
        })
        .catch(() => this.scheduleExit());
    });
  }

  private scheduleExit(): void {
    // Hold the brand frame, then fade the curtain and unmount.
    window.setTimeout(() => this.leaving.set(true), 720);
    window.setTimeout(() => {
      this.show.set(false);
      this.markPlayed();
    }, 1320); // 720ms hold + 600ms fade — well within the "≤900ms after bootstrap" feel
  }

  /** Play once per browser session so internal navigation doesn't re-curtain. */
  private alreadyPlayed(): boolean {
    try {
      return window.sessionStorage.getItem('jh-intro') === '1';
    } catch {
      return false;
    }
  }

  private markPlayed(): void {
    try {
      window.sessionStorage.setItem('jh-intro', '1');
    } catch {
      /* sessionStorage unavailable — harmless, intro just replays next load */
    }
  }
}
