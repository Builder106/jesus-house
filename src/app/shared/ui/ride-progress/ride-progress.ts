import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * jh-ride-progress — THE SIGNATURE MOTIF.
 *
 * A fixed thin vertical rail near the left margin with a small side-view car
 * (inline SVG, jh-red) whose vertical position tracks document scroll progress
 * 0 → 1. The rail fills jh-red behind the car as you descend the page —
 * echoing the Ride Ministry: "No car? No problem — we'll come get you."
 *
 * Behaviour:
 *   • Hidden below 1024px (the rail would crowd narrow layouts).
 *   • Fully hidden + static under prefers-reduced-motion.
 *   • Browser-only: a passive scroll listener schedules a single rAF that
 *     reads scroll position and writes a `--p` custom property (0 → 1). All
 *     visual motion is CSS driven off `--p`, so the JS does no layout-thrash.
 *
 * SSR / no-JS safety: the rail is gated on the `enabled` signal (starts
 * false). The server renders nothing; the signal only flips true in
 * afterNextRender when the viewport is wide enough AND motion is allowed. It
 * is aria-hidden and pointer-events:none, so it is decorative only and never
 * intercepts input or affects layout (position: fixed).
 */
@Component({
  selector: 'jh-ride-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ride-progress.html',
  styleUrl: './ride-progress.css',
})
export class RideProgress {
  protected readonly enabled = signal(false);

  private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');
  private readonly platformId = inject(PLATFORM_ID);

  private ticking = false;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const mqWide = window.matchMedia('(min-width: 1024px)');

      const sync = () => {
        // Show only on wide screens with motion allowed.
        this.enabled.set(mqWide.matches && !mqMotion.matches);
        if (this.enabled()) {
          // Defer one frame so the @if-rendered rail exists before we measure.
          requestAnimationFrame(() => this.update());
        }
      };

      sync();
      mqMotion.addEventListener('change', sync);
      mqWide.addEventListener('change', sync);

      const onScroll = () => {
        if (!this.enabled() || this.ticking) return;
        this.ticking = true;
        requestAnimationFrame(() => {
          this.update();
          this.ticking = false;
        });
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });

      // Recompute when document height shifts from causes other than scroll —
      // late web-font layout shift and lazy images would otherwise leave the
      // car reading a stale position until the next scroll tick.
      document.fonts?.ready.then(() => onScroll());
      if ('ResizeObserver' in window) {
        new ResizeObserver(() => onScroll()).observe(document.documentElement);
      }
    });
  }

  private update(): void {
    const el = this.rail()?.nativeElement;
    if (!el) return;

    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    el.style.setProperty('--p', String(progress));
  }
}
