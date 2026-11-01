const base = "http://127.0.0.1:8787";
const opt = await fetch(base + "/api/chat", { method: "OPTIONS", headers: { Origin: "http://127.0.0.1:5180", "Access-Control-Request-Method": "POST" } });
console.log("OPTIONS", opt.status, opt.headers.get("access-control-allow-origin"), opt.headers.get("access-control-allow-methods"));
const r = await fetch(base + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://127.0.0.1:5180" }, body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }) });
const text = await r.text();
console.log("POST", r.status, text.slice(0, 220));
const bad = await fetch(base + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
console.log("BAD", bad.status, (await bad.text()).slice(0, 120));
