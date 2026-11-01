const base = "http://127.0.0.1:8787";
const j = (o) => JSON.stringify(o);
const post = (path, body) => fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: j(body) });

const before = await (await fetch(base + "/api/profiles")).json();
console.log("before:", before.profiles.map((p) => p.name + ":" + p.masked).join(", "));

const created = await (await post("/api/profiles", { name: "测试中转", baseUrl: "http://127.0.0.1:8799", model: "relay-a", apiKey: "sk-mock-123456" })).json();
const testId = created.activeProfileId;
console.log("created:", created.profiles.map((p) => p.name).join(", "), "active:", testId);

const models = await (await fetch(base + "/api/models")).json();
console.log("models:", j(models.data), "url:", models.url);

const back = await (await post("/api/profiles/activate", { id: before.activeProfileId })).json();
console.log("reactivated:", back.ok);

const del = await (await post("/api/profiles/delete", { id: testId })).json();
console.log("after delete:", del.profiles.map((p) => p.name + ":" + p.masked).join(", "));
