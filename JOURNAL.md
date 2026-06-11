# JOURNAL — RCCG Jesus House, Middletown

> Dated log of decisions, pivots, incidents, and quotes worth remembering. Not
> a changelog (commit messages are that) and not a ticket tracker — this
> captures the human context that disappears within weeks. Reverse-chronological.
> Tag with `#decision` / `#pivot` / `#incident` / `#quote` / `#feedback` /
> `#milestone`. One paragraph max per entry.

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
