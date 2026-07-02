import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { isDarkGroundInBand } from '../../motion/dark-ground';
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
 *
 * Mobile menu focus management (WAI-ARIA APG disclosure pattern): opening
 * moves focus to the panel's first link (a keyboard user just activated the
 * toggle — send them straight into the menu rather than making them Tab past
 * it again); Escape closes the menu FROM ANYWHERE (not just while focus is
 * still inside the panel — a document-level listener, live only while open)
 * and returns focus to the toggle button, as does re-clicking the toggle
 * itself. A link click also closes the menu but deliberately does NOT
 * return focus to the toggle — the browser's own navigation is about to move
 * the user's attention to the destination page, and yanking focus back to a
 * now-offscreen toggle button would fight that.
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

  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly scrollScrubber = inject(ScrollScrubber);
  private readonly destroyRef = inject(DestroyRef);

  private onMenuKeydown: ((event: KeyboardEvent) => void) | null = null;

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
      // is tiny). See dark-ground.ts for the one-frame-staleness note.
      const measure = (): boolean => {
        if (!pill) return false;
        const band = pill.getBoundingClientRect();
        return isDarkGroundInBand(band.top, band.bottom);
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
        if (this.onMenuKeydown) document.removeEventListener('keydown', this.onMenuKeydown);
      });
    });
  }

  protected toggleMenu(): void {
    if (this.menuOpen()) this.closeMenu(true);
    else this.openMenu();
  }

  /** `returnFocus` is false by default so a link click (which also calls
   *  this) lets the browser's own navigation own focus — see class doc. */
  protected closeMenu(returnFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (this.onMenuKeydown) {
      document.removeEventListener('keydown', this.onMenuKeydown);
      this.onMenuKeydown = null;
    }
    if (returnFocus) this.menuToggle()?.nativeElement.focus();
  }

  private openMenu(): void {
    this.menuOpen.set(true);
    // The panel is @if-gated — its DOM lands after this change-detection
    // pass, so the focus move waits a tick.
    setTimeout(() => {
      this.host.nativeElement.querySelector<HTMLElement>('.jh-header__menu-link')?.focus();
    });
    this.onMenuKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      this.closeMenu(true);
    };
    document.addEventListener('keydown', this.onMenuKeydown);
  }
}
