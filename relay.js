/* APPSCON 2026 e-Souvenir unveiling — tiny relay between the tablet and the auditorium screen.
   Uses the free ntfy.sh service over normal HTTPS (port 443), so it works on most institute Wi-Fi.
   The channel name below is private: anyone who knows it could open the curtain, so don't share it. */
const RELAY = (() => {
  const TOPIC = "appscon26-unveil-4b9f7ykkw6o8jqxyy5";
  const BASE = "https://ntfy.sh/" + TOPIC;
  const handlers = [];
  let ws = null, lastTime = Math.floor(Date.now() / 1000), connected = false, retry = 1000, seen = new Set();
  const statusFns = [];
  function setConn(ok){ if (connected !== ok){ connected = ok; statusFns.forEach(f => f(ok)); } }
  function deliver(ev){
    if (!ev || ev.event !== "message" || seen.has(ev.id)) return;
    seen.add(ev.id); if (ev.time) lastTime = Math.max(lastTime, ev.time);
    let msg; try { msg = JSON.parse(ev.message); } catch (e) { return; }
    handlers.forEach(h => { try { h(msg); } catch (e) {} });
  }
  async function catchUp(){
    // pick up anything sent while we were disconnected
    try {
      const r = await fetch(BASE + "/json?poll=1&since=" + (lastTime - 2));
      const txt = await r.text();
      txt.split("\n").filter(Boolean).forEach(l => { try { deliver(JSON.parse(l)); } catch (e) {} });
    } catch (e) {}
  }
  function connect(){
    try { ws = new WebSocket("wss://ntfy.sh/" + TOPIC + "/ws"); } catch (e) { return later(); }
    ws.onopen = () => { setConn(true); retry = 1000; catchUp(); };
    ws.onmessage = e => { try { deliver(JSON.parse(e.data)); } catch (x) {} };
    ws.onclose = () => { setConn(false); later(); };
    ws.onerror = () => { try { ws.close(); } catch (e) {} };
  }
  function later(){ setTimeout(connect, retry); retry = Math.min(retry * 2, 15000); }
  async function send(msg, tries = 2){
    for (let i = 0; i < tries; i++){
      try {
        const r = await fetch(BASE, { method: "POST", body: JSON.stringify(msg) });
        if (r.ok) return true;
      } catch (e) {}
      await new Promise(r => setTimeout(r, 700));
    }
    return false;
  }
  connect();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && (!ws || ws.readyState > 1)) connect(); });
  return {
    on: fn => handlers.push(fn),
    onStatus: fn => { statusFns.push(fn); fn(connected); },
    send,
    isConnected: () => connected
  };
})();

async function keepAwake(){
  try {
    if (!navigator.wakeLock) return;
    await navigator.wakeLock.request("screen");
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") keepAwake(); }, { once: true });
  } catch (e) {}
}
