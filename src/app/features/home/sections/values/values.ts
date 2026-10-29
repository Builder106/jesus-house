import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RevealDirective } from '../../../../shared/motion/reveal.directive';
import { SceneDirective } from '../../../../shared/motion/scene.directive';
import { SceneIdle } from '../../../../shared/ui/scene-idle/scene-idle';
import { ScrollScrubber } from '../../../../shared/motion/scroll-scrubber';

/**
 * Sunday morning values section.
 *
 * The four beats (Welcoming, Rooted, Together, Sending) are the order of
 * service on a bulletin in the scene. While pinned via jhScene, scroll
 * progress picks the item the bulletin is on, and the same index drives the
 * people in the room (the idle layer's `beat`). Unpinned, no item is marked.
 */
@Component({
  selector: 'app-home-values',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, SceneIdle],
  hostDirectives: [SceneDirective],
  host: {
    // Camera target: cross coordinate within stained-glass arch (1440×900 viewBox).
    'data-scene-x': '720',
    'data-scene-y': '300',
  },
  templateUrl: './values.html',
  styleUrl: './values.css',
})
export class HomeValues {
  /** The four beats of a Sunday, in service order. */
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

  /** The bulletin item the scroll is on, or -1 when the scene is not pinned. */
  protected readonly activeIndex = signal(-1);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollScrubber = inject(ScrollScrubber);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      // `--zoom` is written every scroll frame by the shared jhScene directive
      // (a host directive on this same element); read it back here rather
      // than re-measuring the same geometry. Reading a sibling consumer's
      // write from within the ScrollScrubber's batched read phase is one
      // frame stale, which is imperceptible at scroll-frame cadence.
      const hostEl = this.host.nativeElement;
      const measure = (): number => {
        if (!hostEl.classList.contains('scene--active')) return -1;
        const zoom = parseFloat(getComputedStyle(hostEl).getPropertyValue('--zoom')) || 0;
        // Mirrors the --p defined in values.css: this scene's action runs
        // over --zoom 0→.667 (see the 400svh pin note there), then holds.
        return Math.min(1, zoom / 0.667);
      };
      const apply = (p: number) => {
        if (p < 0) {
          this.activeIndex.set(-1);
          return;
        }
        // The four items share the bulletin's 0→0.55 read window equally;
        // the last one holds through the lift-away and the dive.
        const t = Math.min(1, p / 0.55);
        this.activeIndex.set(Math.min(this.beats.length - 1, Math.floor(t * this.beats.length)));
      };
      const unregister = this.scrollScrubber.register({ measure, apply });
      this.destroyRef.onDestroy(unregister);
    });
  }
}
