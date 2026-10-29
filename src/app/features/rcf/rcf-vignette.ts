import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * jh-rcf-vignette — the illustration for one gathering of the RCF week.
 * Decorative (the copy beside it carries the facts); the SVGs are generated
 * by art-src/scenes/rcf_week.py. Idle motion (string lights, music notes,
 * steam, the lamp's glow) plays unless the visitor prefers reduced motion.
 */
@Component({
  selector: 'app-rcf-vignette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rcf-vignette.html',
  styles: `
    :host {
      display: block;
      border-radius: 18px;
      box-shadow: 0 18px 50px rgb(12 59 41 / 0.12);
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
    }
    .rv-twinkle,
    .rv-float,
    .rv-steam,
    .rv-breathe {
      transform-box: fill-box;
      transform-origin: center;
    }
    @media (prefers-reduced-motion: no-preference) {
      .rv-twinkle {
        animation: rv-twinkle 3.7s ease-in-out infinite;
      }
      .rv-float {
        animation: rv-float 4.8s ease-in-out infinite;
      }
      .rv-steam {
        transform-origin: 50% 100%;
        animation: rv-steam 3.2s ease-out infinite;
      }
      .rv-breathe {
        animation: rv-breathe 4.5s ease-in-out infinite alternate;
      }
    }
    @keyframes rv-twinkle {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.45;
      }
    }
    @keyframes rv-float {
      0% {
        opacity: 0;
        transform: translate(0, 6px);
      }
      30%,
      70% {
        opacity: 0.85;
      }
      100% {
        opacity: 0;
        transform: translate(5px, -14px);
      }
    }
    @keyframes rv-steam {
      0% {
        opacity: 0;
        transform: translateY(4px) scaleY(0.7);
      }
      40% {
        opacity: 0.75;
      }
      100% {
        opacity: 0;
        transform: translateY(-10px) scaleY(1.2);
      }
    }
    @keyframes rv-breathe {
      from {
        opacity: 0.65;
      }
      to {
        opacity: 1;
      }
    }
  `,
})
export class RcfVignette {
  readonly art = input.required<'friday' | 'saturday' | 'sunday'>();
}
