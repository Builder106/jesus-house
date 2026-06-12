import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';
import { Lottie } from '../../../../shared/ui/lottie/lottie';

/**
 * jh-home-hero — THE PORTAL (first screen + "enter the door" scroll scene).
 *
 * Baseline (SSR / no-JS / reduced-motion) is a normal static hero: copy left,
 * the open red door right, a scroll cue below. Fully visible, no pinning.
 *
 * Enhancement: in the browser, when motion is allowed, the component adds the
 * `portal--active` class (the wrapper grows tall, the stage pins) and drives a
 * `--enter` custom property (0→1) from scroll progress through the wrapper. CSS
 * uses --enter to scale the doorway up until you pass through it and a warm
 * cream wash carries you "inside", handing off to the journey below.
 *
 * SSR / reduced-motion safety: the scroll listener lives inside afterNextRender
 * + isPlatformBrowser and is skipped entirely under prefers-reduced-motion, so
 * portal--active never lands there — the static hero is what shows. All motion
 * is transform/opacity only and rAF-throttled.
 */
@Component({
  selector: 'jh-home-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, Lottie],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  host: { class: 'portal' },
})
export class HomeHero {
  /** Headline split into words so each can ride up from behind a clip mask. */
  protected readonly headlineWords = ['Come', 'and', 'see.'];

  protected readonly visitPath = '/visit';
  protected readonly rideHref = 'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request';

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const el = this.host.nativeElement;

      // Measure the pinned stage rather than window.innerHeight (which tracks
      // the large viewport on mobile and disagrees with the svh-sized stage).
      const stage = el.querySelector<HTMLElement>('.portal__stage');

      // Reactive height gate: any viewport tall enough to hold the pinned
      // fly-through (phones in portrait included); short/landscape-phone heights
      // fall back to static. Tracked live so rotating the phone flips it without
      // a reload.
      const tallEnough = window.matchMedia('(min-height: 500px)');
      let active = false;

      let ticking = false;
      const update = () => {
        ticking = false;
        if (!active) return;
        const stageH = stage?.offsetHeight ?? window.innerHeight;
        const range = el.offsetHeight - stageH;
        const progress = range > 0 ? -el.getBoundingClientRect().top / range : 0;
        el.style.setProperty('--enter', Math.min(1, Math.max(0, progress)).toFixed(4));
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };

      const setActive = (on: boolean) => {
        if (on === active) return;
        active = on;
        el.classList.toggle('portal--active', on);
        if (on) update();
        else el.style.removeProperty('--enter');
      };
      const onGate = () => setActive(tallEnough.matches);

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      tallEnough.addEventListener('change', onGate);
      onGate();
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        tallEnough.removeEventListener('change', onGate);
      });
    });
  }
}
