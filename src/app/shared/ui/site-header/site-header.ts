import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ScrollScrubber } from '../../motion/scroll-scrubber';

/**
 * jh-site-header — floating pill navigation.
 *
 * A rounded, detached nav bar with backdrop blur + soft shadow on cream.
 * Left: seal + "RCCG Jesus House" wordmark. Right: Home, Plan a Visit, and a
 * red "Need a ride?" pill (mailto). After a little scroll it compacts and
 * grows more opaque (browser-only passive scroll listener).
 *
 * Dark-scene variant: the light pill floating unchanged over the journey's
 * night scenes (home story, the glass-dive night veil, the RCF dusk hero and
 * close, the footer) read as a UI island breaking the immersion. Sections
 * mark themselves with `data-jh-header-dark` and the header flips to a
 * night pill while one sits underneath it:
 *   • `data-jh-header-dark` (no value)     — always dark (footer, closes).
 *   • `data-jh-header-dark="until-veil"`   — dark until its marked veil
 *     (`data-jh-header-dark-veil`) turns opaque (a warm/cream wash makes the
 *     screen light again: home story, RCF hero).
 *   • `data-jh-header-dark="when-veiled"`  — light until its marked veil
 *     turns opaque (a night veil darkens a light scene: the values glass dive).
 * The check runs through the shared ScrollScrubber (batched read → write) and
 * re-runs after navigation. SSR / no-JS: the class never lands; the light
 * pill is the baseline everywhere.
 */
@Component({
  selector: 'jh-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeader {
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  /** True while a dark-marked section sits under the pill (see class doc). */
  protected readonly overDark = signal(false);

  /** mailto for the ride CTA (kept here so the template stays declarative). */
  protected readonly rideHref = 'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly scrollScrubber = inject(ScrollScrubber);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      // The dark-check below reads veil opacities that are one frame stale
      // (scene consumers write their --zoom/--enter AFTER our read in the same
      // scrubber batch). Continuous scrolling self-corrects on the next event,
      // but a discrete jump (End/Home, anchor link) fires a single event and
      // would leave the verdict stale — so each scroll burst schedules one
      // trailing re-check after it settles.
      let settle: ReturnType<typeof setTimeout> | undefined;
      const onScroll = () => {
        this.scrolled.set(window.scrollY > 24);
        clearTimeout(settle);
        settle = setTimeout(() => this.scrollScrubber.requestUpdate(), 120);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      const pill = this.host.nativeElement.querySelector<HTMLElement>('.jh-header__pill');

      // READ phase — pill band vs. every dark-marked surface currently in the
      // document (queried per frame: route content comes and goes, and the set
      // is tiny). getComputedStyle on a veil reads the PREVIOUS frame's
      // opacity (this frame's --zoom write hasn't run yet) — one frame of lag,
      // imperceptible at veil-fade speeds.
      const measure = (): boolean => {
        if (!pill) return false;
        const band = pill.getBoundingClientRect();
        for (const el of document.querySelectorAll<HTMLElement>('[data-jh-header-dark]')) {
          const r = el.getBoundingClientRect();
          if (r.height === 0 || r.top >= band.bottom || r.bottom <= band.top) continue;
          const mode = el.getAttribute('data-jh-header-dark') || 'dark';
          if (mode === 'dark') return true;
          const veil = el.querySelector('[data-jh-header-dark-veil]');
          const veiled = veil ? parseFloat(getComputedStyle(veil).opacity) > 0.5 : false;
          if (mode === 'until-veil' ? !veiled : veiled) return true;
        }
        return false;
      };
      const unregister = this.scrollScrubber.register({
        measure,
        apply: (dark) => this.overDark.set(dark),
      });

      // Navigation swaps the dark-marked sections without a scroll event —
      // re-evaluate once the new route has rendered (and once more after its
      // lazy chunk settles).
      const sub = this.router.events.subscribe((e) => {
        if (!(e instanceof NavigationEnd)) return;
        setTimeout(() => this.scrollScrubber.requestUpdate());
        setTimeout(() => this.scrollScrubber.requestUpdate(), 300);
      });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        unregister();
        sub.unsubscribe();
      });
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
