import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';

/**
 * jh-home-ride — THE ROAD TO US · the ride ministry.
 *
 * Second beat of the "COME AND SEE" journey (road → red doors → family) and the
 * concept's heart: the parish drives out to bring students and neighbors to
 * church and home again. Headline "No car? No problem." A short warm paragraph,
 * a set of Wesleyan pickup-spot chips, and two CTAs (red "Request a ride"
 * mailto + a tel: call link). A decorative hairline "route" graphic runs the
 * road metaphor, pairing with the global car-on-scroll-line rail.
 *
 * Contract notes:
 *   • Light section on the default jh-cream ground; separated from the hero
 *     above by a leading jh-rule hairline (border-t border-jh-rule). Major
 *     rhythm: py-20 sm:py-28.
 *   • CTAs: primary red pill (rounded-full bg-jh-red) → ride mailto; secondary
 *     tel: link. No jh-blue-as-CTA; jh-red is the only CTA hue.
 *   • Motion is additive only — entrance reveals via [jhReveal]. SSR / no-JS /
 *     reduced-motion → fully visible; the reveal system owns the hidden state.
 *     The route graphic is decorative (aria-hidden), CSS-only, motion-safe.
 *   • No member PII, no founding-year claim, no real photos (a hairline-framed
 *     colour-field PHOTO SLOT placeholder + the route motif only). No emoji.
 */
@Component({
  selector: 'jh-home-ride',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './ride.html',
  styleUrl: './ride.css',
})
export class HomeRide {
  /** Ride contact links — kept here so copy and href stay in lockstep. */
  protected readonly rideMailto =
    'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request';
  protected readonly rideTel = 'tel:+18605184640';

  /**
   * Common Wesleyan pickup spots. The final "Anywhere on campus" chip widens
   * the offer so no student rules themselves out for living off the beaten
   * path. Order chosen so the stagger reads naturally left-to-right.
   */
  protected readonly pickupSpots: readonly string[] = [
    'Exley',
    'Usdan',
    'Sci-Li',
    'Foss Hill',
    'Anywhere on campus',
  ];
}
