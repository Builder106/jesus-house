import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';
import { SceneDirective } from '../../../../shared/motion/scene.directive';

/**
 * jh-home-values — SCENE 4 · SUNDAY MORNING (the sanctuary).
 *
 * The sanctuary vignette: chancel, lectern, standing cross, and the great
 * stained-glass arch. While pinned (jhScene, desktop + motion-OK) the four
 * Sunday beats — Welcoming · Rooted · Together · Sending — each take the
 * stage in turn, then the camera zooms INTO the stained glass, whose deep
 * indigo hands off seamlessly to the cathedral story section below.
 *
 * Static baseline (SSR / no-JS / mobile / reduced-motion): the scene
 * illustrates a normal section — heading panel + a beats grid, all fully
 * visible. No member PII, no real photos (window panes are future PHOTO
 * SLOTs), no emoji.
 */
@Component({
  selector: 'jh-home-values',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  hostDirectives: [SceneDirective],
  host: {
    // Camera target: the cross at the heart of the stained-glass arch (1440×900
    // viewBox) — the camera dives into it as the scene hands off to the cathedral.
    'data-scene-x': '720',
    'data-scene-y': '330',
  },
  templateUrl: './values.html',
  styleUrl: './values.css',
})
export class HomeValues {
  /** The four beats of a Sunday, in journey order. The numeral + label render
   *  as a paired kicker above each beat word (a magazine-style index). */
  protected readonly beats: ReadonlyArray<{
    index: string;
    label: string;
    word: string;
    line: string;
  }> = [
    {
      index: '01',
      label: 'Arrival',
      word: 'Welcoming',
      line: "You'll be greeted at the door, never singled out.",
    },
    {
      index: '02',
      label: 'The Word',
      word: 'Rooted',
      line: 'Honest teaching from the Bible, in about ninety minutes.',
    },
    {
      index: '03',
      label: 'The Family',
      word: 'Together',
      line: 'A warm, multicultural family: students and neighbors, side by side.',
    },
    {
      index: '04',
      label: 'The Sending',
      word: 'Sending',
      line: 'You leave with people who will know your name.',
    },
  ];
}
