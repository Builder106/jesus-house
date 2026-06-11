import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RevealDirective } from '../../../../shared/motion/reveal.directive';

/**
 * jh-home-comeandsee — closing invitation (the journey's destination).
 *
 * Restates the "Come and see" promise on the warm cream ground after the
 * deep-indigo story-cathedral, resolving the page on a calm, reverent note:
 * the John 1:46 headline, a clean service card (Sunday · 9:00 AM · address ·
 * directions), the primary Plan-your-visit / Need-a-ride CTAs, and a warm
 * one-line invitation.
 *
 * Static + SSR-safe by construction: content is fully visible with JS off;
 * the jhReveal directive only ADDS entrance motion on a visible baseline and
 * no-ops under prefers-reduced-motion. No member PII — only the parish's
 * public address, phone, and email. No real photos yet: the decorative beat
 * uses a hairline-framed warm field with the seal + red-door motif, annotated
 * as a PHOTO SLOT for later.
 */
@Component({
  selector: 'jh-home-comeandsee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  templateUrl: './comeandsee.html',
  styleUrl: './comeandsee.css',
})
export class HomeComeAndSee {}
