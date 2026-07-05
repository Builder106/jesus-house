# JOURNAL — RCCG Jesus House, Middletown

> Dated log of decisions, pivots, incidents, and quotes worth remembering. Not
> a changelog (commit messages are that) and not a ticket tracker — this
> captures the human context that disappears within weeks. Reverse-chronological.
> Tag with `#decision` / `#pivot` / `#incident` / `#quote` / `#feedback` /
> `#milestone`. One paragraph max per entry.

## 2026-07-04 — The invitation was rising behind the curtain: a stacking bug ate the story→comeandsee hand-off #incident

Owner asked how the site reads after the story section on mobile, and the frame walk showed ~2.5 screens of featureless cream with one orphaned red map pin floating in it. The -100dvh overlap was doing its job — "Come and see." was right there in the DOM, rising on schedule — but it painted BEHIND the story's held veil: the veil is positioned (z-index 3) while comeandsee is a plain static section, and static content can never out-paint a positioned sibling's descendants. The one thing that DID poke through, the pin, was jh-lottie's `position: relative` host — which is why the symptom looked like a content gap with a stray glyph instead of what it was. Fix is two lines in styles.css: `position: relative; z-index: 4` on the overlapped comeandsee. The other three scene→scene hand-offs never had the bug because scenes' sticky stages are positioned. Lesson: `elementFromPoint` found in seconds what three screenshots of blank cream couldn't explain — when content "isn't there," first ask what's painting on top of it.

## 2026-07-04 — The dove flies under reduced motion too #decision #feedback

Owner: "Replace the static dove on mobile with animated Lottie dove that's on desktop." Nothing gates the dove by viewport — the mobile/desktop split was really the reduced-motion split: their phone runs Android "Remove animations" (same setting that motivated the static fallback on 2026-07-02), so `jh-lottie` was doing exactly what it was designed to do. Rather than blanket-ignore the OS signal, `jh-lottie` gained an opt-in `ignoreReducedMotion` input (default false, so the pin icons and any future accents still honor it) and only the story dove sets it — the judgment being that a gently looping 64px dove is not the motion "Remove animations" protects against, and on low-end phones that setting is often about performance, not vestibular comfort. Verified on the phone with reduced motion active: fallback hidden, canvas frames advancing.

## 2026-07-04 — "Scrolling feels choppy now" was the phone's power saving mode, not the build #incident

Owner reported the localhost build suddenly lagging right after the carousel retiming landed — a textbook setup for blaming the last change. Every kill-switch said otherwise: disabling the carousel scrub changed nothing (39.2fps), hiding ALL scene art changed nothing (42.6fps), warm vs cold pass changed nothing, skin temp was a cool 35.9° — the ~40fps ceiling was page-wide and content-independent. The tell was p50 = 16.7ms: the A15's 90Hz panel was pacing at 60Hz. `settings get global low_power` → 1 — Samsung's power saving mode had been switched on (phone charging over USB all day), which pins the display to 60Hz (`refresh_rate_mode` 0) and caps the CPU. Toggling `low_power` off via adb does NOT restore the refresh rate — `refresh_rate_mode` had to be set back to 2 (adaptive) separately. After restoring both, an A/B on the same instrument put local (32–41fps up) and prod (40fps up) within run-to-run noise of each other: the retiming regressed nothing. The requested Lighthouse audit (CLI, mobile emulation) scored 55/100 — but entirely on simulated-4G *load* metrics (FCP 4.9s / LCP 7.3s / SI 11.2s); runtime health is fine (TBT 180ms, CLS 0.018). Lesson for the rig: device power state is now the FIRST check before any perf comparison, alongside skin temp — a phone can lie about your build in at least two ways.

## 2026-07-04 — The carousel now moves at finger speed: 400svh pin + a wider action window #decision #feedback

Owner: "It feels like the carousel's scrolling speed is faster than the rest of the site" — and the math agreed: the four beats' 768px of card travel was compressed into ~330px of page scroll (beats window 0→.38 of a 320svh pin), so cards moved ~2.3× the finger. Offered a shorter-travel compromise or a longer pin; owner chose the journey — "Lengthen the journey, users will be okay with it." The values pin grew to 400svh (ride/audience stay 320svh), the scene's `--p` divisor widened from .545 to .667, the beats read window from 0→.38 to 0→.55, the dive from .45–.92 to .62–.92, and the SDA `animation-range` retimed to match (contain 41.35%→61.36%). Verified on the phone, not on paper: 770px of scroll drives 768px of card travel — ratio 1.002, true 1:1.

## 2026-07-04 — Low-tier phones get a real site: bitmap art, a grain-filter confession, and the invisible-zoom tax #decision #milestone

Owner rejected "bank the win" — "the site is unusable for anyone with a low-tier phone" — so this became a GPU-fill campaign, run entirely on the throttled Galaxy A15 (the honest low-tier proxy) with a new tracing-free rAF frame-time meter (DevTools tracing itself cost ~30% and heated the device). The bisection matrix was decisive and humbling in order: baseline 11.5fps with 2.6-SECOND worst frames; arts hidden 45.8fps (the ceiling); arts visible-but-static 41–44fps; arts animated with zoom capped at 6× or 12× — no change at all. So the cost was never the zoom amount or the vector complexity per se: Chrome re-renders the SVGs from scratch at every raster-scale step of the dive, and — found while debugging a ghost-glyph band baked into a capture — every scene art carried a full-canvas `feTurbulence` "paper grain" rect, a software-path per-pixel filter that turned each re-raster into a small catastrophe. Fix shipped in three parts: (1) the three scene SVGs became 2880×1800 WebP bitmaps (42–51KB each — bitmap layers re-raster as a texture sample; sources preserved verbatim in `art-src/` with a regeneration recipe, grain omitted from the captures); (2) the story frame had already given up its text the day before; (3) the sweetest cut — the hero portal art fades to opacity 0 at enter 0.45 but its keyframes kept scaling the invisible layer to 6.74×, so the compositor was re-rastering the DOM door at 5× the texture area for literally nothing on screen — both the keyframes and the var(--enter) fallbacks now HOLD at the last visible scale (2.89 art / 1.9 light), zero visual delta. Final numbers at the hottest state measured all day (39.7° skin, actively throttling): up 41.7fps/worst 267ms, down 40.2fps/worst 233ms — within ~9% of the no-art ceiling, full visuals, on a phone that started the day at 11.5fps with multi-second freezes. Note for the retro: two of the three real fixes were found by refusing to trust a hypothesis without a kill-switch measurement, and one was found by looking at a broken screenshot.

## 2026-07-03 — The dives went compositor-side: scroll-driven animations + the story frame gave up its text #decision #milestone

Owner picked option 1 for the up-scroll GPU stalls, and it shipped in two moves. First: every scene art's zoom transform now runs as a CSS scroll-driven animation (`animation-timeline: view()`) declared in a global styles.css block — the mapping fell out beautifully, since jhScene's `--zoom` is definitionally identical to the host's `contain` view-timeline progress, so the `--n` windows became `animation-range: contain 24.53% contain 50.14%` and the hero's 0.15/0.18/0.2/0.45 breakpoints became keyframe offsets; the var(--n) transforms stay as the non-SDA fallback, and desktop verification showed matrix-level parity (13.1125 animated vs 13.12 expected). Two traps: Angular's emulated encapsulation scopes `@keyframes` names in component styles but does NOT rewrite `animation-name` references inside `@supports` — the animation silently never attached (caught only because the verification checked `getAnimations()`, not just the computed transform, which the JS fallback was faking correctly) — so the whole block must live in the global stylesheet; and the story scene still stalled ~400–580ms after the migration because its `.scene__frame` — unlike every other scene — wrapped the section's TEXT, stats, seal PNG, and dove Lottie inside the scaled layer, rastering all of it at up to 12×. The frame gave up its content: the copy block is now a stage-level sibling (it fades to 0 just as the zoom begins, so the only visual difference is ghosted ≤12%-opacity text no longer riding the first beat of the zoom — imperceptible). Cooled-device numbers, same synthesized 9s gestures: up-scroll 47→79fps (p99 99→39ms, worst freeze 890→324ms, the 3s cream checkerboard gone — the mid-dive cathedral closeup is now actually visible on screen), down-scroll 62→85fps. One thermal scare en route: a single 834ms down-gap that vanished after a 45s cool-down — perf runs back-to-back on a fanless phone lie.

## 2026-07-03 — Scroll-UP lag is the art layers re-rastering on the GPU, proven by kill-switch bisection #incident

Owner: "The site lags a lot when scrolling back up." Confirmed and root-caused on-device — and it is NOT the style-recalc problem from this morning (main thread is nearly idle scrolling up: 159ms style, longest task 20ms). Up-scroll shows 400–890ms compositor freezes (down-scroll control on the same build: max 40ms — the asymmetry is real), and the cc/viz trace names the time: `RasterDecoderImpl::DoEndRasterCHROMIUM::Flush` in the GPU process — GPU-side rasterization, with single 132MB command-buffer flushes. The screen recording shows what users feel: ~3 seconds of blank cream (checkerboard) where the values/ride/hero scenes should be. Mechanism: each `.scene__art` is a `will-change: transform` layer whose scale is driven per-frame from the main thread up to 23×; scrolling DOWN the raster scale climbs gradually and the max-zoom moment exits behind the veil, but scrolling UP you re-enter every scene AT max zoom and Mali has to re-raster ~100-shape gradient-heavy SVGs at enormous raster scales in one burst. Hypothesis-testing discipline paid off twice: capping the transform scale to 8–9× did NOT fix it (raster area is quadratic — 81× base is still too much), killing backdrop-filters did NOT fix it, but hiding only the four `.scene__art` elements produced a flawless run (71fps, max frame delta 44ms, zero gaps) — conclusive bisection. Candidate fixes all have visible design costs (compositor-driven scroll animation pinning raster scale = blur during dive; hard zoom cap ≤4× = smaller shot; pre-rasterized art = permanent slight blur), so the call goes to the owner rather than shipping one unilaterally.

## 2026-07-03 — The recalc storm is fixed: @property inherits:false + write-to-consumers #decision #milestone

Shipped the fix for the morning's trace finding, and the mechanism matters more than the diff: the storm was never the number of `var()` references (5–9 per scene) but that unregistered custom properties INHERIT, so one per-frame `--zoom` write on a scene host forced Blink to restyle every descendant whether or not it read the value. The fix is three moves that only work together: (1) register all five per-frame scrub properties (`--zoom`/`--p`/`--n`/`--enter`/`--carousel-scrub`) as `@property { inherits: false }` in styles.css, which stops the cascade at the written element; (2) since the values now don't travel down the tree, mark every element whose CSS reads one with `data-scene-var` and have the writers (jhScene, hero, rcf, values, ride-progress) write directly onto each consumer — the `--p`/`--n` derivations moved from `.scene__stage` to `[data-scene-var]` so each consumer derives its own copy locally, keeping the math and the media-query variants in CSS where they belong; (3) unchanged-value guards in every writer, so the four scenes resting at zoom 0/1 cost nothing per frame. Two traps found on the way: `ride-progress` had its OWN `--p` (rail semantics, same name — global registration would have silently frozen the rail's fill/car, fixed by writing to both children), and the obvious verification probe lies — `CSS.registerProperty()` succeeding does NOT mean `@property` didn't apply (separate registries); had to prove non-inheritance behaviorally (child computes initial 0 while an unregistered control inherits). Verified on the same Galaxy A15 over the same USB CDP rig, identical 9.4s synthesized scroll, local build via `adb reverse`: style recalc 1,030ms→557ms, elements-per-recalc p90 178→6 (max 401→12), worst single recalc 27ms→7ms, average 49.5→60.4fps, janky frames 18.3%→8.6%. Scripting rose 365→664ms — not a regression but the main thread completing 22% more frames, each running the scrubber; total busy time is flat, just spread across shorter tasks. The trace harness now lives in `tools/device-perf/` with pass targets so the next regression gets caught by re-running it, not by a user's thumb.

## 2026-07-03 — First on-device trace: the `--zoom` writes are guilty, `scale()` is innocent #incident #milestone

First real-hardware profiling session: owner's Galaxy A15 over USB, `adb forward tcp:9222 localabstract:chrome_devtools_remote`, raw CDP attach (Chrome's HTTP `/json` list came back empty — had to go through the browser WebSocket), 9.4s synthesized scroll through the full page with invalidation tracking on. Verdict on the long-standing question: style recalc is 1,030ms of the scroll (vs 58ms paint + 80ms raster + exactly ONE layout), and the invalidation tracker names the scene hosts — "Inline CSS style declaration was mutated" on JH-HOME-STORY/HERO/AUDIENCE/VALUES/RIDE. Each per-frame `--zoom` write cascades to 178–401 descendants through the `var(--zoom)`→`--p` derivations; recalcs touching >50 elements alone cost 624ms, single recalcs up to 27ms (double a frame budget). Net: 49.5fps, 18.3% janky frames. The composited `scale()` architecture works exactly as designed — its only sin is mid-zoom raster blur (textures magnified before re-raster). The screen recording surfaced two UX finds the trace never would: ~9.7s of visually frozen hero pin (8 swipes before anything responds) and a 4.2s dead hold on the ride card. Fix direction: shrink the var() fan-out (write derived values on the few animated nodes, or move the scrub to compositor-side scroll-driven animations), not the transforms.

## 2026-07-03 — The carousel stopped snapping and started scrubbing #decision #feedback

One more round on the Sunday-mornings carousel. The prior day's fix made it scroll-driven (threshold-crossing calls Embla's `scrollTo`), but the owner wanted more: "Can you link it to vertical scroll instead?" Asked which of three concrete readings they meant — instant snap with no animation lag, continuous 1:1 scrubbing like the door/glass camera, or a device bug — and they picked continuous scrubbing. Rather than reaching into Embla's undocumented internal engine to hijack its transform (the obvious-looking path, and fragile across version bumps), the actual insight was that the pinned traversal is a single linear pass through four beats, never an infinite loop — so `loop:true`/Embla's physics aren't needed at all in that phase. `.embla--scrubbing` now swaps in a plain CSS transform keyed off a continuous `--carousel-scrub` (0→3) with `!important`, while Embla keeps full normal ownership (eased `scrollTo`, autoplay, `loop:true`) for the one case that still needs it — the unpinned short/landscape fallback. Verified with a video built specifically to distinguish "continuous" from "discrete": scroll forward, then briefly reverse mid-transition, then continue — a snapped carousel would just sit wherever it last landed through the reversal, but the recording shows the card genuinely holding near-still through the forward-then-back segment (net motion ≈0) before continuing on, confirming it's tracking a position, not a threshold.

## 2026-07-02 — Sprint C polish, and one item deferred on purpose #decision

Closed out the last punch-list items from the July UI round: the carousel card now vertically centers its content instead of leaving a dead gap below two lines of text, and the progress dots grew from a 3px hairline to 5px; the values panel dropped from `max-w-2xl` to `max-w-xl` (matching ride/audience's own width) because at 2xl its right edge landed almost exactly on x=720 — the stained-glass cross the scene is about to dive into — burying the dive target behind the copy for the whole read phase; the ride-progress rail's untraveled track went from `--color-jh-rule` (a hairline literally designed for borders on cream, next to invisible as a freestanding line) to a translucent violet-grey, with a `.jh-rail--dark` gold variant over night scenes, sharing a new `isDarkGroundInBand` helper extracted from the header's own dark-ground check rather than duplicating the veil-mode logic a second time; and the mobile menu got a real focus lifecycle — opening sends focus to the first link, Escape closes from anywhere (a document-level listener, live only while open) and returns focus to the toggle, but a link click closes WITHOUT stealing focus back, since the browser's own navigation is about to move it anyway. Deferred the hydration CLS fix (0.126, flagged back in the original SEO/perf audit): dug into it and found the likelier culprit isn't the pinned-scene height gating I'd assumed, but Embla's `.embla--ready` swap — the static SSR grid (4 full cards, naturally 400-600px tall) collapsing to a fixed 16rem carousel box the moment JS hydrates, unconditional on viewport. Confirmed the interaction risk directly: the SAME panel-narrowing change made moments earlier for the dive-target fix shrinks the static grid's available width, pushing it toward 2 columns and making the pre/post-hydration height gap WORSE, not better. Reconciling the two states without compromising the no-JS reading experience needs a standalone pass, not a line of CSS tacked onto this batch — said so rather than shipping a fix that might not fix anything, or might make it worse.

## 2026-07-02 — Screenshots lie about motion; the carousel finally scrolls with you #incident #feedback #decision

Owner, after the video-based mobile investigation: "the carousel still needs work. The cards don't move as I scroll vertically." True, and a real inconsistency — the Sunday-mornings carousel was the one scene on the whole page that ignored scroll (Embla, autoplay + dot-click only, `watchDrag: false`), while hero/ride/audience/story all treat scroll position as the entire interaction. Fixed by reading the SAME `--zoom` custom property the pinned scene's own `jhScene` directive already writes every frame (not re-measuring geometry a second time — that duplication is exactly what was flagged as a smell in `rcf.ts` earlier), mapping it onto the four beats across the panel's existing 0→.38 "read" window, and calling Embla's own `scrollTo()` when a threshold is crossed — so beat transitions still use Embla's built-in eased animation, not a hand-rolled transform. Autoplay now stops the instant the scene pins and only resumes in the un-pinned static/short-viewport fallback, so it can never race the scroll-driven advance. Verified the fix by RECORDING it, not screenshotting it — a wheel-driven scroll-through watched via claude-video-vision shows all four beats advancing cleanly in lockstep with scroll, dots updating in sync, before the dive into the glass takes over. This is the same lesson as the earlier door-zoom investigation this session: motion claims need motion evidence. Also worth recording precisely because it was a near-miss — chased a WebKit-specific ~150s-runtime freeze storm down to a plausible SVG-filter performance bug, disproved that with a control test, then proved with a differential wheel-vs-scriptedBy() test that the freeze was an artifact of my OWN verification script (WebKit throttles rapid scripted `scrollBy()` calls) and not a site bug at all — the discipline of ruling out your own test method before trusting a reproduction mattered as much as the reproduction itself.

## 2026-07-02 — The invisible dove: Lottie accents now have static stand-ins #incident #feedback

Owner: "The dove Lottie doesn't appear on mobile and you don't zoom into the
door when scrolling on mobile." Reproduced the dove under Playwright's
`reducedMotion: 'reduce'` + Pixel-7 profile against prod: `jh-lottie`
early-returns under reduced motion and leaves a blank canvas — the one place
the site broke its own "content is never hidden as a baseline" rule (their
phone runs Android "Remove animations", the June-12 lesson again). Fix:
`jh-lottie` now projects a static SVG fallback (`<jh-lottie><svg…/></jh-lottie>`)
shown on SSR / no-JS / reduced-motion / player-load failure and hidden once
the animation takes over — a hand-drawn dove for the story scene, a map pin
for the two "Get directions" links; a failed player import also falls back
instead of holding the box invisible. The door-zoom half did NOT reproduce:
same emulation shows `portal--active`, `--enter` progressing, art scaling,
zero console errors. Suspect a stale cached bundle or an in-app WebView on
the specific phone; as defense, the ScrollScrubber now isolates each
consumer in try/catch so one device-quirk exception can never freeze every
pinned scene's `--zoom` again (previously a single throw killed the whole
batch — the exact signature of "scrolls like a regular webpage").

## 2026-07-02 — The header joined the scene; the empty half-screens got their art #decision

Sprint B of the July UI round. The floating white pill over the night scenes
was the last "UI island" — now sections mark themselves `data-jh-header-dark`
(plain / `until-veil` / `when-veiled`) and the header runs one ScrollScrubber
consumer that flips it to a night pill while a dark surface sits underneath;
veil-covered checks read the veil's computed opacity, and a trailing 120ms
re-check after each scroll burst corrects the one-frame staleness that a
discrete End/Home jump would otherwise leave behind. The desktop right-half
emptiness on /visit and RCF got scene-language vignette cards instead of
whitespace: the meetinghouse portrait (hero), the pew with a seat saved
(what-to-expect), and RCF's lantern-and-stools gathering circle — each with a
PHOTO SLOT comment for when the parish photo session happens. Contrast pass:
new `--color-jh-gold-ink` (#7d6212, ≥5:1 on cream) for gold TEXT on light
grounds — RCF times/places and every gold eyebrow on cream — while bright
gold stays for dark grounds and decoration. RCF's CTA hierarchy flipped:
"Plan a Sunday visit" is primary; the regional (still unconfirmed)
@rcfcampus follow is secondary until the parish confirms a handle.

## 2026-07-02 — Veils became light; the ride CTA stopped losing to its own car #decision #incident

A full walkthrough of the live journey (every ~800px, desktop + mobile) found
the residue of the June hand-off fixes: the held veils worked, but a flat cream
or navy veil occupies most of the frame for ~a viewport of scroll at every
boundary — five near-blank frames across the 11k-px home scroll. Rather than
retouch the tuned `--p` timeline, the veils themselves got content: a shared
warm bloom ground (`--jh-veil-warm`) for the cream washes and a moonlit
bloom + faint stars (`--jh-veil-night`) for the glass dive, blooms centred
high so the seam with the rising scene stays flat. Worse find: on narrow
slice-crops the red car sits directly behind the ride panel's CTA, and the
old .30-start slow copy fade let the car read *through* the "Request a ride"
button — signature ministry, occluded signature CTA. Fixed by holding all
three panel scenes at full opacity until `--p` .38 with a fast .38–.46 exit
(which also closes values' old .42–.45 dead band) and bumping the ride panel
to 92% cream. An affordance pass (pickup chips → live prefilled-mailto links,
audience chips → muted tags) shipped in the same batch but the owner had it
reverted same-day — the chips stay static pills until the real Phase 3 ride
form. Lesson: when a scroll journey needs a "held" frame, the hold must carry
content of its own; blank paper held for 900px of scroll reads as a bug.

## 2026-06-30 — Closed the dead gap before the glass dive #feedback

Owner, right after the carousel fix: "when I scroll, I literally scroll down to
the end of that section instead of just starting to zoom in." The pin was fine
(verified the sticky stage holds top:0 the whole way) — the problem was a dead
band in the timeline: the last beat cleared at `--p` .46 but the glass zoom
(`--n`) didn't start until .56, so for ~.10 of `--p` (~250px on mobile) the
sanctuary just sat there static while you scrolled, before the dive engaged.
Pulled the zoom start to .47 (the instant the last card clears), so scrolling
flows carousel → dive with no stall; moved the night veil to .80–1 to match the
earlier, gentler zoom (.47–.88). Lesson: when a scroll feels like "nothing's
happening," look for a band where one animation has ended and the next hasn't
begun — the fix is overlap, not more height.

## 2026-06-30 — Sunday-mornings carousel: longer cross-dissolve #feedback #decision

Owner on the values-scene carousel: "feels choppy to scroll through and the
transition between cards is short, they kinda fade to the next one instantly."
Root cause was in the math, not the feel — each beat held *completely still* for
76% of its window and only faded over the outer 12% each side, and consecutive
windows (spaced .115, .135 wide) overlapped by just .02 of `--p` ≈ ~3svh, so the
real crossfade was a near-instant snap between long dead holds. Fix: respaced
beats to `bs = .05 + i*.09` with a `.14` window, giving a `.05` overlap where one
card's linear fade-out exactly mirrors the next card's fade-in (the two opacities
always sum to 1 — verified live: .74/.26 → .50/.50 → .21/.79). Replaced the
hold-still drift with a continuous ±1.6rem glide so scrolling always shows
motion, and the outgoing card now sits visibly higher than the incoming one so
the dissolve reads as a pass-through, not two stacked cards. Bumped the section
500svh (pin 400 → `f = 1 − 100/400 = .75`, a clean `--p` divisor that preserves
the −100svh story-overlap invariant) for more scroll room per beat. Lesson: a
"snappy" scroll carousel is usually a *spacing* bug — long dead holds with a
sub-window crossfade — not a duration knob.

## 2026-06-12 — RCF hero redesigned: "candlelight vespers" #feedback #pivot

Owner on the illustrated campus-dusk hero: "I really don't like the RCF hero.
It looks amateur." Their screenshot showed why — on a wide viewport the logo
collided with the CTA buttons (the mark was painted inside the slice-cropped
background SVG while copy flowed on top), and the scene itself was clip-art
(blob-ellipse trees, rect buildings smaller than the logo). The fix was
restraint, not more illustration: background went to pure atmosphere (dusk
gradient, sparse stars, warm horizon breath, near-tonal treeline + tiny spire,
grain), and the mark became a flow element below the copy — grid rows, so the
collision is impossible by construction. The scroll dive now aims at the mark's
measured center (`--rcf-ox/--rcf-oy` from its bounding box) instead of a guessed
percentage. Lesson: never paint a focal element into a `slice`-cropped
background a copy column floats over — crop math *will* collide them at some
viewport; and when a scene reads amateur, remove elements rather than refine them.

## 2026-06-12 — Used the actual RCF logo vector (flame + dove + ring + cap) #incident

The RCF mark took three tries, and the lesson is the headline: **get the real
asset before inventing a mark.** First I drew a *green* flame (off a sage-green
meeting flyer) — the owner asked "why's the fire green?" since a flame reads as
fire. Then they shared the launch poster and I redrew it as a warm flame on an
*open book*. Then they handed me the official **SVG**, and rendered it's neither:
it's a **flame with a dove inside it, set in a broken ring, over a graduation
cap** — Redeemed *Campus* Fellowship, so a mortarboard, not a book; plus a dove
and a ring I'd missed entirely. Embedded the real vector's icon paths into the
hero scene as the camera target, recolored to glow (warm-gradient flame, white
dove, gold ring + cap); zooming in now reveals the dove at the flame's heart.
Committed the source vector to `public/` as the logo's source of truth. Kept the
green campus-night scene; whether to also warm the green page accents (eyebrows +
times) to match the real warm logo is still an open call with the owner.

## 2026-06-12 — RCF page got its own scroll signature #decision

User: the RCF page was "pretty standard ... nothing's making it stand out like
the homepage." Offered three ambition levels (full pinned journey / flame-led
experience / standout hero only); they picked the **flame-led scroll experience**.
Built it: a hand-built illustrated campus-dusk hero — College Row with lit
windows, string lights, a stool circle, and a glowing RCF flame at its heart —
that pins and draws the camera toward the flame as a warm cream wash washes you
in. RCF's own "draw near to the flame", the campus answer to the home door-portal,
reusing that proven pattern (reactive (min-height:500px) gate, no reduce-motion
gate, stage-measured `--enter`, −100svh overlap so the content rises through the
finished wash). The Fri/Sat/Sun rhythm became three alternating illustrated
picture-book beats: Friday (night window + string lights + ice cream), Saturday
(desk lamp over an open Bible + mug), Sunday (the parish red door + sun rays +
the ride car — tying RCF back to the home journey). The dark, immersive hero is a
deliberate contrast to the parish's light pages — RCF stands on its own now. All
illustration, no faces/PII.

## 2026-06-12 — Gave RCF its own visual kit #decision

Studied the two Wesleyan RCF meeting flyers (in the `WhatsApp Chat - Wesleyan RCF`
export) to design a real kit. They were exactly as inconsistent as the brainstorm
warned: an April flyer in candy turquoise + hot pink with ice-cream art (reads as
a kids' party) and a May flyer in sage green over a stock campus photo (elegant
serif, cross + open-book icons). Nothing shared, nothing tied to the parish. The
through-line I built on: **green** — the sage flyer matured into the actual
RCCG-seal green, which gives RCF its own lane (vs. the parish's red-door identity)
while staying in the family. So RCF = green-forward sub-brand: green eyebrows +
gathering times, a flame mark recolored to green-body/gold-core, a new deep-green
`--color-rcf-night` close, gold kept for warmth, red CTAs + Fraunces/Mulish kept
for family. Two facts fell out of the flyers and fixed the page: Friday adds
prayer + ice cream, and Saturday finally has its time (5–7 PM, PAC 333). Kit lives
in `branding/rcf/` (BRAND.md + flame SVG). PII rule held — studied the flyers for
design only, no names/faces near the repo.

## 2026-06-12 — Built the Wesleyan RCF page #milestone

The parish's student ministry (Redeemed Campus Fellowship at Wesleyan — the
youth-ministry analogue to Celestial Sanctum's CZM) finally has its own page at
`/rcf`, the structure the brainstorm called for: flame-marked intro, weekly
gatherings as cards (Fri fellowship 4–5 PM Rehearsal Hall 109 · Sat study PAC
333 · Sun service 9 AM), campus ride tie-in, dark close. Built in the `/visit`
content language, wired into nav + footer, prerendered. Open items to confirm
with the parish before this is "done": (1) **@rcfcampus is the *regional* RCF
Instagram**, the only public trace — confirm or swap for a Wesleyan-specific
handle; (2) **Saturday study has no time on the flyers** — left as just
"Saturdays"; (3) the flame is a generic motif, not RCF's actual logo — they have
a flame logo on the launch flyer, and the brainstorm flagged "give RCF a kit" as
an opportunity; (4) any student-leader photos need consent (PII rule holds —
none used yet).

## 2026-06-12 — Sunday-mornings carousel: richer cards, slower beats #feedback

User: "The cards are bland and they move way too fast as I scroll." Two fixes.
Bland → each beat is now an editorial index: a big gold Fraunces numeral, a
mono-caps label kicker, the word, the line, plus carousel progress dots (in a
small frosted pill so they stay legible over the busy sanctuary art; the active
tick fills gold and widens). Too-fast → partly self-inflicted: the dead-scroll-gap
fix the day before had compressed this scene's action into the front of its pin
via `--p`, which sped the carousel up as a side effect. Fixed by holding each beat
at full opacity for ~76% of its window (was ~41%) and drifting the card only
during the fades so it sits still while you read it, plus a height bump (400→440svh,
re-deriving f so the story overlap still lands on the pin-end). Lesson: a global
timing remap (the `--p` compression) silently re-paces every per-scene animation
keyed off it — worth re-checking the content beats, not just the hand-off, after
that kind of change.

## 2026-06-12 — Journey now plays regardless of Reduce Motion #incident #decision

User: "On mobile, the site just scrolls like any other regular webpage. I'm not
getting the zoom-in transitions." Reproduced against the live site under
Android-Chrome emulation (same Blink engine they're on): the journey activated
fine, `svh` resolved, no console errors, no `overflow` ancestor breaking sticky
— so the code was sound and the phone was hitting the static fallback for an
environmental reason. The one gate that bails on a real device but not in my
clean emulation: `prefers-reduced-motion`. Android's "Remove animations" (and iOS
Reduce Motion) makes the browser report reduced-motion, and the gate treated that
as a hard opt-out → plain page. Asked the user how to handle it; they chose "play
the journey anyway" (over keep-respecting-it or an opt-in toggle). Dropped the
reduced-motion early-return from both journey controllers — the journey is
scroll-DRIVEN so it only moves when the user scrolls, and decorative autoplay
(word-rise, cue bob, door load-swing, reveals) still respects the setting via the
js-motion system. The redeploy also busts any stale pre-mobile-port bundle. Lesson:
Chrome device-emulation can't reproduce an OS-level reduced-motion setting, so a
"works in emulation, broken on device" report should suspect reduced-motion early.

## 2026-06-11 — Closed the dead-scroll gap at every section hand-off #decision #incident

Scrolling the live zoom-journey, the user: "I scrolled into the door but landed
a bit above the next section forcing me to scroll down more to actually see it.
The transition should just move the user directly onto the next section." It's
not a bug — it's structural: a `position:sticky` stage in a tall wrapper always
leaves exactly one stage-height of trailing scroll after its animation ends (the
unpinned stage sliding away as dead cream). Measured it at exactly 1.00vh on all
five boundaries. Fix: compress each scene's action into the FRONT of its pin via
a local `--p` var so the veil completes early and holds, bump each scene ~100svh
taller to keep the action's readable scroll length, and pull the next section up
one stage-height so it rises through the held veil into centre exactly as the
scene finishes. Burned real time on a counter-intuitive trap — bumping height AND
overlapping by the same amount cancels out; the fix needs compression (the next
scene must centre *earlier*), the bump only buys back scroll length. Net: every
gap now 0.00vh and the page is actually shorter than before.

## 2026-06-11 — "ALWAYS USE AUTO-DEPLOY" #feedback #decision

After the safety classifier blocked a `--yes` production deploy and forced me to
ask, the user: "Deploy and ALWAYS USE AUTO-DEPLOY." Standing instruction now —
commit → push → `vercel deploy --prod --yes` is the close-out of every phase, no
asking. I couldn't widen my own permission rules (the classifier blocks
self-modification of `~/.claude/settings.json`, which is reasonable), so the user
has to paste `Bash(vercel deploy *)` into their allow-list themselves to kill the
prompt for good. Also surfaced that their settings carry a hard
`deny: Bash(rm *)` — which is why a stray inert scratch file
(`comeandsee/__scratch_aot_check.ts`, neutralised to `export {}`) can't be
deleted from here and has to go by hand.

## 2026-06-11 — Motion pipeline ported to mobile (faithful pinned port) #decision

Offered two ways to take the desktop pin-and-zoom journey to phones — a
free-scroll cinematic fallback vs. a faithful pinned port — and the user chose
the faithful port: keep the pin-and-zoom on phones in portrait, recomposed with
svh units. Three fixes made it work: gate on `(min-height:500px)` instead of
desktop width; drive scroll progress off the pinned stage's measured
`offsetHeight` (`window.innerHeight` lies under the mobile URL bar); re-centre the
story arch-exit on phones (the right-side arch is off-screen in portrait). Made
the gate reactive too — rotating between portrait and short-landscape flips
pinned↔static live, since phones have no refresh reflex.

## 2026-06-11 — v1 rejected as "mid" → the "Come and see" zoom-journey #pivot #quote

The user killed the first redesign-era Home outright: "Stop, we need to redesign
the site. What you made is mid." Root cause: a tasteful brochure with no
organising concept. Studied award-winning storytelling sites via Playwright
recordings + the claude-video-vision MCP, then rebuilt around one idea — "Come
and see" (John 1:46), the site as a single invitation-journey. It went further
over several iterations: the user asked to "keep that zoom-in transition
throughout the site," so every section transition became a camera zoom INTO an
element of the previous scene (door → car window → hymnal → stained glass → out
through the arch). Hand-built picture-book SVG scenes; a shared `jhScene`
directive pins each scene and computes transform-origin/pan at runtime from
viewBox coords. "Feels like it's for kids" → scenes redrawn with far more
architectural detail.

## 2026-06-10 — Site repo scaffolded at site/ subfolder #decision

The Angular 22 SSR scaffold lives at `jesus-house/site/`, not at the project
root, and that's deliberate: the parent folder holds the WhatsApp exports the
whole project was mined from — 15 months of chat full of member names,
birthdays, and personal phone numbers — and none of it may ever enter the git
tree. Keeping the repo one level down makes the boundary structural instead of
relying on `.gitignore` discipline. Second scoping call made at the same time:
Sanity is deferred to Phase 2, so this phase ships zero CMS code or
dependencies — the scaffold stays static, builds green, and deploys to Vercel
with nothing that can silently fail. The dead Province 5 website (a rotted Wix
domain) is the cautionary tale: this site must survive years of light
attention.

## 2026-06-10 — Branding pivot: "just use the RCCG logo" #pivot #decision #quote

Five custom logo concepts were designed in parallel — red-door, JH monogram
wordmark, house-cross, steeple-light, door-dove — each authored as SVG and
self-checked at 512px and 32px, then judged across craft, brand fit, and
distinctiveness (red-door recommended, wordmark runner-up; review in
`branding/REVIEW.md`). The user looked at the set and chose none of them: the
site should just use the official RCCG dove seal. It's the strongest trust
signal for diaspora visitors searching for the nearest RCCG parish, and it
needs no parish approval cycle. The kit was rebuilt from the 2300px rccg.org
original with the exact seal colors sampled (`#28166F` / `#DA251D` /
`#00923F`); the Fraunces/Mulish pairing and the light/warm direction from the
exploration carry forward. The concepts stay in `branding/concepts/` as
exploration records.

## 2026-06-10 — "Need a ride?" chosen as the signature feature #decision #quote

The single most repeated message in 15 months of the parish WhatsApp chat is a
pastor's Sunday-morning ride coordination — "Good morning, when you are ready
let me know" — sent week after week as Wesleyan students get picked up from
campus for service. Ride coordination *is* the parish's signature ministry, so
the site digitizes it rather than inventing a feature: "Need a ride?" goes in
the hero. v1 is a simple CTA (mailto with a prefilled ride-request subject +
tel link to the parish line); the full form with campus pickup presets and
pastor notifications is Phase 3. No other church site in this network has
this, it costs one form and one notification hook, and it's authentically
them rather than a template feature.

## 2026-06-10 — Project kickoff from WhatsApp exports #milestone

Project sourced from exports of the parish WhatsApp chats (Mar 2025 – May
2026, 720 messages, 38 photos) plus web recon — brainstorm written up in
`../BRAINSTORM.md`. The headline discovery: the parish has zero owned web
presence. No website, no Facebook, no Instagram, no YouTube; the Google
Business profile has no website field; the Psalmlog church-finder listing sits
unclaimed. Events get promoted through members' personal accounts. This site
will be the parish's first owned web property, which shapes everything:
anchor SEO on "RCCG Jesus House Middletown CT" (plain "Jesus House" collides
with dozens of RCCG parishes), put the URL on the Google listing at launch,
and design for near-zero maintenance.
