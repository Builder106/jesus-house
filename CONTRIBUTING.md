# Contributing

Thanks for your interest in `jesus-house`. This document covers how to set up
a development environment, the conventions the codebase follows, and what's
in scope (and what isn't).

## Dev setup

**Prerequisites:**

- Node.js `>=24` (Angular 22 CLI requires it)
- npm `>=11`
- A modern browser for testing (Chrome / Safari / Firefox)
- (Optional) The Vercel CLI for deploys: `npm i -g vercel`

**Bootstrap:**

```bash
git clone https://github.com/Builder106/jesus-house.git
cd jesus-house
npm ci
npm start
```

The Angular dev server starts on `http://localhost:4200` with SSR enabled.
Hot module replacement is on.

## Common commands

| Command | What it does |
|---|---|
| `npm start` | `ng serve` — dev server with HMR on port 4200 |
| `npm run build` | Production build + SSR + prerender (output in `dist/`) |
| `npm test` | Vitest unit-test suite — **runs in CI only**; locally the checkout path's parentheses break Vitest glob discovery |
| `npm run test:e2e` | Headless Playwright + Gherkin BDD QA suite (home + visit critical paths) |
| `npm run test:demo` | Narrative video walkthroughs for the README. Outputs to `e2e/demo/recordings/` |
| `npm run watch` | Dev build that watches for changes |
| `npm run serve:ssr:jesus-house` | Serve the built SSR bundle from `dist/` |

## Project structure

```
src/
├── app/                   # Standalone components, prefix "jh" — routes, app
│                          # shell, brand-shell components grow from here
├── main.ts / main.server.ts / server.ts   # Browser + SSR entry points
└── styles.css             # Tailwind v4 entry + @theme brand tokens

public/                    # Static assets served at the root (favicon, etc.)
assets/                    # README banner art (RCCG seal brand kit copies)
e2e/                       # Playwright + playwright-bdd (mirrors the sibling
│                          # celestial-sanctum repo's layout)
├── features/              # QA Gherkin feature files (assertions, parallel)
├── demo/features/         # Narrative video walkthroughs (single-worker,
│                          # slowMo, video recording; 00-warmup absorbs the
│                          # 0-byte first-video quirk)
├── steps/                 # Shared step library (both suites use the same)
├── support/               # dwellForDemo helper + demo page setup (cursor
│                          # injection, zoom, slow typing)
└── reporters/             # Custom reporter: webm → mp4 + discard warmups
```

The full brand kit (seal SVGs, lockups, social card, exact hexes) lives
outside this repo in the parent folder's `branding/` directory — only the
README banners are copied into `assets/`.

## Project-specific guardrails

- **No member PII ever: no congregant names, photos, birthdays, or personal
  phone numbers in code, content, tests, or fixtures.** The only contact info
  that may appear is the parish's own: 120 Washington Street, Middletown,
  CT 06457 · (860) 518-4640 · rccgjhmiddletown@gmail.com. This is also why
  the repo lives at `site/` inside the project folder — the parent folder
  holds source material with member PII that must never enter the git tree.
- **Light, warm, reverent aesthetic only — no dark mode.** The palette is
  seal blue `#28166F` on cream `#FAF7EF` / white `#FFFFFF`, ink `#221E3A`,
  ink-soft `#6B6480`, with seal red `#DA251D` and seal green `#00923F` used
  sparingly as accents.
- **The RCCG seal is never recolored, distorted, or restyled.** It's the
  official denominational mark; use the kit files as-is.
- **Component prefix is `jh-`.** Don't add unprefixed selectors.
- **SSR-safe code only: no window/document access outside afterNextRender or
  browser guards.** The build prerenders, and anything touching browser-only
  globals during render fails it.
- **Sanity is the CMS from phase 2 — do not hand-roll content storage.**
  This phase ships static content only; no CMS code or dependencies belong
  in the tree until Phase 2 opens.
- **Copy voice is warm and familial** — "Jesus House Family", never
  marketing-speak. Eyebrows and locale lines are letterspaced uppercase
  Mulish; headings are Fraunces.

## E2E tests + demo recordings

Two Gherkin suites share a step library, mirroring the sibling
`celestial-sanctum` repo:

- **QA suite** (`npm run test:e2e`) — fast, parallel, headless. Verifies
  critical paths with accessible selectors (`getByRole`, `getByLabel`,
  `getByText`). Videos retained only on failure. Run before pushing.

- **Demo suite** (`npm run test:demo`) — narrative video walkthroughs for
  the README. Single-worker (parallel races the video subsystem), slowMo
  for readability, custom cursor + zoom injected via `addInitScript`,
  warmup scenarios to absorb the 0-byte first-video quirk. Outputs mp4s
  (gitignored); convert to GIFs for the README with
  `ffmpeg -i in.mp4 -vf "fps=10,scale=960:-1" out.gif`.

Tuning env vars: `DEMO` (master switch), `DEMO_SLOWMO` (default 1200ms),
`DEMO_TYPE_DELAY` (70ms), `DEMO_TAIL_MS` (1500ms), `DEMO_DWELL_MS` (1500ms),
`DEMO_ZOOM` (1.3).

Demo scenarios must use parish-owned contact details or obviously fake
fixtures — never a real member's name, number, or pickup spot.

## Commit-message convention

Single-line summary in the imperative (~60 chars), optionally followed by a
blank line + a body explaining *why*. No conventional-commit `type:` prefixes
— the body carries the meaning. No co-author trailers.

Good:
```
Anchor the ride CTA above the fold on mobile

Wesleyan students are the primary audience and most arrive on
phones; the mailto/tel buttons were below the Sunday-time card
and invisible without scrolling.
```

Bad:
```
feat: cta
```

## Pull request process

1. Branch from `main`. Name the branch after the feature or fix:
   `ride-cta-mobile`, `visit-page-copy`, etc.
2. Keep PRs focused. A new page is one PR; a token refactor is another;
   don't bundle them.
3. Run `npm run build` locally before pushing — the prerender step catches
   SSR issues that `npm start` doesn't.
4. CI (`.github/workflows/ci.yml`) gates quality on every push and PR.
   Preview URLs come from Vercel's git integration and appear in the PR
   thread once the Vercel build completes (separate from GitHub Actions).
5. Merge to `main` deploys to production via Vercel's git integration.

## Out of scope

Don't open PRs for these — they'll be closed:

- **Dark mode.** The light/warm/reverent direction is settled for the whole
  Churches workspace; no dark variants.
- **Member directory or congregation roster of any kind.** Hard privacy
  rule — see the guardrails. A curated leadership page may come later
  (pending the parish's own confirmation), never a member listing.
- **CMS swaps or extra CMS adapters.** Sanity is the chosen CMS for
  Phase 2. PRs adding Contentful/Strapi/Prismic adapters, or hand-rolled
  content storage in the meantime, won't be considered.
- **PRs from automated tooling without human-readable descriptions**
  explaining the change.

## License

MIT. See [LICENSE](LICENSE).
