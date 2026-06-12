import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RevealDirective } from '../../shared/motion/reveal.directive';

/**
 * jh-rcf — Wesleyan RCF (Redeemed Campus Fellowship).
 *
 * The parish's student ministry at Wesleyan: a weekday-and-Sunday rhythm of
 * worship, study, games and food, run by student leaders from Jesus House.
 * Built in the same "COME AND SEE" language as /visit — a warm typographic
 * intro (with a flame motif, RCF's mark), a "who we are" beat, the weekly
 * gatherings as floating cards, a "what to expect" beat, the campus ride tie-in,
 * and one deep-indigo (jh-night) close echoing the home story.
 *
 * Conventions reused from the foundation contract:
 *   • Eyebrows: .jh-script-eyebrow (warm) + .jh-eyebrow (structural).
 *   • CTAs: rounded-full pills — bg-jh-red is the ONLY CTA hue; ghost = border-jh-blue.
 *   • Floating panel: rounded-lg border border-jh-rule bg-jh-surface p-8.
 *   • Motion is additive only via [jhReveal]; SSR / no-JS / reduced-motion leave
 *     all content fully visible.
 *
 * Verified facts only (RCF launch + meeting flyers, Apr–May 2026): Friday
 * fellowship 4–5 PM in Rehearsal Hall 109 (worship · prayer · Bible games · ice
 * cream); Saturday study 5–7 PM in PAC 333; Sunday service 9:00 AM, 120
 * Washington Street. NO student names or photos (PII) —
 * "student leaders" stays generic; PHOTO SLOT placeholders only. No emoji.
 */
@Component({
  selector: 'jh-rcf',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  templateUrl: './rcf.html',
  styleUrl: './rcf.css',
})
export class Rcf {
  /** RCF's public channel (regional account — confirm/replace if the parish opens a Wesleyan one). */
  protected readonly instagramHandle = '@rcfcampus';
  protected readonly instagramHref = 'https://instagram.com/rcfcampus';

  protected readonly rideMailto =
    'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request%20(RCF)';
  protected readonly visitPath = '/visit';

  /** Weekly gatherings, in the order a student meets them through the week. */
  protected readonly gatherings: ReadonlyArray<{
    name: string;
    when: string;
    where: string;
    blurb: string;
  }> = [
    {
      name: 'Friday Fellowship',
      when: 'Fridays · 4–5 PM',
      where: 'Rehearsal Hall 109',
      blurb: 'Worship, prayer, Bible games — and ice cream to close out the week together.',
    },
    {
      name: 'Saturday Study',
      when: 'Saturdays · 5–7 PM',
      where: 'PAC 333',
      blurb: 'Prayer, group study, and snacks — bring your questions, no experience needed.',
    },
    {
      name: 'Sunday Service',
      when: 'Sundays · 9:00 AM',
      where: '120 Washington Street',
      blurb: 'Worship with the whole parish. No car? We pick you up from campus and bring you back.',
    },
  ];
}
