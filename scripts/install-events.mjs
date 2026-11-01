import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--")) || "事件编辑器.md";
const checkOnly = args.includes("--check");
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
  console.log("这份文件里没有需要安装的事件（代码块内的示例不算）。");
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
    else if ((m = token.match(/^掌握:(\S+?)<(\d+)$/))) {
      const s = SUBJ[m[1]];
      if (!s) errs.push(where + "：不认识的科目「" + m[1] + "」");
      else r.masteryBelow = { subject: s, value: Number(m[2]) };
    } else errs.push(where + "：无法识别的触发条件「" + token + "」");
  }
  return r;
};

const events = [];
const seen = new Set();
for (const block of blocks) {
  const title = block.split("\n")[0].trim();
  const where = "事件「" + title + "」";
  const field = (name) => {
    const m = block.match(new RegExp("^-\\s*" + name + ":\\s*(.+)$", "m"));
    return m ? m[1].trim() : "";
  };
  const groupName = field("分类");
  const group = GROUP[groupName];
  if (!group) errs.push(where + "：分类必须是 " + Object.keys(GROUP).join("/") + "，现在是「" + groupName + "」");
  const wk = field("周次").match(/^(\d+)(?:\s*-\s*(\d+))?$/);
  if (!wk) errs.push(where + "：周次要写成 2-17 或 8");
  const textLine = field("文本");
  if (!textLine) errs.push(where + "：缺少文本");
  const id = field("编号") || "gen-" + title.replace(/[^\w\u4e00-\u9fa5]+/g, "-").toLowerCase();
  if (seen.has(id)) errs.push(where + "：编号重复「" + id + "」");
  seen.add(id);
  const weight = Number(field("权重") || 1);
  const stages = field("阶段") ? field("阶段").split(/[,，]/).map((x) => Number(x.trim())) : undefined;
  const cooldown = field("冷却") ? Number(field("冷却")) : undefined;
  const requires = parseRequires(field("触发"), where);

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
    const eff = parseEffects(ce ? ce[1] : "", cw);
    choices.push({ text: ct[1].trim(), result: cr ? cr[1].trim() : "", eff });
  }

  events.push({ id, title, group, weeks: [Number(wk[1]), Number(wk[2] || wk[1])], weight, stages, cooldown, requires, text: textLine, choices });
}

if (errs.length) {
  console.error("发现 " + errs.length + " 处问题：");
  for (const e of errs) console.error("  - " + e);
  process.exit(1);
}

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

const kindOf = (g) => (g === "daily" ? "random" : g === "main" ? "main" : "npc");
const lines = [];
lines.push("// 由 scripts/install-events.mjs 从 事件编辑器.md 生成，请勿手工编辑。");
lines.push('import type { StoryEvent } from "./types";');
lines.push("");
lines.push("export const GENERATED_EVENTS: StoryEvent[] = [");
for (const e of events) {
  lines.push("  {");
  lines.push("    id: " + lit(e.id) + ",");
  lines.push("    kind: " + lit(kindOf(e.group)) + ",");
  lines.push("    group: " + lit(e.group) + ",");
  if (e.group !== "daily" && e.group !== "main") lines.push("    social: true,");
  if (e.group === "crush") lines.push("    preRomance: true,");
  if (e.group === "love") lines.push("    romance: true,");
  lines.push("    title: " + lit(e.title) + ",");
  lines.push("    text: " + lit(e.text) + ",");
  lines.push("    weeks: " + lit(e.weeks) + ",");
  lines.push("    weight: " + e.weight + ",");
  if (e.stages) lines.push("    stages: " + lit(e.stages) + ",");
  if (e.cooldown) lines.push("    cooldown: " + e.cooldown + ",");
  if (Object.keys(e.requires).length) lines.push("    requires: " + lit(e.requires) + ",");
  lines.push("    choices: [");
  for (const c of e.choices) lines.push("      { text: " + lit(c.text) + ", result: " + lit(c.result) + ", effects: " + effectsTs(c.eff) + " },");
  lines.push("    ],");
  lines.push("  },");
}
lines.push("];");
lines.push("");

const target = path.join("src", "sim", "events.generated.ts");
console.log("解析到 " + events.length + " 个事件：" + events.map((e) => e.title + "(" + e.group + ")").join("、"));
if (checkOnly) {
  console.log("仅检查，未写入。");
  process.exit(0);
}
fs.writeFileSync(target, lines.join("\n"), "utf8");
console.log("已写入 " + target);

execFileSync("npx", ["esbuild", "scripts/entry.ts", "--bundle", "--format=esm", "--platform=node", "--outfile=.tmp/engine.mjs"], { stdio: "inherit", shell: true });
const mod = await import("../.tmp/engine.mjs?" + Date.now());
console.log("当前事件总数：" + mod.EVENTS.length);
const ids = new Set();
for (const ev of mod.EVENTS) {
  if (ids.has(ev.id)) { console.error("编号重复：" + ev.id); process.exit(1); }
  ids.add(ev.id);
}
if (doCommit) {
  execFileSync("git", ["add", "-A"], { stdio: "inherit" });
  execFileSync("git", ["commit", "-m", "feat(events): 从事件编辑器导入 " + events.length + " 条事件"], { stdio: "inherit" });
  execFileSync("git", ["push"], { stdio: "inherit" });
}
console.log("完成。");