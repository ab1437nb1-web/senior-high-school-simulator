// 本地 AI 代理：Key 只在这台机器上，浏览器永远拿不到完整值。
// 支持多个配置（官方 / 中转），随时切换。
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(HERE, "config.json");
const PORT = Number(process.env.PORT || 8787);
const HOST = "127.0.0.1";

const PRESETS = {
  deepseek: { baseUrl: "https://api.deepseek.com", model: "deepseek-chat" },
  openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
};

const newId = () => "p-" + crypto.randomBytes(4).toString("hex");
const mask = (k) => (!k ? "" : k.length <= 8 ? "****" : k.slice(0, 3) + "****" + k.slice(-4));

let store = load();

function load() {
  let raw = {};
  try { raw = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); } catch {}
  if (Array.isArray(raw.profiles) && raw.profiles.length) {
    return { activeProfileId: raw.activeProfileId || raw.profiles[0].id, profiles: raw.profiles };
  }
  const provider = raw.provider || "deepseek";
  const preset = PRESETS[provider] || PRESETS.deepseek;
  const key = raw.apiKey || "";
  if (!key && !raw.baseUrl) return { activeProfileId: null, profiles: [] };
  const id = newId();
  return {
    activeProfileId: id,
    profiles: [{ id, name: "默认", provider, baseUrl: raw.baseUrl || preset.baseUrl, model: raw.model || preset.model, apiKey: key }],
  };
}

function persist() {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(store, null, 2) + "\n", { encoding: "utf8", mode: 0o600 });
}

const activeProfile = () => store.profiles.find((x) => x.id === store.activeProfileId) || store.profiles[0] || null;

function publicProfile(x) {
  return { id: x.id, name: x.name, provider: x.provider || "custom", baseUrl: x.baseUrl, model: x.model, hasKey: Boolean(x.apiKey), masked: mask(x.apiKey) };
}

const ALLOWED = new Set([
  "http://127.0.0.1:5180", "http://localhost:5180",
  "http://127.0.0.1:5173", "http://localhost:5173",
  "http://127.0.0.1:5181", "http://localhost:5181",
]);

function cors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "600");
}

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > 2 * 1024 * 1024) reject(new Error("body too large"));
      else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const baseOf = (u) => String(u || "").replace(/\/+$/, "").replace(/\/chat\/completions$/, "");

function candidates(base) {
  const b = baseOf(base);
  const out = [b];
  if (!/\/v\d+$/.test(b) && !/\/api$/.test(b)) out.push(b + "/v1");
  return out;
}

async function callProvider(profile, p, pathName, init) {
  const headers = { "Content-Type": "application/json", ...(p.apiKey ? { Authorization: "Bearer " + p.apiKey } : {}) };
  let last = null;
  for (const b of candidates(p.baseUrl)) {
    const r = await fetch(b + pathName, { ...init, headers });
    if (r.status !== 404) {
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 400) }; }
      return { status: r.status, data, url: b + pathName };
    }
    last = r;
  }
  const text = last ? await last.text() : "";
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: String(text).slice(0, 400) }; }
  return { status: last ? last.status : 502, data, url: baseOf(p.baseUrl) + pathName };
}

function profilesPayload() {
  return { activeProfileId: store.activeProfileId, profiles: store.profiles.map(publicProfile) };
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  const url = new URL(req.url || "/", "http://" + HOST);
  const origin = req.headers.origin || "";
  const guard = () => {
    if (origin && !ALLOWED.has(origin)) { json(res, 403, { error: "origin not allowed" }); return false; }
    if (!String(req.headers["content-type"] || "").includes("application/json")) { json(res, 415, { error: "json required" }); return false; }
    return true;
  };

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (url.pathname === "/api/health") {
    const p = activeProfile();
    json(res, 200, {
      ok: true,
      provider: p ? p.provider : "none",
      model: p ? p.model : "",
      hasKey: Boolean(p && p.apiKey),
      masked: p ? mask(p.apiKey) : "",
      baseUrl: p ? p.baseUrl : "",
      activeProfileId: store.activeProfileId,
      profileCount: store.profiles.length,
    });
    return;
  }

  if (url.pathname === "/api/profiles" && req.method === "GET") {
    json(res, 200, profilesPayload());
    return;
  }

  if (url.pathname === "/api/profiles" && req.method === "POST") {
    if (!guard()) return;
    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      const existing = body.id ? store.profiles.find((x) => x.id === body.id) : null;
      const target = existing || { id: newId(), name: "配置", provider: "custom", baseUrl: "", model: "", apiKey: "" };
      if (typeof body.name === "string" && body.name.trim()) target.name = body.name.trim();
      if (typeof body.provider === "string" && body.provider.trim()) target.provider = body.provider.trim();
      if (typeof body.baseUrl === "string" && body.baseUrl.trim()) target.baseUrl = baseOf(body.baseUrl.trim());
      if (typeof body.model === "string" && body.model.trim()) target.model = body.model.trim();
      if (typeof body.apiKey === "string" && body.apiKey.trim()) target.apiKey = body.apiKey.trim();
      if (body.clearKey) target.apiKey = "";
      if (!existing) store.profiles.push(target);
      store.activeProfileId = target.id;
      persist();
      json(res, 200, { ok: true, activeProfileId: store.activeProfileId, profiles: store.profiles.map(publicProfile) });
    } catch (e) {
      json(res, 400, { error: String((e && e.message) || e) });
    }
    return;
  }

  if (url.pathname === "/api/profiles/activate" && req.method === "POST") {
    if (!guard()) return;
    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      if (!store.profiles.some((x) => x.id === body.id)) return json(res, 404, { error: "profile not found" });
      store.activeProfileId = body.id;
      persist();
      json(res, 200, { ok: true, activeProfileId: store.activeProfileId });
    } catch (e) {
      json(res, 400, { error: String((e && e.message) || e) });
    }
    return;
  }

  if (url.pathname === "/api/profiles/delete" && req.method === "POST") {
    if (!guard()) return;
    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      store.profiles = store.profiles.filter((x) => x.id !== body.id);
      if (!store.profiles.some((x) => x.id === store.activeProfileId)) store.activeProfileId = store.profiles[0] ? store.profiles[0].id : null;
      persist();
      json(res, 200, profilesPayload());
    } catch (e) {
      json(res, 400, { error: String((e && e.message) || e) });
    }
    return;
  }

  if (url.pathname === "/api/models" && req.method === "GET") {
    const p = activeProfile();
    if (!p) return json(res, 400, { error: "还没有配置服务商" });
    const override = url.searchParams.get("baseUrl");
    const useBase = override && /^https?:\/\//i.test(override) && override.length < 300 ? override : p.baseUrl;
    try {
      const r = await callProvider(null, { ...p, baseUrl: useBase }, "/models", { method: "GET" });
      if (r.status >= 400) return json(res, 502, { error: "上游返回 " + r.status, detail: r.data, url: r.url });
      json(res, 200, { baseUrl: baseOf(useBase), url: r.url, data: r.data?.data || r.data?.models || r.data });
    } catch (e) {
      json(res, 502, { error: String((e && e.message) || e), baseUrl: baseOf(useBase) });
    }
    return;
  }

  if (url.pathname === "/api/chat" && req.method === "POST") {
    const p = activeProfile();
    if (!p) return json(res, 400, { error: "还没有配置服务商" });
    try {
      const body = JSON.parse((await readBody(req)) || "{}");
      const payload = {
        model: body.model || p.model,
        messages: body.messages,
        temperature: body.temperature ?? 0.7,
        ...(body.response_format ? { response_format: body.response_format } : {}),
        ...(body.max_tokens ? { max_tokens: body.max_tokens } : {}),
      };
      if (!Array.isArray(payload.messages) || !payload.messages.length) return json(res, 400, { error: "messages is required" });
      const r = await callProvider(null, p, "/chat/completions", { method: "POST", body: JSON.stringify(payload) });
      if (r.status >= 400) return json(res, 502, { error: "上游返回 " + r.status, detail: r.data, url: r.url });
      json(res, 200, r.data);
    } catch (e) {
      json(res, 400, { error: String((e && e.message) || e) });
    }
    return;
  }

  json(res, 404, { error: "not found" });
});

server.listen(PORT, HOST, () => {
  const p = activeProfile();
  console.log("[ai-proxy] http://" + HOST + ":" + PORT);
  console.log("[ai-proxy] profiles=" + store.profiles.length + " active=" + (p ? p.name + " (" + p.baseUrl + ")" : "无") + " key=" + (p && p.apiKey ? mask(p.apiKey) : "未配置"));
});
