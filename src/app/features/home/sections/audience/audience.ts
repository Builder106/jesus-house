import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';

/**
 * jh-home-audience — "There's a place for you here."
 *
 * The welcome beat of the "COME AND SEE" journey: a warm, airy panel that
 * names who Jesus House is for. A gold script-feel eyebrow ("Whoever you
 * are") sits above the headline, followed by a row of soft-filled audience
 * pills that fade in on a stagger, and one reassuring sentence beneath.
 *
 * Light section on the default jh-cream ground, separated from the section
 * above by a leading jh-rule hairline. No CTAs (the Students pill nods to the
 * Wesleyan RCF idea in copy only). Lighter vertical rhythm (py-16 sm:py-20).
 *
 * SSR-safe / no-JS: all content is fully visible by default; the jhReveal
 * directive only ADDS entrance motion and honors prefers-reduced-motion.
 * No member PII, no real photos, no emoji.
 */
@Component({
  selector: 'jh-home-audience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './audience.html',
  styleUrl: './audience.css',
})
export class HomeAudience {
  /**
   * Audience labels. The first pill ("Students") quietly anchors the
   * Wesleyan RCF idea; the rest widen the welcome. Order chosen so the
   * stagger reads naturally left-to-right, top-to-bottom.
   */
  protected readonly audiences: readonly string[] = [
    'Students',
    'Families',
    'New to Middletown',
    'Young adults',
    'Visitors',
    'Anyone seeking',
  ];
}
