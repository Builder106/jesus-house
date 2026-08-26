<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner-light.svg">
  <img alt="RCCG Jesus House — Middletown, Connecticut" src="assets/banner-light.png">
</picture>

[![CI](https://github.com/Builder106/jesus-house/actions/workflows/ci.yml/badge.svg)](https://github.com/Builder106/jesus-house/actions/workflows/ci.yml)
[![Angular](https://img.shields.io/badge/Angular-22-DD0031.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)
[![Demo](https://img.shields.io/badge/demo-live-success.svg)](https://jesus-house.vercel.app)

> **Official web portal for RCCG Jesus House in Middletown, CT.** Information on Sunday services, student ride pickups from Wesleyan University, and church ministries.

## 💡 What is Jesus House Middletown?

RCCG Jesus House is a welcoming Christian parish located at 120 Washington Street in Middletown, Connecticut.

This modern website serves as the church's digital front door for both local families and college students. It provides service times (Sunday service at 9:00 AM), directions, ministry details, and a dedicated Sunday ride pickup service connecting Wesleyan University students directly to church services.

**Live site:** [jesus-house.vercel.app](https://jesus-house.vercel.app)

## How it works

```mermaid
sequenceDiagram
    autonumber
    participant Visitor
    participant Vercel as Web Hosting
    participant SSR as Fast Server Rendering
    participant Analytics as Visitor Analytics

    Visitor->>Vercel: Open website
    Vercel->>SSR: Request page
    SSR-->>Visitor: Deliver pre-rendered page and styling
    Visitor->>Vercel: Load interactive features
    Visitor->>Analytics: Anonymous performance metrics
```

The current phase is deliberately CMS-free: every page is static Angular, prerendered at build time where possible and SSR'd otherwise. Sanity (a fresh project, separate from the sibling parish's) joins in Phase 2 for announcements, events, and ministry pages.

## Demos

<details>
<summary><strong>Demo recordings pending</strong></summary>

> Demo recordings come from the Gherkin E2E demo suite (Playwright + playwright-bdd narrative video walkthroughs — `npm run test:demo`). They'll appear here as GIFs grouped by user journey once the first recordings are produced.

</details>

## Stack

| Layer      | Choice                                                                |
| ---------- | --------------------------------------------------------------------- |
| Framework  | Angular 22 with `@angular/ssr`(standalone, component prefix`jh`)      |
| Styling    | Tailwind v4 via `@tailwindcss/postcss`                                |
| Typography | Fraunces (headings) + Mulish (body/UI), self-hosted via `@fontsource` |
| Unit tests | Vitest via `ng test`                                                  |
| E2E        | Playwright + playwright-bdd (QA suite + demo-recording suite)         |
| Hosting    | Vercel — git integration deploys; GitHub Actions gates quality        |
| Telemetry  | `@vercel/analytics`+`@vercel/speed-insights`                          |

## Local development

```bash
git clone https://github.com/Builder106/jesus-house.git
cd jesus-house
npm ci
npm start                  # ng serve on :4200 with SSR + HMR
npm run build              # production build + prerender
```

> **`npm test` caveat:** unit tests are verified in CI, not locally — the local checkout path contains parentheses (`My Drive (yvaughan@…)`), which breaks Vitest's glob discovery and reports "No test files found." The tests are fine; trust the CI `unit` job.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for project structure, guardrails, commit-message style, and out-of-scope items.

## Roadmap

- ✅ **Phase 1** — Scaffold + brand shell: Angular 22 SSR, Tailwind v4 tokens, RCCG seal brand kit, Fraunces/Mulish, home page with the "Need a ride?" CTA (mailto/tel)
- ⏳ **Phase 2** — Sanity CMS (new project) + content pages: Plan a Visit ✅ and Wesleyan RCF ✅ shipped as static pages ahead of the CMS; About and Ministries still to come
- ⏳ **Phase 3** — Ride-request form + notifications (serverless handler → email; campus pickup presets)
- ⏳ **Phase 4** — Events, Watch (RCCG streams), Give
- ⏳ **Phase 5** — Launch: website URL on the Google Business listing, claim directory listings, parish domain

## License

[MIT](./LICENSE).
