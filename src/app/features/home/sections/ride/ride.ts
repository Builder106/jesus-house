import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SceneDirective } from '../../../../shared/motion/scene.directive';
import { SceneIdle } from '../../../../shared/ui/scene-idle/scene-idle';
import { RoadsideSign } from './roadside-sign';

/**
 * jh-home-ride — SCENE 2 · THE ROAD TO US (ride ministry).
 *
 * A picture-book road vignette: Sunday morning, the red car on its way to the
 * meetinghouse. The copy, the ride links, and the pickup spots are on the
 * church's roadside sign (RoadsideSign). With jhScene active the stage pins
 * and the camera zooms INTO the car's rear window, onto the Bible on the back
 * seat, handing off to the pew scene.
 */
@Component({
  selector: 'app-home-ride',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RoadsideSign, SceneIdle],
  hostDirectives: [SceneDirective],
  host: {
    'data-scene-x': '866',
    'data-scene-y': '630',
  },
  templateUrl: './ride.html',
  styleUrl: './ride.css',
})
export class HomeRide {}
