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
import { ScrollScrubber } from '../../motion/scroll-scrubber';

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
 *   • Browser-only: the per-frame read (scroll position) + write (`--p`)
 *     goes through the shared ScrollScrubber (see scene.directive.ts's doc
 *     comment) rather than its own scroll listener, so this component's
 *     geometry read can't be sandwiched between two other components'
 *     writes and force a synchronous layout. All visual motion is CSS
 *     driven off `--p`.
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
  private readonly scrollScrubber = inject(ScrollScrubber);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const mqWide = window.matchMedia('(min-width: 1024px)');
      let active = false;
      let unregister: (() => void) | null = null;

      // READ only — no DOM writes. Runs in the scrubber's batched read phase.
      const measure = (): number => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      };

      // WRITE only — no layout reads. Runs in the scrubber's batched write phase.
      const apply = (progress: number) => {
        const el = this.rail()?.nativeElement;
        if (el) el.style.setProperty('--p', String(progress));
      };

      const sync = () => {
        // Show only on wide screens with motion allowed.
        const on = mqWide.matches && !mqMotion.matches;
        this.enabled.set(on);
        if (on === active) return;
        active = on;
        if (on) {
          // register() schedules the first batched read+write a frame out,
          // by which point the @if-rendered rail already exists (the signal
          // write above flushes change detection before the next rAF).
          unregister = this.scrollScrubber.register({ measure, apply });
        } else {
          unregister?.();
          unregister = null;
        }
      };

      sync();
      mqMotion.addEventListener('change', sync);
      mqWide.addEventListener('change', sync);

      // Recompute when document height shifts from causes other than scroll —
      // late web-font layout shift and lazy images would otherwise leave the
      // car reading a stale position until the next scroll tick.
      document.fonts?.ready.then(() => this.scrollScrubber.requestUpdate());
      if ('ResizeObserver' in window) {
        new ResizeObserver(() => this.scrollScrubber.requestUpdate()).observe(
          document.documentElement,
        );
      }
    });
  }
}
