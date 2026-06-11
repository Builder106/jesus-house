import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';

/**
 * jh-home-story — OUR STORY · the cathedral moment.
 *
 * The ONE deep-indigo (jh-night) section on the home page, sitting fifth in the
 * "COME AND SEE" journey (road → red doors → family). On the warm/light page it
 * reads like stepping inside: reverent, still, cream type on deep indigo with a
 * gold script-feel eyebrow. A short warm paragraph, then a stats row of the
 * verified facts (service time, address, ride, welcome), and the RCCG seal with
 * the "A parish of The Redeemed Christian Church of God" line.
 *
 * Contract notes:
 *   • Cathedral ground: bg-jh-night text-jh-cream; body text-jh-cream/70,
 *     accents text-jh-gold (never text-jh-soft on dark).
 *   • Motion is additive only — entrance reveals via [jhReveal]. SSR / no-JS /
 *     reduced-motion → fully visible; the reveal system owns the hidden state.
 *   • No member PII, no founding-year claim, no real photos (decorative seal
 *     + hairline-framed colour field only).
 */
@Component({
  selector: 'jh-home-story',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './story.html',
  styleUrl: './story.css',
})
export class HomeStory {
  /** Verified-fact stat tiles for the cathedral row. */
  protected readonly stats: ReadonlyArray<{ value: string; label: string }> = [
    { value: '9:00 AM', label: 'Every Sunday' },
    { value: '120 Washington St', label: 'Middletown, CT' },
    { value: 'A ride away', label: "We'll come get you" },
    { value: 'All welcome', label: 'Come as you are' },
  ];
}
