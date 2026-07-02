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
import { isDarkGroundInBand } from '../../motion/dark-ground';
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
 *   • Dark-ground aware (same `data-jh-header-dark` marks + `dark-ground.ts`
 *     helper the header uses): the untraveled track is a quiet violet-grey
 *     tint on the cream ground, but that colour is nearly invisible on cream
 *     itself (owner feedback, 2026-07-02: "nearly invisible at 1440... reads
 *     as a stray line on dark scenes") and reads as a stray pale thread once
 *     it crosses a night scene. `.jh-rail--dark` swaps the track to a
 *     translucent gold, matching the gold-on-dark accent used everywhere
 *     else on the page (eyebrows, script-eyebrows). The rail's own band is
 *     computed analytically (fixed, vertically centred, `--rail-h` tall) —
 *     no DOM measurement needed for a `position: fixed` element.
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
  protected readonly onDark = signal(false);

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
      // Rail band computed analytically (matches --rail-h: 62vh, centred) —
      // cheaper and simpler than measuring a position:fixed element's own
      // rect, and correct by construction since the CSS defines that geometry.
      const measure = (): { progress: number; dark: boolean } => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        const railH = window.innerHeight * 0.62;
        const top = (window.innerHeight - railH) / 2;
        const dark = isDarkGroundInBand(top, top + railH);
        return { progress, dark };
      };

      // WRITE only — no layout reads. Runs in the scrubber's batched write phase.
      const apply = ({ progress, dark }: { progress: number; dark: boolean }) => {
        const el = this.rail()?.nativeElement;
        if (el) el.style.setProperty('--p', String(progress));
        this.onDark.set(dark);
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
