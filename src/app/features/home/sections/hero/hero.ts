import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';

/**
 * jh-home-hero — THE INVITATION (first screen).
 *
 * A crafted, warm-light typographic hero built around the red-door motif:
 * an inline-SVG of the white meetinghouse's red double doors with warm gold
 * light implied through the doorway (no congregation photo yet — see the
 * PHOTO SLOT comment in the template for where the real exterior shot drops
 * in). Letterspaced eyebrow, a large Fraunces "Come and see." headline with a
 * masked/slide-in word reveal on load, a subline, and the two primary CTAs
 * (Plan your visit → /visit, and a Need-a-ride mailto). A quiet "Come in"
 * scroll cue closes the screen.
 *
 * SSR / no-JS / reduced-motion safety:
 *   • All content is fully visible by default. The headline's word-mask
 *     animation only engages under `html.js-motion` (added by the shared
 *     jhReveal directive, browser + motion-OK only) — identical contract to
 *     the [data-reveal] base system, so nothing is ever hidden as a baseline.
 *   • The jhReveal directive handles the staggered fade/slide of the eyebrow,
 *     subline, CTAs and scroll cue; it no-ops on the server and under reduced
 *     motion. No window/document/IO access lives in this component.
 */
@Component({
  selector: 'jh-home-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HomeHero {
  /** Headline split into words so each can ride up from behind a clip mask. */
  protected readonly headlineWords = ['Come', 'and', 'see.'];

  protected readonly visitPath = '/visit';
  protected readonly rideHref = 'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request';
}
