const r = await fetch("http://127.0.0.1:8787/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clearKey: true }) });
console.log(r.status, await r.text());
const h = await fetch("http://127.0.0.1:8787/api/health");
console.log(await h.text());
