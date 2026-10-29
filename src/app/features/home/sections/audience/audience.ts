import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';
import { SceneDirective } from '../../../../shared/motion/scene.directive';
import { SceneIdle } from '../../../../shared/ui/scene-idle/scene-idle';

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
