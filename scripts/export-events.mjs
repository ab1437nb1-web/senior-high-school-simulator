import fs from "node:fs";
import { EVENTS, SUBJECT_MAP } from "../.tmp/engine.mjs";

const GROUP_CN = { main: "主线", daily: "日常", social: "社交", friend: "朋友", crush: "暧昧", love: "恋爱" };
const SUBJ_CN = Object.fromEntries(Object.values(SUBJECT_MAP).map((s) => [s.id, s.name]));
const DIM_CN = { moral: "品德", academic: "学业", health: "健康", art: "艺术", labor: "劳动" };
const WHO_CN = { deskmate: "关系", teacher: "关系", mother: "关系" };

function effectsText(e) {
  if (!e) return "无";
  const out = [];
  const st = e.stats || {};
  for (const k of ["energy", "stress", "mood", "health"]) {
    if (typeof st[k] === "number") out.push({ energy: "精力", stress: "压力", mood: "心情", health: "健康" }[k] + (st[k] >= 0 ? "+" : "") + st[k]);
  }
  for (const m of e.mastery || []) out.push("掌握:" + (SUBJ_CN[m.subject] || m.subject) + (m.amount >= 0 ? "+" : "") + m.amount);
  for (const r of e.relation || []) out.push("关系" + (r.amount >= 0 ? "+" : "") + r.amount);
  const evs = Array.isArray(e.evidence) ? e.evidence : e.evidence ? [e.evidence] : [];
  for (const ev of evs) {
    const v = typeof ev.value === "number" && ev.value !== 1 ? ":" + ev.value : "";
    out.push("证据:" + (DIM_CN[ev.dim] || ev.dim) + ":" + ev.label + v);
  }
  if (e.resit) out.push("换座位");
  if (e.romance) out.push("恋爱");
  if (e.breakup) out.push("分手");
  if (e.choice) out.push("文理:" + e.choice.first + ":" + (e.choice.second || []).join(","));
  return out.length ? out.join(", ") : "无";
}

function requiresText(r) {
  if (!r) return "无";
  const out = [];
  if (r.romance) out.push("恋爱中");
  if (r.noRomance) out.push("单身");
  if (r.friend) out.push("朋友");
  if (typeof r.minRelation === "number") out.push("关系≥" + r.minRelation);
  if (typeof r.bonusCount === "number") out.push("暧昧≥" + r.bonusCount);
  if (typeof r.minStress === "number") out.push("压力≥" + r.minStress);
  if (typeof r.lowRelWeeks === "number") out.push("低关系≥" + r.lowRelWeeks);
  if (r.masteryBelow) out.push("掌握:" + (SUBJ_CN[r.masteryBelow.subject] || r.masteryBelow.subject) + "<" + r.masteryBelow.value);
  if (r.actions && r.actions.length) out.push("当周有:" + r.actions.join("/"));
  return out.length ? out.join(", ") : "无";
}

const lines = [];
for (const ev of EVENTS) {
  lines.push("## 事件：" + ev.title);
  lines.push("- 编号: " + ev.id);
  lines.push("- 分类: " + (GROUP_CN[ev.group] || "日常"));
  lines.push("- 周次: " + (ev.weeks ? ev.weeks[0] + "-" + ev.weeks[1] : "全学期"));
  if (ev.stages) lines.push("- 阶段: " + ev.stages.join(","));
  if (ev.cooldown) lines.push("- 冷却: " + ev.cooldown);
  lines.push("- 触发: " + requiresText(ev.requires));
  lines.push("- 文本: " + ev.text.replace(/\n/g, " "));
  lines.push("- 权重: " + (ev.weight || 1));
  lines.push("");
  (ev.choices || []).forEach((c, i) => {
    lines.push("### 选项 " + (i + 1));
    lines.push("- 文本: " + (c.text || ""));
    lines.push("- 结果: " + (c.result || ""));
    lines.push("- 效果: " + effectsText(c.effects));
    lines.push("");
  });
}
fs.writeFileSync(".tmp/catalog.md", lines.join("\n"), "utf8");
console.log("catalog lines:", lines.length);