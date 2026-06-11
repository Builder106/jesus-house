import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * jh-lottie — SSR-safe, reduced-motion-aware Lottie accent.
 *
 * Renders a decorative dotLottie animation into a <canvas>. The heavy WASM
 * player is dynamically imported and only initialised in the browser, when the
 * element scrolls near the viewport, and only when the user has not requested
 * reduced motion. On the server / with JS disabled / under reduced-motion the
 * canvas simply stays empty — the surrounding layout reserves the space, so
 * nothing shifts and no content depends on it. The animation is purely
 * decorative (aria-hidden).
 */
@Component({
  selector: 'jh-lottie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas aria-hidden="true" class="block h-full w-full"></canvas>`,
  host: { 'aria-hidden': 'true', class: 'block' },
})
export class Lottie {
  /** Path to a .lottie (dotLottie) asset, e.g. /animations/dove.lottie */
  readonly src = input.required<string>();
  /** Playback speed multiplier (default 1). Lower = calmer. */
  readonly speed = input(1);
  /** Loop the animation (default true). */
  readonly loop = input(true);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      let started = false;
      const io = new IntersectionObserver(
        (entries) => {
          if (started || !entries.some((e) => e.isIntersecting)) return;
          started = true;
          io.disconnect();
          void this.start();
        },
        { rootMargin: '200px' },
      );
      io.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => io.disconnect());
    });
  }

  private async start(): Promise<void> {
    const canvas = this.canvas().nativeElement;
    const { DotLottie } = await import('@lottiefiles/dotlottie-web');

    // Back the canvas at device resolution so the vector art stays crisp.
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));

    const player = new DotLottie({
      canvas,
      src: this.src(),
      autoplay: true,
      loop: this.loop(),
      speed: this.speed(),
    });

    const ro = new ResizeObserver(() => player.resize());
    ro.observe(canvas);
    this.destroyRef.onDestroy(() => {
      ro.disconnect();
      player.destroy();
    });
  }
}
