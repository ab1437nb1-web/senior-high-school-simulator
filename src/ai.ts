import type { WeekReport } from "./sim/types";

export type AiSource = "proxy" | "deepseek" | "openai" | "custom";

export type AiConfig = {
  source: AiSource;
  baseUrl: string;
  apiKey: string;
  model: string;
  headers: string;
  temperature: number;
};

export const PRESET_BASE: Record<AiSource, { base: string; model: string; label: string }> = {
  proxy: { base: "http://127.0.0.1:8787", model: "deepseek-chat", label: "本地代理（推荐）" },
  deepseek: { base: "https://api.deepseek.com", model: "deepseek-chat", label: "DeepSeek" },
  openai: { base: "https://api.openai.com/v1", model: "gpt-4o-mini", label: "OpenAI" },
  custom: { base: "", model: "", label: "自定义（OpenAI 兼容）" },
};

const KEY = "hs-life-sim.ai.v1";

export function defaultAi(): AiConfig {
  return { source: "proxy", baseUrl: PRESET_BASE.proxy.base, apiKey: "", model: PRESET_BASE.proxy.model, headers: "", temperature: 0.7 };
}

export function aiEnabled(c: AiConfig) {
  return c.source === "proxy" || Boolean(c.apiKey);
}

export function loadAi(): AiConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultAi();
    return { ...defaultAi(), ...JSON.parse(raw) };
  } catch {
    return defaultAi();
  }
}

export function saveAi(c: AiConfig) {
  localStorage.setItem(KEY, JSON.stringify(c));
}

export function switchSource(c: AiConfig, source: AiSource): AiConfig {
  const p = PRESET_BASE[source];
  return { ...c, source, baseUrl: p.base, model: p.model || c.model };
}

function trimSlash(s: string) {
  return s.replace(/\/+$/, "");
}

export function chatEndpoint(c: AiConfig) {
  const base = trimSlash(c.baseUrl || "");
  if (!base) throw new Error("接口地址为空");
  if (c.source === "proxy") return base + "/api/chat";
  if (/\/chat\/completions$/.test(base)) return base;
  return base + "/chat/completions";
}

export function modelsEndpoint(c: AiConfig) {
  const base = trimSlash(c.baseUrl || "");
  if (!base) throw new Error("接口地址为空");
  if (c.source === "proxy") return base + "/api/models";
  return base + "/models";
}

function extraHeaders(c: AiConfig): Record<string, string> {
  if (!c.headers || !c.headers.trim()) return {};
  try {
    const obj = JSON.parse(c.headers);
    const out: Record<string, string> = {};
    for (const k of Object.keys(obj)) if (typeof obj[k] === "string") out[k] = obj[k];
    return out;
  } catch {
    return {};
  }
}

function headers(c: AiConfig) {
  if (c.source === "proxy") return { "Content-Type": "application/json", ...extraHeaders(c) };
  return {
    "Content-Type": "application/json",
    ...(c.apiKey ? { Authorization: "Bearer " + c.apiKey } : {}),
    ...extraHeaders(c),
  };
}

export type ProxyHealth = { ok: boolean; provider: string; model: string; hasKey: boolean; masked: string; baseUrl: string };

export async function proxyHealth(baseUrl: string): Promise<ProxyHealth | null> {
  try {
    const res = await fetch(trimSlash(baseUrl) + "/api/health");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export type ProxyConfigPatch = { apiKey?: string; model?: string; baseUrl?: string; provider?: string };

export type ProfileInfo = {
  id: string; name: string; provider: string; baseUrl: string; model: string; hasKey: boolean; masked: string;
};

async function postJson(url: string, body: any) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export async function listProfiles(serverBase: string): Promise<{ activeProfileId: string | null; profiles: ProfileInfo[] }> {
  const res = await fetch(trimSlash(serverBase) + "/api/profiles");
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}

export async function saveProfile(serverBase: string, patch: Partial<ProfileInfo> & { apiKey?: string }) {
  return postJson(trimSlash(serverBase) + "/api/profiles", patch);
}

export async function activateProfile(serverBase: string, id: string) {
  return postJson(trimSlash(serverBase) + "/api/profiles/activate", { id });
}

export async function deleteProfile(serverBase: string, id: string) {
  return postJson(trimSlash(serverBase) + "/api/profiles/delete", { id });
}

export async function setProxyConfig(serverBase: string, patch: ProxyConfigPatch) {
  try {
    const res = await fetch(trimSlash(serverBase) + "/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "HTTP " + res.status };
    return { ok: true, masked: data.masked as string };
  } catch (e: any) {
    return { ok: false, error: e?.message || "连不上本地代理" };
  }
}

export async function listModels(c: AiConfig, upstream?: string): Promise<{ models: string[]; url?: string }> {
  if (c.source === "proxy") {
    const q = upstream && upstream.trim() ? "?baseUrl=" + encodeURIComponent(upstream.trim()) : "";
    const res = await fetch(trimSlash(c.baseUrl) + "/api/models" + q);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data && (data.error || data.detail?.error?.message)) || "HTTP " + res.status);
    const arr = Array.isArray(data) ? data : data?.data || [];
    return { models: arr.map((m: any) => (typeof m === "string" ? m : m.id || m.name)).filter(Boolean), url: data?.url };
  }
  const base = upstream && upstream.trim() ? trimSlash(upstream.trim()) : c.baseUrl;
  const res = await fetch(trimSlash(base) + "/models", { headers: headers(c) });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  const arr = data?.data || data?.models || [];
  return { models: arr.map((m: any) => m.id || m.name).filter(Boolean), url: base + "/models" };
}

export async function testConnection(c: AiConfig): Promise<{ ok: boolean; ms: number; message: string }> {
  const t0 = Date.now();
  if (c.source === "proxy") {
    try {
      const res = await fetch(trimSlash(c.baseUrl) + "/api/health");
      const ms = Date.now() - t0;
      if (!res.ok) return { ok: false, ms, message: "本地代理无响应 HTTP " + res.status };
      const data = await res.json();
      if (!data.hasKey) return { ok: false, ms, message: "代理已启动，但还没配置 Key" };
      return { ok: true, ms, message: "代理在线 · " + data.provider + " / " + data.model };
    } catch (e: any) {
      return { ok: false, ms: Date.now() - t0, message: "连不上本地代理，先运行 npm run server" };
    }
  }
  try {
    const res = await fetch(chatEndpoint(c), {
      method: "POST",
      headers: headers(c),
      body: JSON.stringify({
        model: c.model,
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    const ms = Date.now() - t0;
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, ms, message: "HTTP " + res.status + " · " + text.slice(0, 80) };
    }
    return { ok: true, ms, message: "连接成功" };
  } catch (e: any) {
    return { ok: false, ms: Date.now() - t0, message: e?.message || "网络错误" };
  }
}

const SYSTEM = [
  "你写高中生的日常，克制、具体、不煽情。",
  "只能使用给定的事实，不得编造数字、人名、事件或天气。",
  "不写鼓励，不写总结，不写排比，不替读者下判断。",
  '返回 JSON：{"lines": ["..."]}，2 到 4 句，总长不超过 110 字。',
].join("");

export async function rewriteReport(c: AiConfig, report: WeekReport): Promise<string[] | null> {
  const facts = report.facts.map((f) => f.label).join("\n");
  try {
    const res = await fetch(chatEndpoint(c), {
      method: "POST",
      headers: headers(c),
      body: JSON.stringify({
        model: c.model,
        temperature: c.temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: "事实清单：\n" + facts + "\n\n只依据以上事实写这一周。" },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(text);
    const lines = (parsed.lines || []).filter((x: any) => typeof x === "string" && x.trim());
    if (!lines.length) return null;
    return lines;
  } catch {
    return null;
  }
}
export async function renderEventScene(c: AiConfig, prompt: string): Promise<string | null> {
  try {
    const res = await fetch(chatEndpoint(c), {
      method: "POST",
      headers: headers(c),
      body: JSON.stringify({
        model: c.model,
        temperature: Math.min(1, c.temperature + 0.15),
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "你在写一款中国高中生活模拟器的即时场景。只写发生的动作、对话与环境，2–4 句。" +
              "不写心理总结，不写排比，不用成语堆砌，不出现分数，不出现“他/她”，用名字或省略主语。" +
              "必须尊重给出的互动历史与当前关系：生疏就写生疏，熟才写熟。" +
              "人物性格是稳定的：关系升温只改变距离感，不改变说话方式与脾气；不要写成性格突变。" +
              "返回 JSON：{\"text\": \"...\"}。",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(raw);
    const text = (parsed.text || "").trim();
    if (!text || text.length > 220) return null;
    return text;
  } catch {
    return null;
  }
}
