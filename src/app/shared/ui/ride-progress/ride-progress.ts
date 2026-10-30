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
 * jh-ride-progress — THE SIGNATURE MOTIF, and the page's own scrollbar.
 *
 * A short stretch of road near the left margin with a red car, seen from
 * above, whose position down the road tracks document scroll progress 0 → 1,
 * echoing the Ride Ministry: "No car? No problem, we'll come get you." Every
 * element marked `data-stop="Label"` on the page becomes a stop line across
 * the road at its share of the scroll; hovering or focusing one shows its
 * street sign, and choosing it drives there.
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
 * afterNextRender when the viewport is wide enough AND motion is allowed.
 * Only the stop buttons take pointer input (a small nav landmark); the road
 * and car are aria-hidden, and nothing affects layout (position: fixed).
 */
@Component({
  selector: 'app-ride-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ride-progress.html',
  styleUrl: './ride-progress.css',
})
export class RideProgress {
  protected readonly enabled = signal(false);
  protected readonly onDark = signal(false);
  /** The page's stops: each `data-stop` element's label and share of the scroll. */
  protected readonly stops = signal<readonly { label: string; at: number }[]>([]);

  private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scrollScrubber = inject(ScrollScrubber);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (typeof window.matchMedia !== 'function') return;

      const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const mqWide = window.matchMedia('(min-width: 1024px)');
      let active = false;
      let unregister: (() => void) | null = null;

      // READ only — no DOM writes. Runs in the scrubber's batched read phase.
      // Rail band computed analytically (matches --rail-h: 62vh, centred) —
      // cheaper and simpler than measuring a position:fixed element's own
      // rect, and correct by construction since the CSS defines that geometry.
      const measure = (): { progress: number; dark: boolean; stops: string } => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        // Six rects at most; read in the same batch as everything else.
        const stops = [...document.querySelectorAll<HTMLElement>('[data-stop]')].map((el) => {
          const top = el.getBoundingClientRect().top + window.scrollY;
          const at = max > 0 ? Math.min(1, Math.max(0, top / max)) : 0;
          return `${el.dataset['stop']}|${at.toFixed(4)}`;
        });
        const railH = window.innerHeight * 0.62;
        const top = (window.innerHeight - railH) / 2;
        const dark = isDarkGroundInBand(top, top + railH);
        return { progress, dark, stops: stops.join('\n') };
      };

      // WRITE only — no layout reads. Runs in the scrubber's batched write phase.
      // --p is registered `inherits: false` (styles.css), so it must land on
      // the element whose CSS reads it (the car), not on the rail above.
      let lastP: string | null = null;
      let lastStops = '';
      const apply = ({
        progress,
        dark,
        stops,
      }: {
        progress: number;
        dark: boolean;
        stops: string;
      }) => {
        const car = this.rail()?.nativeElement.querySelector<HTMLElement>('.jh-rail__car');
        const value = progress.toFixed(4);
        if (car && value !== lastP) {
          lastP = value;
          car.style.setProperty('--p', value);
        }
        this.onDark.set(dark);
        if (stops !== lastStops) {
          lastStops = stops;
          this.stops.set(
            stops
              ? stops.split('\n').map((line) => {
                  const [label, at] = line.split('|');
                  return { label, at: Number(at) };
                })
              : [],
          );
        }
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

  /** Scroll to the i-th stop's section. */
  protected driveTo(index: number): void {
    const el = document.querySelectorAll<HTMLElement>('[data-stop]')[index];
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
  }
}
