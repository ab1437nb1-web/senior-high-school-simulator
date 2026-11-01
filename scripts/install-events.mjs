import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--")) || "事件编辑器.md";
const checkOnly = args.includes("--check");
const autoYes = args.includes("--yes");
const doCommit = args.includes("--commit");

const GROUP = { 主线: "main", 日常: "daily", 社交: "social", 朋友: "friend", 暧昧: "crush", 恋爱: "love" };
const SUBJ = { 语文: "chinese", 数学: "math", 英语: "english", 物理: "physics", 化学: "chemistry", 生物: "biology", 政治: "politics", 历史: "history", 地理: "geography" };
const DIM = { 品德: "moral", 学业: "academic", 健康: "health", 艺术: "art", 劳动: "labor" };
const errs = [];

const rawFile = fs.readFileSync(file, "utf8");
const zone = rawFile.match(/<!--\s*安装区:开始\s*-->([\s\S]*?)<!--\s*安装区:结束\s*-->/);
const text = (zone ? zone[1] : rawFile).replace(/```[\s\S]*?```/g, "");
const blocks = text.split(/^## 事件：/m).slice(1);
if (!blocks.length) {
  console.log("安装区里没有内容。");
  process.exit(0);
}

const parseEffects = (raw, where) => {
  const out = { stats: {}, mastery: [], relation: [], evidence: [], extra: {} };
  for (const tokenRaw of raw.split(/[,，]/)) {
    const token = tokenRaw.trim();
    if (!token) continue;
    let m;
    if ((m = token.match(/^(精力|压力|心情|健康)([+-]\d+)$/))) {
      const key = { 精力: "energy", 压力: "stress", 心情: "mood", 健康: "health" }[m[1]];
      out.stats[key] = Number(m[2]);
    } else if ((m = token.match(/^关系([+-]\d+)$/))) {
      out.relation.push({ who: "deskmate", amount: Number(m[1]) });
    } else if ((m = token.match(/^掌握:(\S+?)([+-]\d+)$/))) {
      const s = SUBJ[m[1]];
      if (!s) errs.push(where + "：不认识的科目「" + m[1] + "」");
      else out.mastery.push({ subject: s, amount: Number(m[2]) });
    } else if ((m = token.match(/^证据:(\S+?):([^:]+)(?::([+-]\d+))?$/))) {
      const d = DIM[m[1]];
      if (!d) errs.push(where + "：不认识的五育维度「" + m[1] + "」");
      else out.evidence.push({ dim: d, label: m[2].trim(), value: m[3] ? Number(m[3]) : 1 });
    } else if (token === "恋爱") out.extra.romance = true;
    else if (token === "分手") out.extra.breakup = true;
    else if (token === "换座位") out.extra.resit = true;
    else if ((m = token.match(/^文理:(.+)$/))) out.extra.choice = m[1];
    else errs.push(where + "：无法识别的效果「" + token + "」");
  }
  return out;
};

const parseRequires = (raw, where) => {
  const r = {};
  if (!raw || raw.trim() === "无") return r;
  for (const tokenRaw of raw.split(/[,，]/)) {
    const token = tokenRaw.trim();
    if (!token) continue;
    let m;
    if (token === "朋友") r.friend = true;
    else if (token === "单身") r.noRomance = true;
    else if (token === "恋爱中") r.romance = true;
    else if ((m = token.match(/^关系≥(\d+)$/))) r.minRelation = Number(m[1]);
    else if ((m = token.match(/^暧昧≥(\d+)$/))) r.bonusCount = Number(m[1]);
    else if ((m = token.match(/^压力≥(\d+)$/))) r.minStress = Number(m[1]);
    else if ((m = token.match(/^低关系≥(\d+)$/))) r.lowRelWeeks = Number(m[1]);
    else if ((m = token.match(/^掌握:(\S+?)<(\d+)$/))) {
      const s = SUBJ[m[1]];
      if (!s) errs.push(where + "：不认识的科目「" + m[1] + "」");
      else r.masteryBelow = { subject: s, value: Number(m[2]) };
    } else if ((m = token.match(/^当周有:(.+)$/))) {
      r.actions = m[1].split("/").map((x) => x.trim()).filter(Boolean);
    } else errs.push(where + "：无法识别的触发条件「" + token + "」");
  }
  return r;
};

const items = [];
for (const block of blocks) {
  const title = block.split("\n")[0].trim();
  const where = "事件「" + title + "」";
  const field = (name) => {
    const m = block.match(new RegExp("^-\\s*" + name + ":\\s*(.+)$", "m"));
    return m ? m[1].trim() : "";
  };
  const id = field("编号");

  // 只填编号、其余留空 = 删除指令
  if (id && !field("文本") && !/^### 选项/m.test(block) && !field("分类")) {
    items.push({ kind: "delete", id });
    continue;
  }

  const groupName = field("分类");
  const group = GROUP[groupName];
  if (!group) errs.push(where + "：分类必须是 " + Object.keys(GROUP).join("/") + "，现在是「" + groupName + "」");
  const wk = field("周次").match(/^(\d+)(?:\s*-\s*(\d+))?$/);
  if (!wk) errs.push(where + "：周次要写成 2-17 或 8");
  if (!field("文本")) errs.push(where + "：缺少文本");
  const eventId = id || "gen-" + title.replace(/[^\w\u4e00-\u9fa5]+/g, "-").toLowerCase();
  const choices = [];
  const parts = block.split(/^### 选项\s*\d+\s*$/m).slice(1);
  if (parts.length < 2) errs.push(where + "：至少要有两个选项");
  for (const [i, part] of parts.entries()) {
    const cw = where + " 选项" + (i + 1);
    const ct = part.match(/^-\s*文本:\s*(.+)$/m);
    const cr = part.match(/^-\s*结果:\s*(.+)$/m);
    const ce = part.match(/^-\s*效果:\s*(.+)$/m);
    if (!ct) { errs.push(cw + "：缺少文本"); continue; }
    if (!cr) errs.push(cw + "：缺少结果");
    choices.push({ text: ct[1].trim(), result: cr ? cr[1].trim() : "", eff: parseEffects(ce ? ce[1] : "", cw) });
  }

  items.push({
    kind: "event",
    event: {
      id: eventId,
      title,
      group,
      weeks: [Number(wk ? wk[1] : 1), Number(wk ? (wk[2] || wk[1]) : 18)],
      weight: Number(field("权重") || 1),
      stages: field("阶段") ? field("阶段").split(/[,，]/).map((x) => Number(x.trim())) : undefined,
      cooldown: field("冷却") ? Number(field("冷却")) : undefined,
      requires: parseRequires(field("触发"), where),
      text: field("文本"),
      choices,
    },
  });
}

if (errs.length) {
  console.error("发现 " + errs.length + " 处问题：");
  for (const e of errs) console.error("  - " + e);
  process.exit(1);
}

const statePath = path.join("src", "sim", "events.overrides.json");
const state = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath, "utf8"))
  : { added: [], overrides: {}, deleted: [] };
state.added = state.added || [];
state.overrides = state.overrides || {};
state.deleted = state.deleted || [];

const baseIds = new Set([...fs.readFileSync(path.join("src", "sim", "events.ts"), "utf8").matchAll(/id: "([^"]+)"/g)].map((m) => m[1]));
const knownIds = new Set(baseIds);
for (const e of state.added) knownIds.add(e.id);
for (const id of Object.keys(state.overrides)) knownIds.add(id);

const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
const ask = (q) => new Promise((res) => (rl ? rl.question(q, res) : Promise.resolve("")));

const confirm = async (question) => {
  if (autoYes) return true;
  if (!rl) { errs.push("需要确认但没有终端：请加 --yes，或在终端里运行"); return false; }
  const a = (await ask(question + " [y/N] ")).trim().toLowerCase();
  return a === "y" || a === "yes";
};

const lit = (v) => JSON.stringify(v);
const effectsTs = (eff) => {
  const parts = [];
  if (Object.keys(eff.stats).length) parts.push("stats: " + lit(eff.stats));
  if (eff.mastery.length) parts.push("mastery: " + lit(eff.mastery));
  if (eff.relation.length) parts.push("relation: " + lit(eff.relation));
  if (eff.evidence.length) parts.push("evidence: " + lit(eff.evidence[0]));
  for (const k of Object.keys(eff.extra)) parts.push(k + ": true");
  return "{ " + parts.join(", ") + " }";
};
const toEvent = (e) => {
  const kindOf = (g) => (g === "daily" ? "random" : g === "main" ? "main" : "npc");
  const out = {
    id: e.id,
    kind: kindOf(e.group),
    group: e.group,
    title: e.title,
    text: e.text,
    weeks: e.weeks,
    weight: e.weight,
    choices: e.choices.map((c) => ({ text: c.text, result: c.result, effects: effectsTs(c.eff) })),
  };
  if (e.group !== "daily" && e.group !== "main") out.social = true;
  if (e.group === "crush") out.preRomance = true;
  if (e.group === "love") out.romance = true;
  if (e.stages) out.stages = e.stages;
  if (e.cooldown) out.cooldown = e.cooldown;
  if (Object.keys(e.requires).length) out.requires = e.requires;
  return out;
};

let addedCount = 0, overCount = 0, delCount = 0;
for (const item of items) {
  if (item.kind === "delete") {
    const inState = state.added.some((e) => e.id === item.id) || state.overrides[item.id];
    if (!inState && !knownIds.has(item.id)) {
      console.log("跳过删除：本地没有事件 " + item.id);
      continue;
    }
    if (!(await confirm("删除事件 " + item.id + "？"))) { console.log("已取消：" + item.id); continue; }
    state.added = state.added.filter((e) => e.id !== item.id);
    delete state.overrides[item.id];
    if (!state.deleted.includes(item.id)) state.deleted.push(item.id);
    delCount++;
    continue;
  }
  const ev = toEvent(item.event);
  const exists = knownIds.has(ev.id) || state.deleted.includes(ev.id);
  if (exists) {
    if (!(await confirm("事件 " + ev.id + " 已存在，覆盖？"))) { console.log("已跳过：" + ev.id); continue; }
    state.deleted = state.deleted.filter((x) => x !== ev.id);
    state.added = state.added.filter((e) => e.id !== ev.id);
    state.overrides[ev.id] = ev;
    overCount++;
  } else {
    state.added.push(ev);
    knownIds.add(ev.id);
    addedCount++;
  }
}

console.log("新增 " + addedCount + " 条，覆盖 " + overCount + " 条，删除 " + delCount + " 条。");
if (checkOnly) { console.log("仅检查，未写入。"); process.exit(0); }

fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
execFileSync("npx", ["esbuild", "scripts/entry.ts", "--bundle", "--format=esm", "--platform=node", "--outfile=.tmp/engine.mjs"], { stdio: "inherit", shell: true });
const mod = await import("../.tmp/engine.mjs?" + Date.now());
const ids = new Set();
for (const ev of mod.EVENTS) {
  if (ids.has(ev.id)) { console.error("编号重复：" + ev.id); process.exit(1); }
  ids.add(ev.id);
}
console.log("当前事件总数：" + mod.EVENTS.length);
if (doCommit) {
  execFileSync("git", ["add", "-A"], { stdio: "inherit" });
  execFileSync("git", ["commit", "-m", "feat(events): 导入 " + addedCount + " 新增 / " + overCount + " 覆盖 / " + delCount + " 删除"], { stdio: "inherit" });
  execFileSync("git", ["push"], { stdio: "inherit" });
}
console.log("完成。");