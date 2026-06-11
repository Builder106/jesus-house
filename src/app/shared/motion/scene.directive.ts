import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * jhScene — the shared scroll-camera rig for the "Come and see" journey.
 *
 * Apply via `hostDirectives` on a scene section component. In the browser, on
 * desktop, when motion is allowed, it adds `scene--active` to the HOST element
 * and drives a `--zoom` custom property (0→1) from scroll progress through the
 * host. The component's own CSS keys on `:host(.scene--active)` to pin its
 * stage and zoom its illustrated art toward a target element — the "camera
 * move" into the next scene.
 *
 * Baseline (SSR / no-JS / phones / short viewports / prefers-reduced-motion):
 * the class never lands, `--zoom` stays unset, and the scene renders as a
 * normal static illustrated section. Content is never hidden by default.
 *
 * Identical contract to the hero portal controller; rAF-throttled passive
 * listeners, transform/opacity-only consumers.
 */
@Directive({ selector: '[jhScene]' })
export class SceneDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Desktop only — pinned camera moves want room and steady wheel/trackpad
      // scrolling. Short viewports would clip pinned content.
      if (!window.matchMedia('(min-width: 1024px) and (min-height: 600px)').matches) return;

      const el = this.host.nativeElement;
      el.classList.add('scene--active');

      // Camera-target plumbing: scenes that zoom into a point of an SVG art
      // layer declare it in viewBox coordinates via data-scene-x/y (and
      // optionally data-scene-vw/vh, default 1440×900). Because the art uses
      // preserveAspectRatio="slice", the on-screen position depends on the
      // viewport aspect — so we map viewBox→element coords here every frame
      // and expose --tox/--toy (transform-origin) and --panx/--pany (the
      // translation that carries the target to screen centre).
      const targetX = parseFloat(el.dataset['sceneX'] ?? '');
      const targetY = parseFloat(el.dataset['sceneY'] ?? '');
      const vbW = parseFloat(el.dataset['sceneVw'] ?? '1440');
      const vbH = parseFloat(el.dataset['sceneVh'] ?? '900');
      const art = el.querySelector<HTMLElement>('.scene__art');

      let ticking = false;
      const update = () => {
        ticking = false;
        const range = el.offsetHeight - window.innerHeight;
        const progress = range > 0 ? -el.getBoundingClientRect().top / range : 0;
        el.style.setProperty('--zoom', Math.min(1, Math.max(0, progress)).toFixed(4));

        if (art && Number.isFinite(targetX) && Number.isFinite(targetY)) {
          const ew = art.clientWidth;
          const eh = art.clientHeight;
          if (ew > 0 && eh > 0) {
            const s = Math.max(ew / vbW, eh / vbH); // slice scale
            const ox = (ew - vbW * s) / 2 + targetX * s;
            const oy = (eh - vbH * s) / 2 + targetY * s;
            el.style.setProperty('--tox', `${ox.toFixed(1)}px`);
            el.style.setProperty('--toy', `${oy.toFixed(1)}px`);
            el.style.setProperty('--panx', `${(ew / 2 - ox).toFixed(1)}px`);
            el.style.setProperty('--pany', `${(eh / 2 - oy).toFixed(1)}px`);
          }
        }
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      update();
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      });
    });
  }
}
