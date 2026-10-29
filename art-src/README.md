# art-src — authoring sources for the bitmap scene art

The three home scene illustrations (ride / audience / values) and the RCF
hero dusk (`rcf-hero-art.svg`) ship as WebP bitmaps in `public/art/`, not as
inline SVG. Reason (measured on a throttled Galaxy
A15, 2026-07-04): the scenes' dive animations make Chrome re-raster the art
layer at every raster-scale step, and re-rendering ~100 vector paths per step
collapsed scroll to ~12fps on low-tier GPUs; a bitmap layer re-rasters as a
cheap texture sample and runs at the ~44fps no-art ceiling. See JOURNAL.md.

## Home scenes, route plate, and RCF week (generated)

The three home scenes, their camera close-ups, the Visit page route plate, and
the RCF week vignettes are drawn in Python under `scenes/` and rendered from
there. Edit the generator, never the output:

| Generator             | Writes                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `scenes/road.py`      | `ride-scene-art.svg`, `public/art/ride-scene.webp`, `ride-close.webp`                                      |
| `scenes/pew.py`       | `audience-scene-art.svg`, `public/art/audience-scene.webp`, `audience-close.webp`                          |
| `scenes/sanctuary.py` | `values-scene-art.svg`, `public/art/values-scene.webp`, `values-close.webp`                                |
| `scenes/route.py`     | `src/app/features/visit/route-map.html` (inline SVG)                                                       |
| `scenes/rcf_week.py`  | `src/app/features/rcf/rcf-vignette.html` (inline SVGs)                                                     |
| `scenes/idle.py`      | `public/art/idle/*.svg`, `src/app/shared/ui/scene-idle/scene-idle.html` (idle motion over the home scenes) |

```bash
python3 art-src/scenes/build.py        # all three scenes (needs rsvg-convert, cwebp)
python3 art-src/scenes/build.py pew    # one scene
python3 art-src/scenes/route.py
python3 art-src/scenes/rcf_week.py
python3 art-src/scenes/idle.py
```

The shape-changing idle sprites (the flock's beating wings, the Bible's page
turn, the morphing candle flames) are animated by Glaxnimate. Run
`art-src/scenes/glax_sprites.py` with the glaxnimate-mcp-server Python
environment; it writes CSS-animated SVGs to `public/art/idle/`.

Each scene module sets `TARGET`, the camera's zoom point in the 1440x900 frame,
and `CLOSE_ZOOM`. The close-up WebP is the frame a camera at that zoom sees,
rendered at full resolution, so the end of each dive stays sharp. When you
move a target, update the matching `data-scene-x/y` in the section's `.ts`
file. The dives chain by design: the car's rear window shows the Bible on the
back seat, that Bible lies open on the pew with a picture of the stained-glass
window on its page, and the sanctuary's great window repeats that picture.

## RCF hero

`rcf-hero-art.svg` uses only literal colors (no theme tokens), so it renders
standalone — no build/browser round-trip. After editing, drop the grain rect
(the trailing `<!-- grain -->` block; grain is omitted from all captures) and
the bare DOM attributes (`data-scene-var` is not valid XML), then:

```bash
rsvg-convert -w 2880 -h 1800 rcf-hero-clean.svg -o /tmp/rcf-hero.png
cwebp -q 82 /tmp/rcf-hero.png -o ../public/art/rcf-hero-scene.webp
```
