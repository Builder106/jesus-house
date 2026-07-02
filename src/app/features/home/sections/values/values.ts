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

/**
 * jh-home-values — SCENE 4 · SUNDAY MORNING (the sanctuary).
 *
 * The sanctuary vignette: chancel, lectern, standing cross, and the great
 * stained-glass arch. While pinned (jhScene, desktop + motion-OK) a single
 * panel (heading + the four Sunday beats — Welcoming · Rooted · Together ·
 * Sending) reads, then the camera zooms INTO the stained glass, whose deep
 * indigo hands off seamlessly to the cathedral story section below.
 *
 * The beats are an Embla carousel (swipe, autoplay, or click a dot) rather
 * than scroll-driven — unlike the rest of the page's scroll-scrubbed camera,
 * they don't need scroll distance to advance, so they just sit inside the
 * pinned panel. Embla initialises unconditionally in the browser (it isn't
 * gated on the scene's own pin/viewport-height check, since a compact
 * one-at-a-time carousel is a fine fit for short viewports too — the static
 * 2×2 grid is the true no-JS/pre-hydration fallback, not a short-viewport
 * fallback).
 *
 * Autoplay is a self-looping animation (unlike the scroll-driven camera,
 * which only moves on user scroll) — it honours prefers-reduced-motion on
 * its own; swipe/click navigation stays available either way.
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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private emblaApi: EmblaCarouselType | null = null;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const root = this.emblaRoot()?.nativeElement;
      if (!root) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const plugins = prefersReducedMotion
        ? []
        : [Autoplay({ delay: 4500, stopOnMouseEnter: true })];

      const emblaApi = EmblaCarousel(root, { loop: true }, plugins);
      this.emblaApi = emblaApi;
      root.classList.add('embla--ready');

      const onSelect = () => this.activeIndex.set(emblaApi.selectedScrollSnap());
      emblaApi.on('select', onSelect);
      onSelect();

      this.destroyRef.onDestroy(() => emblaApi.destroy());
    });
  }

  protected scrollToBeat(index: number): void {
    // The dots live outside Embla's own root, so its stopOnInteraction
    // autoplay setting never sees a dot click as "interaction" — without
    // this, autoplay keeps ticking underneath and can race with (and
    // silently override) the click a moment later. Stop it explicitly.
    this.emblaApi?.plugins().autoplay?.stop();
    this.emblaApi?.scrollTo(index);
  }
}
