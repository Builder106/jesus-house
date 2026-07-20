# Design Research — Award-Winning Storytelling Sites → Jesus House Redesign

> Recorded 5 Awwwards "Storytelling" winners with Playwright (scrolling through each),
> then watched the recordings frame-by-frame with claude-video-vision. Recordings in
> `recordings/`. Goal: replace the too-safe v1 with a genuinely crafted, story-driven site.
> 2026-06-11.

## The five references (deliberately diverse)

| Site | What it is | The one idea worth stealing |
|---|---|---|
| **St. Beatus Caves** (beatushoehlen.swiss) | A cave attraction — *a place you visit* | Content floats in a giant rounded card on a warm-dark ground; gold **script eyebrow over bold uppercase headings**; **audience pills** ("for all those who want to marvel together: Families, Schools, Clubs, Groups, Weddings") |
| **Serve Robotics** (serverobotics.com) | Delivery-robot company | Light ground + **one rich brand color + one bright accent**; **pinned-headline value scroll** (Safe/Smart/Fast/Sustainable); a **tiny brand character travels down the scroll-progress line** |
| **Emily Nixon** (emilynixon.com) | Handmade jewelry | **Split-screen hero: an intimate human moment beside a place/atmosphere video**; warm earthy palette; elegant serif wordmark + small-caps letterspaced labels + hairline rules |
| **21 Hrs on the Moon** (21hrs.space) | Apollo narrative | **Scroll-as-journey metaphor** ("SCROLL TO LAND"); branded loader; total commitment to one concept across cursor/chrome/type |
| **Ten Years Away** (ten.375.studio) | A comic / personal story | **Narrative loader** (a counter that's part of the story); **bookend timeline framing**; one hero object floating with a soft shadow; intimate first-person voice ("a true story, ours") |

## Cross-cutting patterns (what makes these "awarded," not "mid")

1. **One concept, carried through every detail.** Each site has a single organizing metaphor and every element — loader, cursor, nav, type, motion — reinforces it. Our v1 had no concept; it was a tasteful brochure. That is the core diagnosis.
2. **A branded loader/intro sets the tone** in ~1s before the reveal.
3. **Cinematic hero** — full-bleed video or a single floating hero object with a soft shadow and gentle motion; an emotional headline in a contrasting serif/script.
4. **"Content on a canvas"** — sections sit in large rounded panels on a contrasting ground, with tilted leading edges as they transition in.
5. **Pinned-headline + scrolling value sequence** — one idea per screen, paired with imagery, revealed on scroll.
6. **A brand character on the scroll-progress line** — motion tied to identity, and delightful.
7. **Masked / word-by-word text reveals** on scroll.
8. **Type contrast** — bold condensed/uppercase sans for structure + a warm old-style serif or script for emotion. A script "eyebrow" over uppercase headings reads especially warm.
9. **Big-number stats rows** — icon + number + label, scannable.
10. **Audience/segment pills** — name each kind of visitor so they feel addressed.
11. **Pair the human moment with the place** — warmth = people + atmosphere shown together.
12. **Restrained palette** — one rich ground + one bright accent + refined neutrals; never a swatch zoo.
13. **Refined micro-typography** — small-caps letterspaced labels, hairline rules, generous air.
14. **Floating pill nav** — rounded, detached from the screen edge.

---

## The redesign concept for Jesus House: **"Come and see."**

The organizing idea — *the* concept v1 lacked — is the parish's own act, drawn from
John 1:46: **"Come and see."** The whole site is one **invitation-journey**: from the
road, across Middletown, through the **red doors** of the meetinghouse, into the warmth of
the Jesus House family. This isn't decoration — it's literally what the parish does every
Sunday (they drive out and bring students in). The site enacts the welcome.

The journey maps the existing nav onto a narrative spine:

1. **The invitation** (hero) — "Come and see." A cinematic hero of the white meetinghouse
   and its red doors; emotional serif headline; Sunday 9:00 AM + a single quiet "Plan your
   visit" / "Need a ride?" pair. (See *hero note* below re: photography.)
2. **The road to us** — the ride ministry, made literal: as you scroll, a **tiny car
   travels down the scroll-progress line** (Serve's robot-on-a-line, reimagined as "we'll
   come get you"). Copy: *No car? No problem.*
3. **Who you'll find** — "There's a place for you here," with **audience pills**: Students ·
   Families · New to Middletown · Young adults · Visitors (St. Beatus's "marvel together").
4. **What Sunday is like** — a pinned-headline **value scroll**: Welcoming · Rooted ·
   Together · Sending — one idea per screen, paired with imagery, revealed on scroll.
5. **Our family, our story** — warm first-person framing; a **bookend** "2005 → today"
   (the parish's 20 years, from the chat) as a quiet timeline device; **stats row**
   (e.g. *20 years · one family*, *Sundays 9:00 AM*, *120 Washington St*, *a ride away*).
6. **Come and see** (close) — the invitation restated; service time, address with map,
   ride + plan-a-visit CTAs, the RCCG seal and affiliation line.

### What stays (non-negotiables, unchanged by the redesign)
- The **official RCCG seal** is the mark; palette derives from it (#28166F / #DA251D / #00923F).
- **Light, warm, reverent** — the locked workspace aesthetic. The redesign adds cinema and
  motion *without* going dark/techy like the Moon/Ten-Years references.
- **No member PII / no member photos** without consent. Fraunces + Mulish type system holds.
- Angular SSR + Vercel; motion must respect `prefers-reduced-motion` and stay SSR-safe.

### How the redesign differs from v1 (the fix for "mid")
- v1 was a static brochure with no spine. The redesign has a **concept** ("Come and see")
  expressed as a **scroll journey** with real motion: branded loader, cinematic hero,
  content-on-canvas panels with tilted transitions, the **car-on-the-scroll-line** signature,
  pinned value scroll, masked text reveals, script-eyebrow-over-uppercase headings, stats
  row, audience pills. Same palette and content; vastly more craft and story.

### Two genuine forks for the user (deciding these before rebuild)
- **Palette depth** — stay fully light-warm, *or* allow one or two rich **seal-blue
  "cathedral" sections** (a single dark, reverent anchor — e.g. the prayer/story moment) for
  cinematic contrast while the site stays predominantly light.
- **Motion intensity** — *expressive* (loader + car-on-line + pinned scroll + reveals,
  full Awwwards energy) vs *restrained-but-alive* (tasteful reveals + the car motif only).
- **Hero approach given no photos yet** — the cinematic building hero needs the planned
  photo session. Until then: a **crafted typographic/illustrative hero** (the red-door motif
  + motion) that upgrades to full-bleed footage when photography lands.

### Motion engineering note
Use a real scroll/animation lib (Motion One — already in the workspace's toolkit — or GSAP
+ ScrollTrigger) lazy-loaded client-side only; everything must render correctly with JS off
(SSR) and collapse gracefully under `prefers-reduced-motion`. The car-on-scroll-line and
pinned sequences are scroll-driven, not autoplay, so they stay performant.
