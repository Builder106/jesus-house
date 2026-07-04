// Minimal flat-session CDP client over Node's built-in WebSocket.
export function connect(url = "ws://localhost:9222/devtools/browser") {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let nextId = 1;
    const pending = new Map();
    const eventHandlers = [];
    ws.onopen = () => resolve(client);
    ws.onerror = (e) => reject(new Error("ws error"));
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
      } else if (m.method) {
        for (const h of eventHandlers) h(m);
      }
    };
    const client = {
      send(method, params = {}, sessionId) {
        const id = nextId++;
        return new Promise((res, rej) => {
          pending.set(id, { res, rej });
          ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
        });
      },
      on(handler) { eventHandlers.push(handler); },
      close() { ws.close(); },
      async attachPage(urlSubstr) {
        const { targetInfos } = await this.send("Target.getTargets");
        const t = targetInfos.find((t) => t.type === "page" && t.url.includes(urlSubstr));
        if (!t) throw new Error("page target not found: " + urlSubstr);
        const { sessionId } = await this.send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
        return { sessionId, target: t };
      },
    };
  });
}
