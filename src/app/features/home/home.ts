import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HomeHero } from './sections/hero/hero';
import { HomeRide } from './sections/ride/ride';
import { HomeAudience } from './sections/audience/audience';
import { HomeValues } from './sections/values/values';
import { HomeStory } from './sections/story/story';
import { HomeComeAndSee } from './sections/comeandsee/comeandsee';

/**
 * jh-home — the "COME AND SEE" journey (John 1:46).
 *
 * Composes the six home-page sections in narrative order — the road → the red
 * doors of the meetinghouse → the Jesus House family:
 *
 *   1. jh-home-hero        — the invitation ("Come and see")
 *   2. jh-home-ride        — the road / ride ministry ("No car? No problem")
 *   3. jh-home-audience     — who it's for ("There's a place for you here")
 *   4. jh-home-values       — pinned value scroll ("What Sunday is like")
 *   5. jh-home-story        — the one deep-indigo cathedral beat ("Our family")
 *   6. jh-home-comeandsee   — closing invitation (9:00 AM · address · CTAs)
 *
 * The shell (app.html) provides the loader, fixed pill header, ride-progress
 * rail, and footer around this routed content — sections build only what sits
 * inside the router-outlet. Each section owns its own motion, ground, and
 * spacing; this component is a thin, presentation-free composition root.
 */
@Component({
  selector: 'jh-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeHero, HomeRide, HomeAudience, HomeValues, HomeStory, HomeComeAndSee],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
