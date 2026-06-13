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

import { RevealDirective } from '../../shared/motion/reveal.directive';

/**
 * jh-rcf — Wesleyan RCF (Redeemed Campus Fellowship).
 *
 * RCF's own scroll signature — the campus-fellowship answer to the home page's
 * "enter the door". A "candlelight vespers" hero: a quiet atmospheric dusk
 * (gradient, sparse stars, a near-tonal treeline, grain) with ONE warm light —
 * the official RCF mark, in document flow below the copy. The section PINS and,
 * as you scroll, the camera dives into the mark (origin = its measured center),
 * revealing the dove at the flame's heart before the warm wash hands off —
 * "draw near to the flame". Below, the week (Friday · Saturday · Sunday) plays
 * as illustrated picture-book beats that animate in.
 *
 * The hero controller mirrors the home portal: a reactive `(min-height: 500px)`
 * gate adds `rcf-hero--active` to the .rcf-hero section and drives `--enter`
 * (0→1) from scroll. No prefers-reduced-motion gate (user-driven, owner's call,
 * consistent with the rest of the site); decorative autoplay still respects it
 * via the js-motion reveal system. SSR / no-JS / short viewports: a static
 * illustrated hero, all copy visible.
 *
 * Verified facts only (RCF launch + meeting flyers, Apr–May 2026): Friday
 * fellowship 4–5 PM, Rehearsal Hall 109 (worship · prayer · Bible games · ice
 * cream); Saturday study 5–7 PM, PAC 333; Sunday service 9:00 AM, 120 Washington
 * Street. NO student names or photos (PII) — "student leaders" stays generic;
 * illustration only, no real faces. No emoji.
 */
@Component({
  selector: 'jh-rcf',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  templateUrl: './rcf.html',
  styleUrl: './rcf.css',
})
export class Rcf {
  /** RCF's public channel (regional account — confirm/replace if the parish opens a Wesleyan one). */
  protected readonly instagramHandle = '@rcfcampus';
  protected readonly instagramHref = 'https://instagram.com/rcfcampus';

  protected readonly rideMailto =
    'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request%20(RCF)';
  protected readonly visitPath = '/visit';

  /** The week, in order — each renders as an illustrated beat. `art` selects the
   *  vignette drawn in the template; `side` alternates the illustration L/R. */
  protected readonly week: ReadonlyArray<{
    art: 'friday' | 'saturday' | 'sunday';
    index: string;
    name: string;
    when: string;
    where: string;
    blurb: string;
  }> = [
    {
      art: 'friday',
      index: '01',
      name: 'Friday Fellowship',
      when: 'Fridays · 4–5 PM',
      where: 'Rehearsal Hall 109',
      blurb:
        'Worship, prayer, and Bible games — then ice cream to close out the week together. The warmest hour on your Friday.',
    },
    {
      art: 'saturday',
      index: '02',
      name: 'Saturday Study',
      when: 'Saturdays · 5–7 PM',
      where: 'PAC 333',
      blurb:
        'Open the Bible together over prayer, group study, and snacks. Bring your questions — no experience needed.',
    },
    {
      art: 'sunday',
      index: '03',
      name: 'Sunday Service',
      when: 'Sundays · 9:00 AM',
      where: '120 Washington Street',
      blurb:
        'Worship with the whole parish at Jesus House. No car? We pick you up from campus and bring you back.',
    },
  ];

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const heroEl = this.host.nativeElement.querySelector<HTMLElement>('.rcf-hero');
      if (!heroEl) return;
      // Measure the pinned stage, not window.innerHeight (which lies under the
      // mobile URL bar and disagrees with the svh-sized stage).
      const stage = heroEl.querySelector<HTMLElement>('.rcf-hero__stage');
      const mark = heroEl.querySelector<HTMLElement>('.rcf-hero__mark');

      // Aim the dive at the mark's rendered center: it lives in document flow
      // (so it can never collide with the copy), which means its position
      // varies with viewport — measure it instead of guessing a percentage.
      // The mark scales about its own center, so the center is transform-stable.
      const setOrigin = () => {
        if (!mark || !stage) return;
        const m = mark.getBoundingClientRect();
        const s = stage.getBoundingClientRect();
        heroEl.style.setProperty('--rcf-ox', `${(m.left + m.width / 2 - s.left).toFixed(1)}px`);
        heroEl.style.setProperty('--rcf-oy', `${(m.top + m.height / 2 - s.top).toFixed(1)}px`);
      };

      // Reactive height gate — phones in portrait pin too; short/landscape fall
      // back to the static illustrated hero. Flips live on rotation.
      const tallEnough = window.matchMedia('(min-height: 500px)');
      let active = false;

      let ticking = false;
      const update = () => {
        ticking = false;
        if (!active) return;
        const stageH = stage?.offsetHeight ?? window.innerHeight;
        const range = heroEl.offsetHeight - stageH;
        const progress = range > 0 ? -heroEl.getBoundingClientRect().top / range : 0;
        heroEl.style.setProperty('--enter', Math.min(1, Math.max(0, progress)).toFixed(4));
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };

      const setActive = (on: boolean) => {
        if (on === active) return;
        active = on;
        heroEl.classList.toggle('rcf-hero--active', on);
        if (on) {
          setOrigin();
          update();
        } else heroEl.style.removeProperty('--enter');
      };
      const onGate = () => setActive(tallEnough.matches);
      const onResize = () => {
        setOrigin();
        onScroll();
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
      tallEnough.addEventListener('change', onGate);
      onGate();
      // Re-measure once webfonts land — Fraunces reflows the copy block, which
      // shifts the mark's center.
      document.fonts?.ready.then(setOrigin).catch(() => {});
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        tallEnough.removeEventListener('change', onGate);
      });
    });
  }
}
