import { connect } from "./cdp.mjs";
import { writeFileSync, appendFileSync } from "node:fs";

const TARGET = process.argv[2] ?? "jesus-house.vercel.app";
const OUT = process.argv[3] ?? "trace.json";
const c = await connect();
const { sessionId } = await c.attachPage(TARGET);

// Reset to top and let things settle.
await c.send("Runtime.evaluate", { expression: "window.scrollTo({top:0,behavior:'instant'})" }, sessionId);
await new Promise((r) => setTimeout(r, 1500));

const categories = [
  "-*",
  "devtools.timeline",
  "disabled-by-default-devtools.timeline",
  "disabled-by-default-devtools.timeline.frame",
  "disabled-by-default-devtools.timeline.invalidationTracking",
  "toplevel",
  "blink.user_timing",
  "latencyInfo",
  "v8.execute",
].join(",");

let tracingDone;
const complete = new Promise((res) => (tracingDone = res));
c.on((m) => { if (m.method === "Tracing.tracingComplete") tracingDone(m.params); });

await c.send("Tracing.start", { categories, transferMode: "ReturnAsStream", options: "record-continuously" });
console.error("tracing started");
await new Promise((r) => setTimeout(r, 500));

// One continuous scroll through the full page, ~1000 CSS px/s, no fling.
const t0 = Date.now();
await c.send("Input.synthesizeScrollGesture", {
  x: 192, y: 400,
  xDistance: 0, yDistance: -8846,
  speed: 1000,
  preventFling: true,
}, sessionId);
console.error("scroll gesture done in", ((Date.now() - t0) / 1000).toFixed(1), "s");
await new Promise((r) => setTimeout(r, 500));

await c.send("Tracing.end");
const { stream } = await complete;
console.error("reading stream", stream);
writeFileSync(OUT, "");
let eof = false, bytes = 0;
while (!eof) {
  const chunk = await c.send("IO.read", { handle: stream, size: 1 << 20 });
  const data = chunk.base64Encoded ? Buffer.from(chunk.data, "base64") : Buffer.from(chunk.data);
  appendFileSync(OUT, data);
  bytes += data.length;
  eof = chunk.eof;
}
await c.send("IO.close", { handle: stream });
console.error("trace written:", bytes, "bytes");
c.close();
process.exit(0);
