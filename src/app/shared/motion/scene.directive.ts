import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ScrollScrubber } from './scroll-scrubber';

interface SceneMeasurement {
  zoom: number;
  tox?: string;
  toy?: string;
  panx?: string;
  pany?: string;
}

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
 * Baseline (SSR / no-JS / short viewports): the class never lands, `--zoom`
 * stays unset, and the scene renders as a normal static illustrated section.
 * Content is never hidden by default.
 *
 * The height gate is *reactive* — it re-evaluates when the viewport crosses the
 * threshold, so rotating a phone between portrait (pinned) and a short landscape
 * (static) flips the scene live, with no refresh.
 *
 * Note: there is no prefers-reduced-motion gate. The journey is scroll-DRIVEN
 * (it only moves as the user scrolls), and the site owner chose to play it for
 * everyone (2026-06-12 — too many phones run Android "remove animations" / iOS
 * Reduce Motion and were silently getting a plain page). Decorative AUTOPLAY
 * motion (reveal fades, the cue bob, the door's load-swing) still honours
 * reduced-motion separately, via the js-motion class + no-preference media query.
 *
 * The per-frame read (geometry) and write (`--zoom`/`--tox`/etc.) go through
 * the shared ScrollScrubber rather than this directive's own scroll listener
 * — with four scene instances (ride/audience/values/story) plus the hero and
 * ride-progress rail all measuring and writing independently, interleaved
 * reads/writes across components forced synchronous layout on every scroll
 * frame (measured: 320ms of forced-reflow time in a single scroll-up burst,
 * mobile CPU-throttled). The scrubber batches every consumer's read before
 * any consumer's write, eliminating that thrashing.
 */
@Directive({ selector: '[jhScene]' })
export class SceneDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollScrubber = inject(ScrollScrubber);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      // No prefers-reduced-motion gate (see class doc): the journey is
      // user-driven, and the owner opted to play it for everyone. Autoplay
      // flourishes still respect reduced-motion via the js-motion reveal system.

      const el = this.host.nativeElement;

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
      // Measure the pinned stage's real rendered height rather than
      // window.innerHeight: on mobile innerHeight tracks the large viewport and
      // doesn't move with the URL bar, so it disagrees with the svh-sized stage
      // and the progress drifts. The stage's offsetHeight is always truthful.
      const stage = el.querySelector<HTMLElement>('.scene__stage');

      // Reactive height gate: pin only on viewports tall enough to hold the
      // scene (phones in portrait included); short/landscape-phone heights stay
      // static. Tracked live so an orientation change flips it without a reload.
      const tallEnough = window.matchMedia('(min-height: 500px)');
      let active = false;
      let unregister: (() => void) | null = null;

      // READ only — no DOM writes. Runs in the scrubber's batched read phase.
      const measure = (): SceneMeasurement => {
        const stageH = stage?.offsetHeight ?? window.innerHeight;
        const range = el.offsetHeight - stageH;
        const progress = range > 0 ? -el.getBoundingClientRect().top / range : 0;
        const zoom = Math.min(1, Math.max(0, progress));

        if (art && Number.isFinite(targetX) && Number.isFinite(targetY)) {
          const ew = art.clientWidth;
          const eh = art.clientHeight;
          if (ew > 0 && eh > 0) {
            const s = Math.max(ew / vbW, eh / vbH); // slice scale
            const ox = (ew - vbW * s) / 2 + targetX * s;
            const oy = (eh - vbH * s) / 2 + targetY * s;
            return {
              zoom,
              tox: `${ox.toFixed(1)}px`,
              toy: `${oy.toFixed(1)}px`,
              panx: `${(ew / 2 - ox).toFixed(1)}px`,
              pany: `${(eh / 2 - oy).toFixed(1)}px`,
            };
          }
        }
        return { zoom };
      };

      // WRITE only — no layout reads. Runs in the scrubber's batched write phase.
      const apply = (m: SceneMeasurement) => {
        el.style.setProperty('--zoom', m.zoom.toFixed(4));
        if (m.tox) el.style.setProperty('--tox', m.tox);
        if (m.toy) el.style.setProperty('--toy', m.toy);
        if (m.panx) el.style.setProperty('--panx', m.panx);
        if (m.pany) el.style.setProperty('--pany', m.pany);
      };

      const setActive = (on: boolean) => {
        if (on === active) return;
        active = on;
        el.classList.toggle('scene--active', on);
        if (on) {
          unregister = this.scrollScrubber.register({ measure, apply });
        } else {
          unregister?.();
          unregister = null;
          el.style.removeProperty('--zoom');
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
