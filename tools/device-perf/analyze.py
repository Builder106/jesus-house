import json, collections, statistics, sys

with open(sys.argv[1] if len(sys.argv) > 1 else "trace.json") as f:
    trace = json.load(f)
events = trace["traceEvents"] if isinstance(trace, dict) else trace
print(f"total events: {len(events)}", file=sys.stderr)

# --- identify threads ---
thread_names = {}   # (pid, tid) -> name
proc_names = {}
for e in events:
    if e.get("ph") == "M":
        if e.get("name") == "thread_name":
            thread_names[(e["pid"], e["tid"])] = e["args"]["name"]
        elif e.get("name") == "process_name":
            proc_names[e["pid"]] = e["args"]["name"]

# renderer main thread = CrRendererMain with most devtools.timeline events
main_candidates = collections.Counter()
for e in events:
    key = (e.get("pid"), e.get("tid"))
    if thread_names.get(key) == "CrRendererMain" and "devtools.timeline" in e.get("cat", ""):
        main_candidates[key] += 1
MAIN = main_candidates.most_common(1)[0][0]
print(f"main thread: {MAIN} ({main_candidates.most_common(3)})", file=sys.stderr)
RENDERER_PID = MAIN[0]

# scroll window: bound by LatencyInfo / GestureScrollUpdate, fall back to full span
ts_all = [e["ts"] for e in events if e.get("ts")]
t_lo, t_hi = min(ts_all), max(ts_all)
gest = [e["ts"] for e in events if "GestureScrollUpdate" in e.get("name", "")]
if gest:
    t_lo, t_hi = min(gest), max(gest)
span_ms = (t_hi - t_lo) / 1000
print(f"scroll window: {span_ms:.0f} ms", file=sys.stderr)

def in_window(e):
    return t_lo <= e.get("ts", 0) <= t_hi

# --- self-time on renderer main thread ---
xs = [e for e in events if e.get("ph") == "X" and (e["pid"], e["tid"]) == MAIN and in_window(e) and e.get("dur")]
xs.sort(key=lambda e: (e["ts"], -e["dur"]))
self_time = collections.Counter()
count = collections.Counter()
stack = []
for e in xs:
    end = e["ts"] + e["dur"]
    while stack and stack[-1][1] <= e["ts"]:
        stack.pop()
    if stack:
        # subtract from parent's self time
        self_time[stack[-1][0]] -= e["dur"] / 1000
    self_time[e["name"]] += e["dur"] / 1000
    count[e["name"]] += 1
    stack.append((e["name"], end))

BUCKETS = {
    "scripting": {"FunctionCall", "EvaluateScript", "TimerFire", "FireAnimationFrame",
                  "EventDispatch", "V8.Execute", "RunMicrotasks", "MajorGC", "MinorGC",
                  "GCEvent", "v8.callFunction", "ProfileCall", "FireIdleCallback",
                  "RequestAnimationFrame", "CancelAnimationFrame", "V8Console::runTask",
                  "BlinkGC.AtomicPhase", "V8.GCFinalizeMC", "V8.GCScavenger"},
    "style":     {"UpdateLayoutTree", "RecalculateStyles", "ParseAuthorStyleSheet"},
    "layout":    {"Layout", "PrePaint", "UpdateLayerTree", "IntersectionObserverController::computeIntersections",
                  "HitTest", "Layerize"},
    "paint":     {"Paint", "PaintImage", "Decode Image", "Draw LazyPixelRef", "Decode LazyPixelRef"},
    "composite": {"Commit", "CompositeLayers", "UpdateLayer", "CommitCompositorFrame"},
}
bucket_of = {n: b for b, names in BUCKETS.items() for n in names}
bucket_ms = collections.Counter()
other = collections.Counter()
for name, ms in self_time.items():
    b = bucket_of.get(name)
    if b: bucket_ms[b] += ms
    elif ms > 5: other[name] += ms

print("\n== main-thread self time during scroll ==")
total_busy = sum(v for v in self_time.values() if v > 0)
for b, ms in bucket_ms.most_common():
    print(f"  {b:10s} {ms:8.0f} ms  ({100*ms/span_ms:4.1f}% of scroll wall time)")
print(f"  {'idle-ish':10s} {span_ms - total_busy:8.0f} ms")
print("\n  top raw events by self-time:")
for name, ms in self_time.most_common(14):
    print(f"    {name:45s} {ms:7.0f} ms  x{count[name]}")
if other:
    print("\n  unbucketed >5ms:", {k: round(v) for k, v in other.most_common(8)})

# --- style recalc details ---
ult = [e for e in events if e.get("name") == "UpdateLayoutTree" and in_window(e) and e.get("ph") == "X"]
ec = [e.get("args", {}).get("elementCount", e.get("args", {}).get("data", {}).get("elementCount", 0)) or 0 for e in ult]
if ult:
    durs = [e["dur"]/1000 for e in ult]
    print(f"\n== style recalcs (UpdateLayoutTree): {len(ult)} in {span_ms:.0f} ms ({len(ult)/(span_ms/1000):.0f}/s) ==")
    print(f"  elements/recalc: median {statistics.median(ec):.0f}, p90 {sorted(ec)[int(len(ec)*.9)]}, max {max(ec)}")
    print(f"  duration ms: median {statistics.median(durs):.2f}, p90 {sorted(durs)[int(len(durs)*.9)]:.2f}, max {max(durs):.2f}, total {sum(durs):.0f}")

lay = [e for e in events if e.get("name") == "Layout" and in_window(e) and e.get("ph") == "X"]
if lay:
    durs = [e["dur"]/1000 for e in lay]
    dirty = [e.get("args", {}).get("beginData", {}).get("dirtyObjects", 0) for e in lay]
    print(f"\n== layouts: {len(lay)} ({len(lay)/(span_ms/1000):.0f}/s), total {sum(durs):.0f} ms, max {max(durs):.2f} ms, median dirty objects {statistics.median(dirty):.0f} ==")

# invalidation tracking: what schedules the recalcs
sched = collections.Counter()
for e in events:
    if e.get("name") == "ScheduleStyleRecalculation" and in_window(e):
        sched["ScheduleStyleRecalculation"] += 1
    if e.get("name") == "StyleRecalcInvalidationTracking" and in_window(e):
        d = e.get("args", {}).get("data", {})
        sched[f"invalidation: {d.get('reason','?')} @{d.get('extraData','')}"] += 1
print("\n== invalidation sources ==")
for k, v in sched.most_common(12):
    print(f"  {v:6d}  {k}")

# --- frames (compositor) ---
comp_tids = [k for k, v in thread_names.items() if v == "Compositor" and k[0] == RENDERER_PID]
draws = sorted(e["ts"] for e in events if e.get("name") == "DrawFrame" and (e["pid"], e["tid"]) in comp_tids and in_window(e))
if len(draws) > 10:
    deltas = [(b - a) / 1000 for a, b in zip(draws, draws[1:])]
    med = statistics.median(deltas)
    vsync = 16.67 if med < 14 or abs(med-16.67) < abs(med-11.11) else 11.11
    long_f = [d for d in deltas if d > vsync * 1.6]
    print(f"\n== frames (DrawFrame on compositor): {len(draws)} over {span_ms:.0f} ms -> avg {1000*len(deltas)/sum(deltas):.1f} fps ==")
    print(f"  frame delta ms: median {med:.1f}, p90 {sorted(deltas)[int(len(deltas)*.9)]:.1f}, p99 {sorted(deltas)[int(len(deltas)*.99)]:.1f}, max {max(deltas):.1f}")
    print(f"  janky frames (>1.6x vsync {vsync:.1f}ms): {len(long_f)} ({100*len(long_f)/len(deltas):.1f}%)")

# raster work
raster_ms = collections.Counter()
for e in events:
    if e.get("ph") == "X" and e.get("dur") and in_window(e) and e["pid"] == RENDERER_PID:
        tn = thread_names.get((e["pid"], e["tid"]), "")
        if "CompositorTileWorker" in tn and e["name"] in ("RasterTask", "TaskGraphRunner::RunTask"):
            raster_ms[tn] += e["dur"] / 1000
if raster_ms:
    print(f"\n== raster: {sum(raster_ms.values()):.0f} ms across {len(raster_ms)} tile workers ==")

# main thread longest tasks
tasks = sorted((e for e in xs if e["name"] in ("RunTask", "ThreadControllerImpl::RunTask")), key=lambda e: -e["dur"])[:8]
print("\n== longest main-thread tasks ==")
for e in tasks:
    print(f"  {e['dur']/1000:7.1f} ms at +{(e['ts']-t_lo)/1000:7.0f} ms")
