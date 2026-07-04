# device-perf — on-device scroll performance trace

Captures a Chrome DevTools performance trace of a real Android phone scrolling
the site over USB, and reports main-thread cost by category (scripting / style
recalc / layout / paint / composite), style-invalidation fan-out, and frame
health. This is the harness that diagnosed — and verified the fix for — the
`--zoom` custom-property recalc storm (see JOURNAL.md, 2026-07-03).

## Requirements

- Android phone with USB debugging enabled, connected over USB
- Chrome open on the phone with the page under test loaded
- `adb`, Node ≥ 21 (built-in WebSocket), Python 3

## Usage

Forward Chrome's DevTools socket:

```bash
adb forward tcp:9222 localabstract:chrome_devtools_remote
```

To test a local build instead of prod, serve it and reverse-tunnel so the
phone can reach it:

```bash
npx ng build
(cd dist/jesus-house/browser && python3 -m http.server 4000) &
adb reverse tcp:4000 tcp:4000
```

then open `http://localhost:4000/` in the phone's Chrome tab.

Trace a full-page synthesized scroll (~1000 CSS px/s, no fling) and analyze:

```bash
node trace.mjs "localhost:4000" trace.json
python3 analyze.py trace.json
```

The first argument is a substring of the target tab's URL
(default `jesus-house.vercel.app`). The trace file loads directly into the
Chrome DevTools Performance panel for a flame-chart view.

For quick A/B experiments prefer the tracing-free frame meter — DevTools
tracing itself costs ~30% overhead and heats the phone into throttling:

```bash
node fpsmeter.mjs "localhost:4000" up
node fpsmeter.mjs "localhost:4000" up ".some-suspect { display: none !important; }"
```

It reports avg fps and frame-time percentiles from an in-page rAF meter
during the same synthesized scroll; the optional third argument injects a
temporary CSS kill-switch for bisection. Watch skin temperature between
runs (`adb shell dumpsys thermalservice`) — back-to-back GPU-heavy runs on
a fanless phone produce phantom regressions.

Note: Chrome's HTTP target list (`/json/list`) is often empty on Android;
these scripts attach through the browser-level WebSocket instead, which is
why they don't use `chrome-remote-interface`.

## Pass targets (Galaxy A15-class device, full-page scroll)

- style recalc total: **< 600 ms** per ~9 s scroll (was 1,030 ms before the
  2026-07-03 fix; 557 ms after)
- elements per recalc p90: **< 20** (was 178; now 6)
- janky frames (>1.6× vsync): **< 10%** (was 18.3%; now 8.6%)
- `Layout` events during scroll: **≤ a handful** — scroll motion must be
  transform/opacity only

If style recalc or elements-per-recalc regress, the likely cause is a new
per-frame custom-property write that either isn't registered `inherits: false`
in `src/styles.css` or isn't written directly onto its consuming elements
(the `[data-scene-var]` convention — see scene.directive.ts).
