import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * jh-site-header — floating pill navigation.
 *
 * A rounded, detached nav bar with backdrop blur + soft shadow on cream.
 * Left: seal + "RCCG Jesus House" wordmark. Right: Home, Plan a Visit, and a
 * red "Need a ride?" pill (mailto). After a little scroll it compacts and
 * grows more opaque (browser-only passive scroll listener).
 *
 * SSR / no-JS safety: renders fully and is usable without JS. The `scrolled`
 * compaction and the mobile disclosure are progressive enhancements — on the
 * server the menu markup is present and simply styled for desktop.
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

  /** mailto for the ride CTA (kept here so the template stays declarative). */
  protected readonly rideHref = 'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request';

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      const onScroll = () => this.scrolled.set(window.scrollY > 24);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
