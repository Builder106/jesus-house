import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  Input,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * jhReveal — scroll-triggered fade + slide entrance.
 *
 * Usage:
 *   <h2 jhReveal>…</h2>                       <!-- fade + 16px slide-up -->
 *   <p jhReveal="120">…</p>                   <!-- 120ms stagger delay -->
 *   <div jhReveal jhRevealDir="left">…</div>  <!-- slide in from the left -->
 *
 * Contract / guarantees:
 *   • SSR + no-JS safe: renders nothing extra and leaves content fully
 *     visible. The "hidden start" state lives in global CSS gated on
 *     `html.js-motion`, which this directive adds ONLY in the browser when
 *     motion is allowed. With JS off, `js-motion` is never set, so the CSS
 *     rule never matches and content shows at full opacity.
 *   • prefers-reduced-motion: no-op. We never add `js-motion` and never run
 *     the observer; content is simply visible.
 *   • The element animates to its resting state via the `.is-revealed` class
 *     (CSS transition lives in styles.css), so no Web Animations API is
 *     needed for the per-element reveal.
 *
 * Pair with the [data-reveal] base CSS in src/styles.css. The directive sets
 * `data-reveal` from `jhRevealDir` automatically, so authors only need the
 * `jhReveal` attribute.
 */
@Directive({
  selector: '[jhReveal]',
})
export class RevealDirective {
  /** Optional stagger delay in milliseconds before the reveal animates. */
  @Input('jhReveal') delay: number | string = 0;

  /** Slide direction. 'up' (default) | 'left' | 'right' | 'none'. */
  @Input() jhRevealDir: 'up' | 'left' | 'right' | 'none' = 'up';

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    const el = this.host.nativeElement as HTMLElement;

    // Encode the chosen direction for the base CSS. Safe on the server too —
    // it only changes the *target* of an animation that never starts unless
    // js-motion is present and motion is allowed.
    el.setAttribute('data-reveal', this.jhRevealDir);

    // Everything below is browser-only and motion-gated.
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const prefersReduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Reduced motion (or no IO support): leave content visible, do nothing.
      if (prefersReduced || typeof IntersectionObserver === 'undefined') {
        return;
      }

      // Engage the base reveal CSS site-wide exactly once. Until this class is
      // on <html>, every [data-reveal] element stays fully visible.
      const root = document.documentElement;
      if (!root.classList.contains('js-motion')) {
        root.classList.add('js-motion');
      }

      const delayMs = Number(this.delay) || 0;

      const reveal = () => {
        if (delayMs > 0) {
          window.setTimeout(() => el.classList.add('is-revealed'), delayMs);
        } else {
          el.classList.add('is-revealed');
        }
      };

      // If the element is already past the fold on first paint, reveal it
      // immediately so above-the-fold content doesn't sit hidden.
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              reveal();
              observer.disconnect();
              break;
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      );

      observer.observe(el);
    });
  }
}
