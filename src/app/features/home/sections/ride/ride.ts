import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';
import { SceneDirective } from '../../../../shared/motion/scene.directive';

/**
 * jh-home-ride — SCENE 2 · THE ROAD TO US (ride ministry).
 *
 * A picture-book road vignette: Sunday morning, the red car on its way to the
 * meetinghouse. Copy ("No car? No problem.", pickup chips, ride CTAs) sits in
 * a readable panel over the scene. With jhScene active (desktop, motion-OK)
 * the stage pins and the camera zooms INTO the car's side window — you take
 * the seat — handing off to the pew scene. Static everywhere else.
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
  hostDirectives: [SceneDirective],
  host: {
    // Camera target: the car's rear side window, in 1440×900 viewBox coords.
    'data-scene-x': '799',
    'data-scene-y': '627',
  },
  templateUrl: './ride.html',
  styleUrl: './ride.css',
})
export class HomeRide {
  /** Ride contact links — kept here so copy and href stay in lockstep. */
  protected readonly rideMailto =
    'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request';
  protected readonly rideTel = 'tel:+18605184640';

  /**
   * Common Wesleyan pickup spots, each a live link that opens the ride email
   * with the pickup spot already in the body — the chips looked like buttons,
   * so they now ARE buttons (and a first step toward the Phase 3 ride form).
   * The final "Anywhere on campus" chip widens the offer so no student rules
   * themselves out for living off the beaten path. Order chosen so the
   * stagger reads naturally left-to-right.
   */
  protected readonly pickupSpots: readonly { label: string; href: string }[] = [
    'Exley',
    'Usdan',
    'Sci-Li',
    'Foss Hill',
    'Anywhere on campus',
  ].map((label) => ({
    label,
    href:
      'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request&body=' +
      encodeURIComponent(`Hi! I'd like a ride this Sunday. Pickup: ${label}.`),
  }));
}
