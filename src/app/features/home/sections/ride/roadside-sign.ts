import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';

/**
 * The church's roadside letterboard in the ride scene: the ride copy in
 * plastic letters, the ride links as plates hanging under the board, and the
 * pickup spots as street blades on its post. Each blade is a ride request
 * from that spot. The roof, posts, and grass are art (art-src/scenes/signs.py);
 * the text is real text.
 */
@Component({
  selector: 'app-roadside-sign',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './roadside-sign.html',
  styleUrl: './roadside-sign.css',
})
export class RoadsideSign {
  /** Ride contact links, kept here so copy and href stay in lockstep. */
  protected readonly rideMailto = 'mailto:rccgjhmiddletown@gmail.com?subject=Ride%20request';
  protected readonly rideTel = 'tel:+18605184640';

  /**
   * Common Wesleyan pickup spots. The final "Anywhere on campus" blade widens
   * the offer so no student rules themselves out for living off the beaten
   * path.
   */
  protected readonly pickupSpots: readonly string[] = [
    'Exley',
    'Usdan',
    'Sci-Li',
    'Foss Hill',
    'Anywhere on campus',
  ];

  protected spotMailto(spot: string): string {
    return `${this.rideMailto}%20from%20${encodeURIComponent(spot)}`;
  }
}
