/* APPSCON 2026 e-Souvenir unveiling — link between the tablet and the auditorium screen.
   Main path: an always-open MQTT connection (HiveMQ public broker) — about 0.2 s.
   Backup path: ntfy.sh over normal HTTPS, used automatically if the main path is blocked.
   Every message goes out on whichever paths are up; duplicates are dropped by id.
   The channel name below is private: anyone who knows it could open the curtain, so don't share it. */
const RELAY = (() => {
  const KEY = "4b9f7ykkw6o8jqxyy5";
  const MQTT_URL = "wss://broker.hivemq.com:8884/mqtt";
  const T_MSG = "appscon26/unveil/" + KEY + "/msg";
  const T_STATUS = "appscon26/unveil/" + KEY + "/status";
  const NTFY = "https://ntfy.sh/appscon26-unveil-" + KEY;

  const handlers = [], connFns = [], statusFns = [];
  const seen = new Set();
  let mq = null, mqUp = false, wsUp = false, lastTime = Math.floor(Date.now() / 1000);

  const isUp = () => mqUp || wsUp;
  function fireConn(){ connFns.forEach(f => f(isUp())); }
  function deliver(msg){
    if (!msg || !msg.id || seen.has(msg.id)) return;
    seen.add(msg.id);
    handlers.forEach(h => { try { h(msg); } catch (e) {} });
  }

  /* ---- main path: MQTT ---- */
  function startMqtt(){
    if (!window.mqtt) return;
    try {
      mq = mqtt.connect(MQTT_URL, { keepalive: 20, reconnectPeriod: 1500, connectTimeout: 8000, clean: true,
        clientId: "appscon26-" + Math.random().toString(36).slice(2, 10),
        will: window.RELAY_ROLE === "screen" ? { topic: T_STATUS, payload: JSON.stringify({ state: "offline" }), qos: 0, retain: true } : undefined });
      mq.on("connect", () => { mqUp = true; mq.subscribe([T_MSG, T_STATUS]); fireConn(); if (pendingStatus) setStatus(pendingStatus); });
      mq.on("close", () => { if (mqUp){ mqUp = false; fireConn(); } });
      mq.on("offline", () => { if (mqUp){ mqUp = false; fireConn(); } });
      mq.on("error", () => {});
      mq.on("message", (topic, buf) => {
        let m; try { m = JSON.parse(buf.toString()); } catch (e) { return; }
        if (topic === T_STATUS) statusFns.forEach(f => f(m)); else deliver(m);
      });
    } catch (e) {}
  }

  /* ---- backup path: ntfy ---- */
  let ws = null, retry = 1000;
  function startNtfy(){
    try { ws = new WebSocket(NTFY.replace("https://", "wss://") + "/ws"); } catch (e) { return later(); }
    ws.onopen = () => { wsUp = true; retry = 1000; fireConn(); catchUp(); };
    ws.onmessage = e => { try { const ev = JSON.parse(e.data); if (ev.event === "message"){ if (ev.time) lastTime = Math.max(lastTime, ev.time); deliver(JSON.parse(ev.message)); } } catch (x) {} };
    ws.onclose = () => { if (wsUp){ wsUp = false; fireConn(); } later(); };
    ws.onerror = () => { try { ws.close(); } catch (e) {} };
  }
  function later(){ setTimeout(startNtfy, retry); retry = Math.min(retry * 2, 15000); }
  async function catchUp(){
    try {
      const txt = await (await fetch(NTFY + "/json?poll=1&since=" + (lastTime - 2))).text();
      txt.split("\n").filter(Boolean).forEach(l => { try { const ev = JSON.parse(l); if (ev.event === "message") deliver(JSON.parse(ev.message)); } catch (e) {} });
    } catch (e) {}
  }
  async function ntfySend(body, tries){
    for (let i = 0; i < tries; i++){
      try { if ((await fetch(NTFY, { method: "POST", body })).ok) return true; } catch (e) {}
      await new Promise(r => setTimeout(r, 600));
    }
    return false;
  }
  // keep the backup connection warm only while the main path is down
  setInterval(() => { if (!mqUp && document.visibilityState === "visible") fetch(NTFY + "/json?poll=1&since=1s").catch(() => {}); }, 30000);

  /* ---- public API ---- */
  async function send(msg, opts = {}){
    msg = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }, msg);
    seen.add(msg.id);
    const body = JSON.stringify(msg);
    let viaMqtt = false;
    if (mqUp){ try { mq.publish(T_MSG, body, { qos: 0 }); viaMqtt = true; } catch (e) {} }
    if (viaMqtt && !opts.critical) return true;               // chatter goes on the fast path only
    const backup = ntfySend(body, viaMqtt ? 1 : (opts.tries || 2)); // important messages also take the backup path
    return viaMqtt ? true : await backup;
  }
  let pendingStatus = null;
  function setStatus(obj){                                      // screen only: retained "I'm here, curtain is X"
    pendingStatus = obj;
    if (mqUp) try { mq.publish(T_STATUS, JSON.stringify(Object.assign({ at: Date.now() }, obj)), { qos: 0, retain: true }); } catch (e) {}
  }

  startMqtt(); startNtfy();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (!ws || ws.readyState > 1) startNtfy();
    if (mq && !mq.connected) try { mq.reconnect(); } catch (e) {}
  });
  return {
    on: fn => handlers.push(fn),
    onConnection: fn => { connFns.push(fn); fn(isUp()); },
    onScreenStatus: fn => statusFns.push(fn),
    send, setStatus,
    isConnected: isUp,
    fastPath: () => mqUp
  };
})();

async function keepAwake(){
  try {
    if (!navigator.wakeLock) return;
    await navigator.wakeLock.request("screen");
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") keepAwake(); }, { once: true });
  } catch (e) {}
}
