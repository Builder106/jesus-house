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
 * page's vertical rhythm). While the scene is PINNED, which beat shows is
 * driven by scroll position — like every other scene on this page, scroll
 * IS the interaction, so a carousel that only responded to autoplay/dot-
 * clicks while everything around it responds to scroll read as broken (owner
 * feedback, 2026-07-02: "the cards don't move as I scroll"). The pinned
 * scene's own `--zoom` custom property (written every frame by the shared
 * jhScene directive on this same host) is read back here — not re-measured —
 * and mapped onto the four beats across the panel's existing 0→.38 "read"
 * window (see values.css); crossing a beat's threshold calls Embla's own
 * `scrollTo`, so the beat transition uses Embla's normal eased animation
 * rather than a hand-rolled transform. This plays for everyone, including
 * reduced-motion, exactly like the rest of the scroll-driven journey — it is
 * scroll-DRIVEN, not a self-looping autoplay.
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

      // Scroll-driven advance while the scene is pinned. `--zoom` is written
      // every scroll frame by the shared jhScene directive (a host directive
      // on this same element) — read it back here rather than re-measuring
      // the same geometry a second time. Reading a sibling consumer's write
      // from within the ScrollScrubber's own batched read phase is one frame
      // stale (it hasn't applied yet this tick); imperceptible for a
      // beat-threshold crossing, unlike a visible layout property.
      const hostEl = this.host.nativeElement;
      let lastIndex = -1;
      let wasPinned = false;
      const measure = (): number => {
        if (!hostEl.classList.contains('scene--active')) return -1;
        const zoom = parseFloat(getComputedStyle(hostEl).getPropertyValue('--zoom')) || 0;
        // Mirrors the --p defined in values.css: the scene's action runs
        // over --zoom 0→.545, then holds.
        return Math.min(1, zoom / 0.545);
      };
      const apply = (p: number) => {
        const pinned = p >= 0;
        if (pinned !== wasPinned) {
          wasPinned = pinned;
          if (pinned) autoplay?.stop();
          else autoplay?.play();
        }
        if (!pinned) return;
        // The beats share the panel's own 0→.38 "read" window (values.css) —
        // after .38 the panel is lifting away into the dive, so there's no
        // point still advancing beats.
        const t = Math.min(1, p / 0.38);
        const index = Math.min(this.beats.length - 1, Math.floor(t * this.beats.length));
        if (index !== lastIndex) {
          lastIndex = index;
          emblaApi.scrollTo(index);
        }
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
    // (If the scene is pinned, the next scroll event re-asserts whichever
    // beat the current scroll position maps to — scroll position is the
    // source of truth once pinned, same as the rest of the journey.)
    this.emblaApi?.plugins().autoplay?.stop();
    this.emblaApi?.scrollTo(index);
  }
}
