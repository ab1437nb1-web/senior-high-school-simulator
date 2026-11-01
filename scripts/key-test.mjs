const base = "http://127.0.0.1:8787";
const post = await fetch(base + "/api/config", { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://127.0.0.1:5180" }, body: JSON.stringify({ apiKey: "sk-test-1234567890abcdef", model: "deepseek-chat" }) });
console.log("CONFIG", post.status, await post.text());
const health = await fetch(base + "/api/health");
console.log("HEALTH", await health.text());
const bad = await fetch(base + "/api/config", { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://evil.example" }, body: JSON.stringify({ apiKey: "x" }) });
console.log("EVIL", bad.status, await bad.text());
const plain = await fetch(base + "/api/config", { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ apiKey: "x" }) });
console.log("PLAIN", plain.status, await plain.text());
