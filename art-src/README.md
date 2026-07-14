# art-src — authoring sources for the bitmap scene art

The three home scene illustrations (ride / audience / values) and the RCF
hero dusk (`rcf-hero-art.svg`) ship as WebP bitmaps in `public/art/`, not as
inline SVG. Reason (measured on a throttled Galaxy
A15, 2026-07-04): the scenes' dive animations make Chrome re-raster the art
layer at every raster-scale step, and re-rendering ~100 vector paths per step
collapsed scroll to ~12fps on low-tier GPUs; a bitmap layer re-rasters as a
cheap texture sample and runs at the ~44fps no-art ceiling. See JOURNAL.md.

The `*-scene-art.svg` files here are the ORIGINAL inline SVG markup, verbatim
(they reference `var(--color-jh-*)` theme tokens from styles.css, so they do
not render standalone). They are the source of truth for editing the art.

## Regenerating the WebP captures after editing an SVG

1. Paste the edited SVG back into the scene's template in place of the
   `<img class="scene__art">` (temporarily), with the original attributes
   (`viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"`).
2. `npx ng build`, serve `dist/jesus-house/browser`, open desktop Chrome at a
   2880×1800 viewport.
3. Hide the overlays and pin the scene so the art fills the viewport:
   scroll to the scene top, and inject
   `.scene__copy, .scene__veil, .scene__cue, .scene__content, .scene__doorlight,
    jh-site-header, .jh-rail { visibility: hidden !important; }
    .scene__art { animation: none !important; transform: none !important; }`
4. Screenshot the viewport as WebP quality 82 → `public/art/<scene>-scene.webp`
   (2880×1800 keeps the art above phone display resolution at rest).
5. Restore the `<img>` in the template and update the svg file here.

## RCF hero — the simple case

`rcf-hero-art.svg` uses only literal colors (no theme tokens), so it renders
standalone — no build/browser round-trip. After editing, drop the grain rect
(the trailing `<!-- grain -->` block; grain is omitted from all captures) and
the bare DOM attributes (`data-scene-var` is not valid XML), then:

```bash
rsvg-convert -w 2880 -h 1800 rcf-hero-clean.svg -o /tmp/rcf-hero.png
cwebp -q 82 /tmp/rcf-hero.png -o ../public/art/rcf-hero-scene.webp
```
