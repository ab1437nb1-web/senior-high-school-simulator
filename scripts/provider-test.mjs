const base = "http://127.0.0.1:8787";
const a = await fetch(base + "/api/models?baseUrl=" + encodeURIComponent("http://127.0.0.1:8799"));
console.log("RELAY(base without /v1):", a.status, (await a.text()).slice(0, 200));
await new Promise(r => setTimeout(r, 200));
const b = await fetch(base + "/api/models?baseUrl=" + encodeURIComponent("http://127.0.0.1:8799/v1"));
console.log("RELAY(with /v1):", b.status, (await b.text()).slice(0, 160));
await new Promise(r => setTimeout(r, 200));
const c = await fetch(base + "/api/models?baseUrl=" + encodeURIComponent("http://127.0.0.1:8798"));
console.log("DEAD:", c.status, (await c.text()).slice(0, 160));
