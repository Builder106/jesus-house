import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';

/**
 * jh-home-values — "What Sunday is like".
 *
 * A pinned-headline value scroll (the Serve Robotics pattern). A sticky left
 * column holds the section headline while four beats scroll past on the right,
 * one per screen. Each beat = a big Fraunces word + one sentence + a
 * hairline-framed placeholder image slot.
 *
 * The pin is pure CSS `position: sticky` — no scroll listeners, no JS — so it
 * works on the server and with JS disabled. Entrance motion is layered on via
 * the [jhReveal] directive, which keeps content fully visible under SSR /
 * no-JS / reduced-motion and only ADDS the fade-slide when motion is allowed.
 *
 * Responsive: below `lg` the layout is a single column — the headline sits on
 * top (not pinned) and the beats stack beneath it. At `lg` and up the headline
 * pins while the beats scroll.
 *
 * No member PII and no real photography yet: each image slot is a
 * hairline-framed warm colour field carrying a decorative red-door motif or
 * the RCCG seal, annotated with a `PHOTO SLOT` comment for the photo session.
 */
@Component({
  selector: 'jh-home-values',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './values.html',
  styleUrl: './values.css',
})
export class HomeValues {}
