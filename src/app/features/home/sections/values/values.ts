import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';
import { SceneDirective } from '../../../../shared/motion/scene.directive';
import { ScrollScrubber } from '../../../../shared/motion/scroll-scrubber';

/**
 * jh-home-values — SCENE 4 · SUNDAY MORNING (the sanctuary).
 *
 * The sanctuary vignette: chancel, lectern, standing cross, and the great
 * stained-glass arch. While pinned (jhScene, desktop + motion-OK) a single
 * panel (heading + the four Sunday beats — Welcoming · Rooted · Together ·
 * Sending) reads, then the camera zooms INTO the stained glass, whose deep
 * indigo hands off seamlessly to the cathedral story section below.
 *
 * The beats are an Embla carousel (vertical axis, matching the rest of the
 * page's vertical rhythm) — but ONLY in the unpinned static/short-viewport
 * fallback (autoplay + dot-click there, Embla's normal eased `scrollTo`).
 * While the scene is PINNED, Embla's own positioning is bypassed entirely:
 * the card position tracks scroll CONTINUOUSLY, pixel-for-pixel, the same
 * way the door/glass camera moves elsewhere on the page do (owner feedback,
 * 2026-07-03, after a first pass that snapped between beats on scroll-
 * threshold crossings: "link it to vertical scroll instead"). A `.embla--
 * scrubbing` class swaps in a CSS transform keyed off `--carousel-scrub` (a
 * continuous 0→3 position across the four beats) with `!important` — since
 * Embla is not driving `scrollTo` in this mode, nothing else is fighting for
 * the container's transform, but `!important` is cheap insurance against
 * Embla reasserting its own inline transform from an internal resize reflow.
 * `--carousel-scrub` itself is derived from the SAME `--zoom` the pinned
 * scene's shared jhScene directive already writes every frame (read back,
 * not re-measured) across the panel's existing 0→.38 "read" window (see
 * values.css). No loop-wraparound handling is needed for this: scrolling
 * through the pinned scene is a single linear pass through the four beats,
 * never an infinite carousel — Embla's `loop: true` config only matters for
 * the unpinned autoplay case, where it still owns positioning normally.
 * This continuous tracking plays for everyone, including reduced-motion,
 * exactly like the rest of the scroll-driven journey — it is scroll-DRIVEN,
 * not a self-looping autoplay.
 *
 * On leaving the pin (scrolling back up out of it, or a live orientation
 * change), Embla's real internal slide is snapped (jump: true, no animation)
 * to wherever the continuous scrub last left off, so autoplay/dot-click
 * resume from the right visual spot with no jump.
 *
 * Drag stays off (watchDrag: false): a vertically-draggable carousel nested
 * inside a vertically-scrolling page would fight the page's own scroll
 * gesture. Autoplay is reserved for the one case with no scroll-progress
 * signal to key off — the static/short-viewport fallback where the scene
 * never pins (a landscape phone, mainly) — and is stopped the instant the
 * scene pins so it can never race the scroll-driven advance.
 *
 * Static baseline (SSR / no-JS / before hydration): the scene illustrates a
 * normal section — heading panel + a 2×2 beats grid, all fully visible. No
 * member PII, no real photos (window panes are future PHOTO SLOTs), no emoji.
 */
@Component({
  selector: 'jh-home-values',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  hostDirectives: [SceneDirective],
  host: {
    // Camera target: the cross at the heart of the stained-glass arch (1440×900
    // viewBox) — the camera dives into it as the scene hands off to the cathedral.
    'data-scene-x': '720',
    'data-scene-y': '330',
  },
  templateUrl: './values.html',
  styleUrl: './values.css',
})
export class HomeValues {
  /** The four beats of a Sunday, in journey order. The numeral + label render
   *  as a paired kicker above each beat word (a magazine-style index). */
  protected readonly beats: ReadonlyArray<{
    index: string;
    label: string;
    word: string;
    line: string;
  }> = [
    {
      index: '01',
      label: 'Arrival',
      word: 'Welcoming',
      line: "You'll be greeted at the door, never singled out.",
    },
    {
      index: '02',
      label: 'The Word',
      word: 'Rooted',
      line: 'Honest teaching from the Bible, in about ninety minutes.',
    },
    {
      index: '03',
      label: 'The Family',
      word: 'Together',
      line: 'A warm, multicultural family: students and neighbors, side by side.',
    },
    {
      index: '04',
      label: 'The Sending',
      word: 'Sending',
      line: 'You leave with people who will know your name.',
    },
  ];

  /** Which beat the carousel currently shows; drives the active dot. */
  protected readonly activeIndex = signal(0);

  private readonly emblaRoot = viewChild<ElementRef<HTMLElement>>('emblaRoot');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollScrubber = inject(ScrollScrubber);
  private emblaApi: EmblaCarouselType | null = null;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const root = this.emblaRoot()?.nativeElement;
      if (!root) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Autoplay is a self-looping animation (unlike the scroll-driven advance
      // below, which only moves because the user scrolled), so it alone
      // honours reduced-motion. undefined (not stopped-after-creation) when
      // reduced motion, so the ?. calls below are safe no-ops throughout.
      const autoplay = prefersReducedMotion
        ? undefined
        : Autoplay({ delay: 4500, stopOnMouseEnter: true });

      // Switch to the vertical-carousel layout BEFORE Embla measures the
      // DOM: Embla reads slide sizes once at init, and if it measures the
      // pre-hydration 2×2 grid instead of the final one-slide-per-row
      // layout, its internal snap points are wrong from the start —
      // watchResize's automatic recovery from that isn't reliable here.
      root.classList.add('embla--ready');

      // axis: 'y' matches the vertical rhythm of the rest of the page. Drag
      // is off (watchDrag: false) rather than left on: a vertically-
      // draggable carousel nested inside a vertically-scrolling page would
      // fight the page's own scroll gesture, so navigation is scroll-driven
      // while pinned (see below), dot-click always, and autoplay only when
      // unpinned.
      const emblaApi = EmblaCarousel(
        root,
        { loop: true, axis: 'y', watchDrag: false },
        autoplay ? [autoplay] : [],
      );
      this.emblaApi = emblaApi;

      const onSelect = () => this.activeIndex.set(emblaApi.selectedScrollSnap());
      emblaApi.on('select', onSelect);
      onSelect();

      // Continuous scroll-driven position while the scene is pinned. `--zoom`
      // is written every scroll frame by the shared jhScene directive (a host
      // directive on this same element) — read it back here rather than
      // re-measuring the same geometry a second time. Reading a sibling
      // consumer's write from within the ScrollScrubber's own batched read
      // phase is one frame stale (it hasn't applied yet this tick);
      // imperceptible at scroll-frame cadence.
      const hostEl = this.host.nativeElement;
      let pinned = false;
      const measure = (): number => {
        if (!hostEl.classList.contains('scene--active')) return -1;
        const zoom = parseFloat(getComputedStyle(hostEl).getPropertyValue('--zoom')) || 0;
        // Mirrors the --p defined in values.css: the scene's action runs
        // over --zoom 0→.545, then holds.
        return Math.min(1, zoom / 0.545);
      };
      const apply = (p: number) => {
        const isPinned = p >= 0;
        if (isPinned !== pinned) {
          pinned = isPinned;
          root.classList.toggle('embla--scrubbing', pinned);
          if (pinned) {
            autoplay?.stop();
          } else {
            // Leaving the pin: hand the real slide back to Embla wherever
            // the continuous scrub last left off (jump: true skips Embla's
            // own animation) so autoplay/dot-click resume without a jump.
            const lastScrub = parseFloat(root.style.getPropertyValue('--carousel-scrub')) || 0;
            emblaApi.scrollTo(Math.round(lastScrub), true);
            autoplay?.play();
          }
        }
        if (!pinned) return;
        // The beats share the panel's own 0→.38 "read" window (values.css) —
        // after .38 the panel is lifting away into the dive, so there's no
        // point still advancing. Continuous, not floored to an index: this
        // is a position (0→3 across 4 beats), not a threshold crossing.
        const t = Math.min(1, p / 0.38);
        const scrub = t * (this.beats.length - 1);
        root.style.setProperty('--carousel-scrub', scrub.toFixed(4));
        this.activeIndex.set(Math.round(scrub));
      };
      const unregisterScrub = this.scrollScrubber.register({ measure, apply });

      this.destroyRef.onDestroy(() => {
        emblaApi.destroy();
        unregisterScrub();
      });
    });
  }

  protected scrollToBeat(index: number): void {
    // The dots live outside Embla's own root, so its stopOnInteraction
    // autoplay setting never sees a dot click as "interaction" — without
    // this, autoplay keeps ticking underneath and can race with (and
    // silently override) the click a moment later. Stop it explicitly.
    this.emblaApi?.plugins().autoplay?.stop();
    const root = this.emblaRoot()?.nativeElement;
    if (root?.classList.contains('embla--scrubbing')) {
      // Pinned: position is continuously scroll-driven, so a click just
      // jumps the scrub value directly — no Embla animation in this mode.
      // The very next scroll event re-asserts whatever the actual scroll
      // position maps to anyway, same as the rest of the journey once
      // pinned; this is a momentary jump, not a lasting override.
      root.style.setProperty('--carousel-scrub', String(index));
      this.activeIndex.set(index);
    } else {
      this.emblaApi?.scrollTo(index);
    }
  }
}
