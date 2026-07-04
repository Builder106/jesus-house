// Lightweight steady-state scroll benchmark: rAF frame-time meter in the page
// + a synthesized full-page scroll. No DevTools tracing overhead.
// Usage: node fpsmeter.mjs <url-substr> <up|down> ["css-override"]
import { connect } from "./cdp.mjs";

const TARGET = process.argv[2];
const DIR = process.argv[3] ?? "up";
const CSS = process.argv[4] ?? "";

const c = await connect();
const { sessionId } = await c.attachPage(TARGET);

await c.send("Runtime.evaluate", { expression: `
  document.getElementById("exp-style")?.remove();
  if (${JSON.stringify(CSS)}) {
    const s = document.createElement("style"); s.id = "exp-style";
    s.textContent = ${JSON.stringify(CSS)};
    document.head.appendChild(s);
  }
  window.scrollTo({top: ${DIR === "up" ? "document.documentElement.scrollHeight" : "0"}, behavior: "instant"});
` }, sessionId);
await new Promise((r) => setTimeout(r, 1200));

await c.send("Runtime.evaluate", { expression: `
  window.__fps = { deltas: [], last: 0, on: true };
  (function tick(t) {
    if (!window.__fps.on) return;
    if (window.__fps.last) window.__fps.deltas.push(t - window.__fps.last);
    window.__fps.last = t;
    requestAnimationFrame(tick);
  })(performance.now());
` }, sessionId);

await c.send("Input.synthesizeScrollGesture", {
  x: 192, y: 400, xDistance: 0, yDistance: DIR === "up" ? 8846 : -8846,
  speed: 1000, preventFling: true,
}, sessionId);

const { result } = await c.send("Runtime.evaluate", { expression: `
  window.__fps.on = false;
  (() => {
    const d = window.__fps.deltas.slice(5);
    d.sort((a, b) => a - b);
    const sum = d.reduce((a, b) => a + b, 0);
    const pct = (p) => d[Math.min(d.length - 1, Math.floor(d.length * p))];
    return JSON.stringify({
      frames: d.length,
      avgFps: +(1000 * d.length / sum).toFixed(1),
      p50: +pct(0.5).toFixed(1), p95: +pct(0.95).toFixed(1), p99: +pct(0.99).toFixed(1),
      max: +d[d.length - 1].toFixed(0),
      over50ms: d.filter((x) => x > 50).length,
      over150ms: d.filter((x) => x > 150).length,
    });
  })()
`, returnByValue: true }, sessionId);
console.log(result.value);
// leave any experiment style in place only if requested; always clean here
await c.send("Runtime.evaluate", { expression: `document.getElementById("exp-style")?.remove()` }, sessionId);
c.close();
process.exit(0);
