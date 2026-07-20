# Brand Sheet — RCCG Jesus House, Middletown

> **Decision (2026-06-10):** the parish uses the **official RCCG dove seal** as its mark.
> The five custom concepts in `concepts/` are retired exploration records (see `REVIEW.md`).
> Source artwork: rccg.org official media library, 2300×2300 RGBA PNG, fetched 2026-06-10
> (`rccg-seal/rccg-org-full.png`).

## The mark

The official seal: white descending dove on a deep blue disc, double red rings, green
"THE REDEEMED CHRISTIAN ✱ CHURCH OF GOD ✱" ring text. RCCG's documented symbolism:
blue = God's love, red = the blood of Jesus, white = holiness, green = fruitfulness.

**Usage rules**
- Never recolor, distort, crop, outline, or add effects to the seal.
- Clear space: at least ¼ of the seal's diameter on all sides.
- Minimum size 24 px; at favicon sizes the ring text is illegible (expected — the blue
  disc + dove still identifies). Don't fight this with a modified seal.
- Light backgrounds only (cream/white). On dark grounds, set the seal on a white disc
  chip — see `banner-dark.svg`.
- The seal names the denomination, not the parish: on first use, always pair it with
  "RCCG Jesus House, Middletown" (the lockup does this).
- The seal belongs to the denomination; the parish is entitled to it as an RCCG parish,
  but any uncertainty about usage goes to the zonal/provincial office.

## Color tokens

**Seal colors (sacrosanct inside the seal, sampled from the official PNG):**

| Token | Hex | Source |
|---|---|---|
| Seal Blue | `#28166F` | dove disc |
| Seal Red | `#DA251D` | rings |
| Seal Green | `#00923F` | ring text |
| White | `#FFFFFF` | dove, ground |

**Site UI palette (derived, light/warm per the workspace direction):**

| Token | Hex | Role |
|---|---|---|
| `--brand` | `#28166F` | Headings, nav, footer, links |
| `--accent` | `#DA251D` | CTAs (Give, Plan a Visit, ride request), eyebrows — sparingly |
| `--affirm` | `#00923F` | Locale lines, success states, small affirmations — sparingly |
| `--ground` | `#FAF7EF` | Page background (cream; warmer than white) |
| `--surface` | `#FFFFFF` | Cards, raised surfaces |
| `--ink` | `#221E3A` | Body text (near-black with the seal's blue undertone) |
| `--ink-soft` | `#6B6480` | Captions, taglines, secondary text |

Dark-banner-only tints (not site tokens): bg `#141031`, light red `#FF8A80`,
light green `#8FD6AC`, lavender `#A39CC0`.

## Typography

- **Headings:** [Fraunces](https://fonts.google.com/specimen/Fraunces) 500–700 — warm
  old-style serif; institutional without being corporate. (Print/SVG stack:
  Iowan Old Style → Palatino → Georgia.)
- **Body & UI:** [Mulish](https://fonts.google.com/specimen/Mulish) 400/600 — humanist
  sans. Letterspaced uppercase Mulish for eyebrows and locale lines
  (e.g. `RCCG`, `MIDDLETOWN, CONNECTICUT`), mirroring the lockup.

## Assets (`branding/rccg-seal/`)

| File | Purpose |
|---|---|
| `rccg-org-full.png` | Official seal, 2300×2300 — master copy, don't edit |
| `seal-512.png`, `seal-256.png` | Working sizes |
| `favicon.svg` | Site favicon (SVG wrapper, seal embedded as data URI) |
| `favicon-64.png`, `favicon-32.png` | PNG favicon fallbacks |
| `apple-touch-icon.png` (+ `.svg` source) | 180×180, full-bleed cream tile (iOS needs no transparency) |
| `lockup.svg` / `lockup-800.png` | Horizontal lockup: seal + RCCG / Jesus House / locale |
| `banner-light.svg` / `.png` | README banner 1200×420, cream |
| `banner-dark.svg` / `.png` | README banner 1200×420, dark w/ white seal chip |
| `social-card.svg` / `.png` | og:image / social preview, 1200×630 |
| `rccg-org-300.png` | First fetch (superseded by full-res) |
| `worldvectorlogo.svg` | ⚠️ junk — an AccessDenied error stub from a failed vector hunt; safe to delete |

## HTML head snippet

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:image" content="https://<host>/social-card.png">
```

## Sub-identity: Wesleyan RCF (youth ministry)

RCF (Redeemed Campus Fellowship) is the parish's youth ministry and keeps the **national
RCF flame mark** (orange flame in circle + lowercase `rcf` wordmark — see the launch flyer
in the WhatsApp export). On the site, RCF pages use the same UI palette and type; the
flame replaces the seal as the page mark. Don't blend the flame and the seal into one
lockup — affiliation line ("the campus ministry of RCCG Jesus House, Middletown") does
the connecting. RCF's own flyers currently have no consistent style; if the students want
a kit later, derive it from the flame's warm orange + this sheet's type system.

## Mission & Vision block (for About page)

Display the RCCG Mission & Vision verbatim (HQ directive — the motto must be visible),
six points, from rccg.org/mission-and-vision, under the seal. Motto reference:
Hebrews 13:8 — "Jesus Christ the same yesterday, and to day, and for ever."
