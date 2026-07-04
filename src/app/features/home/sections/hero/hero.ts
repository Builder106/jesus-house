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
import { ScrollScrubber } from '../../../../shared/motion/scroll-scrubber';

/**
 * jh-home-hero — THE PORTAL (first screen + "enter the door" scroll scene).
 *
 * Baseline (SSR / no-JS / short viewports) is a normal static hero: copy left,
 * the open red door right, a scroll cue below. Fully visible, no pinning.
 *
 * Enhancement: in the browser, the component adds the `portal--active` class
 * (the wrapper grows tall, the stage pins) and drives a `--enter` custom
 * property (0→1) from scroll progress through the wrapper. CSS uses --enter to
 * scale the doorway up until you pass through it and a warm cream wash carries
 * you "inside", handing off to the journey below.
 *
 * SSR safety: the scroll listener lives inside afterNextRender + isPlatformBrowser
 * so portal--active never lands on the server — the static hero is what renders.
 * No prefers-reduced-motion gate: the portal is scroll-DRIVEN and the owner chose
 * to play it for everyone (see scene.directive.ts). Autoplay flourishes (the
 * headline word-rise, the cue bob, the door's load-swing) still respect
 * reduced-motion via the js-motion class + no-preference media query. All motion
 * is transform/opacity only.
 *
 * The per-frame read+write goes through the shared ScrollScrubber (see
 * scene.directive.ts's doc comment) rather than this component's own scroll
 * listener, so its geometry read can't be sandwiched between two other
 * components' writes and force a synchronous layout.
 */
@Component({
  selector: 'jh-home-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
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
  private readonly scrollScrubber = inject(ScrollScrubber);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      // No prefers-reduced-motion gate (see class doc): the portal is
      // user-driven and the owner opted to play it for everyone. Autoplay
      // flourishes still respect reduced-motion via the js-motion reveal system.

      const el = this.host.nativeElement;

      // Measure the pinned stage rather than window.innerHeight (which tracks
      // the large viewport on mobile and disagrees with the svh-sized stage).
      const stage = el.querySelector<HTMLElement>('.portal__stage');
      // --enter is registered `inherits: false` (styles.css — one write must
      // not restyle the whole portal subtree), so each element whose CSS reads
      // var(--enter) is marked [data-scene-var] and written to directly.
      const consumers = Array.from(el.querySelectorAll<HTMLElement>('[data-scene-var]'));

      // Reactive height gate: any viewport tall enough to hold the pinned
      // fly-through (phones in portrait included); short/landscape-phone heights
      // fall back to static. Tracked live so rotating the phone flips it without
      // a reload.
      const tallEnough = window.matchMedia('(min-height: 500px)');
      let active = false;
      let unregister: (() => void) | null = null;

      // READ only — no DOM writes. Runs in the scrubber's batched read phase.
      const measure = (): number => {
        const stageH = stage?.offsetHeight ?? window.innerHeight;
        const range = el.offsetHeight - stageH;
        const progress = range > 0 ? -el.getBoundingClientRect().top / range : 0;
        return Math.min(1, Math.max(0, progress));
      };

      // WRITE only — no layout reads. Runs in the scrubber's batched write phase.
      // Unchanged values are skipped, so the portal at rest (enter pinned at
      // 0 or 1) costs zero style work per scroll frame.
      let lastEnter: string | null = null;
      const apply = (enter: number) => {
        const value = enter.toFixed(4);
        if (value === lastEnter) return;
        lastEnter = value;
        for (const c of consumers) c.style.setProperty('--enter', value);
      };

      const setActive = (on: boolean) => {
        if (on === active) return;
        active = on;
        el.classList.toggle('portal--active', on);
        if (on) {
          unregister = this.scrollScrubber.register({ measure, apply });
        } else {
          unregister?.();
          unregister = null;
          lastEnter = null;
          for (const c of consumers) c.style.removeProperty('--enter');
        }
      };
      const onGate = () => setActive(tallEnough.matches);

      tallEnough.addEventListener('change', onGate);
      onGate();
      this.destroyRef.onDestroy(() => {
        unregister?.();
        tallEnough.removeEventListener('change', onGate);
      });
    });
  }
}
