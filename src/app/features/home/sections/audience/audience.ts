import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';
import { SceneDirective } from '../../../../shared/motion/scene.directive';
import { SceneIdle } from '../../../../shared/ui/scene-idle/scene-idle';

/**
 * jh-home-audience — SCENE 3 · A PLACE FOR YOU.
 *
 * Inside now: a warm pew vignette with morning light and the Bible open on
 * the cushion. The heading is engraved on a brass plaque on the wall, and
 * a place card stands on the seat for each kind of visitor: the seat saved
 * for you. With jhScene active the camera zooms INTO the picture on the
 * Bible's page, handing off to the Sunday scene. jhReveal stays
 * additive-only; no PII; no emoji.
 */
@Component({
  selector: 'app-home-audience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, SceneIdle],
  hostDirectives: [SceneDirective],
  host: {
    // Camera target: the stained-glass picture on the open Bible's left page,
    // in 1440×900 viewBox coords (art-src/scenes/pew.py TARGET).
    'data-scene-x': '940',
    'data-scene-y': '565',
  },
  templateUrl: './audience.html',
  styleUrl: './audience.css',
})
export class HomeAudience {
  /**
   * One place card each. The first ("Students") quietly anchors the Wesleyan
   * RCF idea; the rest widen the welcome. Order chosen so the stagger reads
   * naturally left to right.
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
