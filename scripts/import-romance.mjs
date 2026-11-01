import fs from "node:fs";

const md = fs.readFileSync("恋爱线-NPC专属事件链.md", "utf8");
const blocks = md.split(/^## 事件 /m).slice(1);
const out = [];
const errs = [];
for (const block of blocks) {
  const head = block.split("\n")[0];
  const m = head.match(/^(\d+)：(.+?)(?:（(.+?)）)?$/);
  if (!m) { errs.push("标题解析失败: " + head); continue; }
  const idx = Number(m[1]);
  const title = m[2].trim();
  const stage = (m[3] || "").trim();
  const idM = block.match(/^- 编号: (rom-[a-z]+-\d+)$/m);
  if (!idM) { errs.push("缺编号: " + title); continue; }
  const id = idM[1];
  const npc = id.split("-")[1];
  const preM = block.match(/^- 前置: (.+)$/m);
  const pre = preM ? preM[1].trim() : "";
  const bodyStart = block.indexOf("\n", block.indexOf("- 前置:"));
  const optIdx = block.indexOf("**选项**");
  const body = block.slice(bodyStart, optIdx).trim().replace(/\n{2,}/g, "\n\n");
  const choices = [];
  for (const line of block.slice(optIdx).split("\n")) {
    const c = line.match(/^\d+\.\s*(.+)$/);
    if (!c) continue;
    const raw = c[1].trim();
    const arrow = raw.split(/→/);
    const text = (arrow[0] || raw).replace(/[「」]/g, "").trim();
    const result = (arrow[1] || "").trim();
    choices.push({ text, result });
  }
  if (choices.length < 1) errs.push("无选项: " + id);
  out.push({ id, npc, idx, stage, title, text: body, pre, choices });
}
out.sort((a, b) => (a.npc < b.npc ? -1 : a.npc > b.npc ? 1 : a.idx - b.idx));
fs.writeFileSync("src/sim/romance.json", JSON.stringify(out, null, 1), "utf8");
console.log("解析事件:", out.length, "错误:", errs.length);
if (errs.length) console.log(errs.slice(0, 5).join("\n"));
const byNpc = {};
for (const e of out) byNpc[e.npc] = (byNpc[e.npc] || 0) + 1;
console.log("每人事件数:", JSON.stringify(byNpc));
console.log("首条:", JSON.stringify(out[0]).slice(0, 200));
