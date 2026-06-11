import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';
import { SceneDirective } from '../../../../shared/motion/scene.directive';

/**
 * jh-home-audience — SCENE 3 · A PLACE FOR YOU.
 *
 * Inside now: a warm pew vignette with morning light and a gold glow on the
 * open seat — the seat saved for you. Copy (eyebrow, "There's a place for you
 * here.", audience pills, one reassuring line) sits in a readable panel over
 * the scene. With jhScene active (desktop, motion-OK) the camera zooms INTO
 * the open hymnal on the pew, handing off to the Sunday scene. Static
 * everywhere else; jhReveal stays additive-only; no PII; no emoji.
 */
@Component({
  selector: 'jh-home-audience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  hostDirectives: [SceneDirective],
  host: {
    // Camera target: the open hymnal on the pew, in 1440×900 viewBox coords.
    'data-scene-x': '920',
    'data-scene-y': '536',
  },
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
