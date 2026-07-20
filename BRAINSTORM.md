# RCCG Jesus House, Middletown — Website Brainstorm

> Source material: WhatsApp exports of "RCCG (Jesus House) Middletown" (Mar 2025 – May 2026,
> 720 messages, 38 photos) and "Wesleyan RCF" (Apr–May 2026), plus web recon of the parish's
> existing presence and RCCG parish-site conventions. Drafted 2026-06-10.

---

## 1. What we know about the parish

### Verified publicly
| Fact | Value | Source |
|---|---|---|
| Name | RCCG Jesus House, Middletown (Google: "Redeemed Christian Church of God, Jesus House") | Google Maps, rccgna.org |
| Address | 120 Washington Street, Middletown, CT 06457 | Google, RCCGNA directory, Pastor Dele in chat |
| Phone | (860) 518-4640 | Google, RCCGNA directory |
| Hours per Google | Sun 9–11 AM, Wed 6:30–7:30 PM | Google Business Profile |
| Parish Pastor (directory) | "Pastor Victor Iweoise" | rccgnaregion6.org |
| Hierarchy | Zone CT 3 (coord.: Pst. Seun Arimoro, Christ Chapel Meriden) → Province 5 (Glory Cathedral Hartford) → RCCG Americas Region 6 → RCCGNA → RCCG worldwide | rccgnaregion6.org |
| 2026 RCCG theme | "Brand New Beginning" | HGS streams + chat (Ministers Thanksgiving, Jan 2026) |

### From the chat (confirm with pastors before publishing)
- **Leadership trio:** Pastor Dele (Oladele) preaches and leads; Pastor Victor Iweiose and
  Pastor (Mrs.) Omoh ("Pst Omo", flyer name **Omo-Oise Iweoise**) are a married couple
  (20th anniversary Aug 2025). Note the **spelling conflict**: chat says "Iweiose",
  the Region 6 directory and the Elegant Women flyer say "Iweoise". Ask which is correct.
- **Sunday service** appears to start ~10:00–10:30 AM (snow-day virtual service was moved
  to 10:00 AM) — Google's "9–11 AM" needs reconciling. Ask for the canonical schedule.
- **Student Sunday Service (SSS)** — recurring special service honoring students.
- **Virtual fallback:** snow days move service to Zoom.
- **Pastor Dele ministers on WIHS radio** (local CT Christian station) — multiple weekly slots.
- **Welcome culture:** newcomers announced by name; "Jesus House Family" is the house phrase.

### Ministries & programs (chat-derived)
- **Elegant Women's Meeting** — women's ministry, evening meetings (e.g. May 1 2026,
  "Send the WORD" prayer theme, Psalm 107:20), ministered by Pastor Omo-Oise Iweoise.
  Female youth invited. Has its own flyer design language (warm gold + florals + RCCG crest).
- **Music department / worship team** — praise & worship videos shared proudly in chat.
- **Media department** — exists (thanked after SSS).
- **Monthly evangelism** — rotates between Zone CT 3 parishes; Middletown takes turns.
- **Wesleyan RCF (Redeemed Campus Fellowship)** — launched April 21 2026 at Wesleyan
  (campus evangelism 2 PM, launch 6 PM); Friday fellowship meetings (4–5 PM, Rehearsal
  Hall 109), Saturday study sessions (PAC 333). Run by student leaders from the parish.
  Only public trace is the regional @rcfcampus Instagram ("RCF WESLEYAN" reels).

### Annual rhythm (events calendar seed)
| When | What |
|---|---|
| Feb 1 – Mar 2 | RCCG 30-day annual fasting (HQ prayer-guide PDF circulates) |
| First Sunday monthly | Thanksgiving Sunday (HQ-connected, mandated) |
| Monthly | RCCG Holy Ghost Service (YouTube streams shared in chat) |
| June | RCCG Americas 1 Convention (e.g. "God of Signs & Wonders," Jun 18–20 2025) |
| Early Sept | Cookout at McCutcheon Park ("bring something, share the Agape love") |
| Late Nov | Thanksgiving service — **dress code: African attire** |
| Dec | Christmas service; RCCG Holy Ghost Congress streams |
| May | Graduation celebrations for student members |
| Year-round | Birthdays celebrated enthusiastically (internal culture, not website content) |

---

## 2. Digital presence audit: effectively zero owned presence

The new site will be the parish's **first owned web property**.

- **Google Business Profile** — exists, 5.0★ (2 reviews), **no website field**. Strongest
  current asset; add the new URL at launch.
- **rccgna.org + rccgnaregion6.org directories** — name/address/phone only.
- **Psalmlog church finder** — auto-generated, **unclaimed** ("Claim This Church" button).
- **Facebook / Instagram / YouTube** — none found for the parish. Events get promoted
  through members' personal accounts.
- **Province 5 HQ's own site (glorycathedralct.org) is a dead Wix domain** — small-parish
  sites in this network rot; design for near-zero maintenance.

**SEO reality:** "Jesus House" collides with dozens of RCCG parishes (DC, Baltimore, Queens,
Cleveland, Lagos…). Anchor everything on **"RCCG Jesus House Middletown CT"** + address +
schema.org `Church` structured data.

---

## 3. Audiences, in order of evidence

1. **Wesleyan students** — the dominant demographic. They are picked up from campus
   (Exley, Sci-Li, Usdan) every single Sunday; RCF exists for them; SSS honors them.
2. **Local Middletown families** — the long-term growth audience; Google search +
   drive-by (the church is on Washington St) are how they'll arrive.
3. **Nigerian/African diaspora & RCCG network** — people moving to CT who search for
   the nearest RCCG parish; the directories funnel them.

---

## 4. The standout feature: "Need a ride?"

The single most repeated message in 15 months of chat is Pastor Victor's Sunday-morning
**"Good morning, when you are ready let me know"** — ride coordination *is* the parish's
signature ministry. Digitize it:

- A **ride-request form** on the Visit page (name, phone, pickup spot — with Wesleyan
  campus presets like Exley/Usdan/Sci-Li — and a "this Sunday" toggle).
- Submission notifies Pastor Victor (email or SMS via Twilio/Brevo).
- Tagline practically writes itself: *"No car? No problem. We'll come get you."*

No other church site in this network has this, it costs one form + one notification hook,
and it's authentically *them* rather than a template feature.

---

## 5. Proposed site map

Follows the conventions observed across RCCG parish sites (jesushousedc.org, rccgcor.org),
scaled to a small parish:

- **Home** — hero: welcome line + Sunday time + address; CTAs "Plan a Visit" / "Watch";
  2026 theme banner ("Brand New Beginning"); next-event strip; latest sermon/HGS embed.
- **About** — parish story, leadership (photos only with consent), RCCG affiliation block
  (seal + Heb 13:8 motto + the 6-point Mission & Vision **verbatim** — HQ directive says
  the motto must be displayed), what we believe.
- **Plan a Visit** — service times, what to expect, directions/parking, **ride request**.
- **Ministries** — Elegant Women, Music & Worship, Media, Evangelism, + one page per
  future ministry. Each ministry gets contact/next-meeting info.
- **Wesleyan RCF** — its own page (the established RCCG pattern, cf.
  rccgpittsburgh.com/redeemed-campus-fellowship/): meeting times, campus locations,
  what happens (worship, Bible games, study, snacks), link to @rcfcampus.
- **Events** — calendar seeded from the annual rhythm above.
- **Watch** — embed RCCG HGS/Congress streams now; parish livestream later if/when a
  YouTube channel exists (open question).
- **Give** — method TBD (nothing in the chat indicates current giving rails; ask).
- **Prayer** — simple prayer-request form (pairs with the parish's prayer-meeting culture).
- **Contact** — address, phone, form; footer affiliation line
  *"A parish of The Redeemed Christian Church of God"*.

---

## 6. Design direction

**Concept: Nigerian Pentecostal warmth in a New England meetinghouse.**

The mined photos reveal a genuinely distinctive setting: the parish meets in a classic
white-paneled New England building with **red doors**, wood floors, wainscoting, and a
green yard. That red door is the visual hook — and red is already the RCCG seal's
"blood of Jesus" ring. The palette assembles itself from owned elements:

- **Deep navy** (RCCG seal field) — headers, footer
- **Red** (seal ring, the building's doors) — accents, CTAs
- **Warm gold/cream** (Elegant Women flyer language, HGS flyer golds) — backgrounds, highlights
- **White** (holiness in RCCG symbolism, the building itself) — base

Light, warm, reverent — consistent with the Reverent Minimalism direction already chosen
for the Churches workspace (no dark themes). Typography: a humanist serif for headings
(echoes the flyer script culture without the Canva look), clean sans for body.

**Logo decision (2026-06-10):** the site uses the **official RCCG dove seal** as its mark
(user's call after a five-concept custom exploration — records in `branding/concepts/`,
review in `branding/REVIEW.md`). The seal is the strongest trust signal for diaspora
visitors and needs no approval cycle. Brand kit (favicon, apple-touch-icon, lockup,
banners, social card, exact seal hexes `#28166F`/`#DA251D`/`#00923F`) lives in
`branding/rccg-seal/`, documented in `branding/BRAND.md`.

Tone of copy: warm, familial, celebratory — "Jesus House Family" energy. The chat voice
is genuinely joyful; the site should sound like Mrs. Omoh's welcomes, not like a template.

---

## 7. Asset audit (from the exports)

**Usable now**
- Elegant Women flyer (×2 copies) — clean, parish-made, no faces. ⚠️ It prints ZIP
  **06051** (New Britain) for a Middletown address (06457) — typo to flag to the church.
- RCF Launch flyer — well-made, has the RCF flame logo; faces are of student leaders who
  posed for a public flyer (still confirm).
- Wesleyan RCF meeting flyers (×2) — show RCF's activity; inconsistent visual identity
  (turquoise/pink playful vs. sage-green collegiate) — an opportunity to give RCF a kit.
- RCCG HQ Holy Ghost Service flyer — denominational artwork, fine for an events page.

**Usable only with consent**
- ~26 graduation-celebration photos (May 2026). Warm, joyful, *exactly* the right vibe —
  but every frame has identifiable faces, several include **minors**, and two contain a
  background whiteboard listing member names/months (crop or blur). Get written consent
  or plan a fresh photo session (a Sunday service + exteriors of the red-door building).
- Worship videos (Apr 2026 praise & worship clips) — great hero-video candidates with the
  same consent caveat.

**Not usable** — AI-generated birthday graphics (Meta AI watermarks, private congregants),
generic Canva greetings, devotional forwards.

**Gap:** no photo of the building exterior, no logo, no pastor portraits. A 1-hour photo
shoot covers all three.

---

## 8. Privacy guardrails (non-negotiable)

Same posture as the Celestial Sanctum decision: **no congregation roster, ever.**

- No member names, birthdays, or phone numbers on the public site (the chat is full of
  them; none of it migrates).
- Leadership bios/photos only with explicit consent; use the spelling they choose.
- No photos containing minors without guardian consent — most group photos in the export
  include teens/children.
- Blur/crop the whiteboard (member names + months) in any photo that shows it.
- Ride-request and prayer forms collect the minimum, deliver to the pastors, store nothing
  publicly (and ideally nothing at all beyond delivery).

---

## 9. Tech recommendation

**Reuse the Celestial Sanctum stack:** Angular SSR + Sanity (new Sanity project, not the
shared one) + Vercel, with the Studio self-hosted as a separate Vercel project if a
branded admin URL is wanted. Rationale: every painful gotcha (PendingTasks for Sanity
fetches under SSR, CDN empty-result caching, dataset-import publish behavior) is already
solved and documented in this workspace; the pastors get the same editing experience the
user can already support; content schemas (events, ministries, sermons, announcements)
port over with light edits.

Keep the editable surface small — announcements, events, sermon links, ministry pages.
Everything else static. The dead Province 5 website is the cautionary tale: this site must
survive years of light attention.

Forms (ride/prayer/contact): serverless handler → email (Brevo is already connected) —
no database needed for v1.

When the repo is scaffolded, apply the standard workspace baseline (README banner,
CI/CD, LICENSE, CONTRIBUTING, JOURNAL.md, E2E demo suite).

---

## 10. Launch checklist (beyond the site itself)

1. Add the website URL + correct hours to the **Google Business Profile** (and ask
   members for reviews — it sits at 2 reviews).
2. **Claim the Psalmlog listing**; fill in real description, hours, photo.
3. Ask the zone/region to add the URL to the **rccgna.org / rccgnaregion6.org** entries.
4. schema.org `Church` markup + local-SEO copy ("RCCG Jesus House Middletown CT").
5. Decide on a domain — e.g. `jesushousemiddletown.org` (check availability) — and a
   parish email to replace personal numbers as the public contact.
6. Optional fast follow: create the parish YouTube channel so "Watch" can become
   first-party; consider an Instagram for the flyer culture that already exists.

---

## 11. Open questions — ANSWERED 2026-06-10

1. **Sunday service starts 9:00 AM** (Google's 9–11 AM window is right; the chat's 10:00 AM
   was the snow-day virtual exception). Wednesday 6:30–7:30 PM purpose still unconfirmed.
2. Surname spelling: **Iweiose** per the user's direct answer. ⚠️ The same reply wrote
   "Pastor Victor Iweoise – Parish Pastor" for the leadership line — re-verify with the
   pastor before the leadership page ships.
3. Leadership page: **Pastor Victor Iweiose — Parish Pastor**.
4. Giving: **Zelle** (Give page = Zelle instructions; no payment SaaS needed for v1).
5. Parish email: **rccgjhmiddletown@gmail.com**. No existing logo/brand materials.
6. Photo session: user will schedule one.
7. **Wesleyan RCF = the parish's youth ministry** (analogous to Celestial Sanctum's CZM)
   and gets its own sub-identity on the site.
8. Domain: TBD — **host on Vercel for now**, parish will poll on a domain name later.
   Registrar/Google Business credentials: probably Pastor Iweiose.
