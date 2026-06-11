import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RevealDirective } from '../../shared/motion/reveal.directive';

/**
 * jh-visit — Plan a Visit.
 *
 * The /visit page, restyled to the redesigned "COME AND SEE" language so it
 * reads as part of the same journey as the home page: a warm typographic
 * intro, a "What to expect" beat, a When-and-where pair (the canonical
 * floating service card + a directions card), a ride-ministry beat, and a
 * single deep-indigo (jh-night) cathedral close echoing the home story.
 *
 * Conventions reused from the foundation contract:
 *   • Eyebrows: .jh-script-eyebrow (warm, gold/blue) + .jh-eyebrow (structural).
 *   • CTAs: rounded-full pills — bg-jh-red is the ONLY CTA hue; the ghost pill
 *     is border-jh-blue. Ride mailto + tel + Google Maps directions per spec.
 *   • Hairlines: border-jh-rule on light, border-jh-cream/15 on the dark close.
 *   • Floating panel: rounded-lg border border-jh-rule bg-jh-surface p-8.
 *   • Motion is additive only via [jhReveal] — SSR / no-JS / reduced-motion
 *     leave all content fully visible; the reveal system owns the hidden state.
 *
 * Verified facts only: Sunday 9:00 AM, 120 Washington Street, Middletown CT
 * 06457, (860) 518-4640, rccgjhmiddletown@gmail.com. No member PII, no
 * founding-year claim, no real photos yet (PHOTO SLOT placeholders + the seal /
 * red-door motif only). No emoji.
 */
@Component({
  selector: 'jh-visit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './visit.html',
  styleUrl: './visit.css',
})
export class Visit {
  /** Contact links — kept here so copy and href stay in lockstep. */
  protected readonly rideMailto =
    'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request';
  protected readonly rideTel = 'tel:+18605184640';
  protected readonly directionsHref =
    'https://maps.google.com/?q=120+Washington+Street+Middletown+CT+06457';
}
