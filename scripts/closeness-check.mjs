import { newGame, settleWeek, applyEventChoice } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 77, "normal", true, "m", "x", { col: 2, row: 2 });
for (let i = 0; i < 100; i++) s = settleWeek(s, p.build(s.choice)).state;
const news = s.npcNews || [];
const together = news.filter((n) => n.text.includes("在一起")).length;
const broke = news.filter((n) => n.text.includes("分开")).length;
const fight = news.filter((n) => n.text.includes("闹别扭")).length;
console.log("100 周：在一起", together, "次，分开", broke, "次，闹别扭", fight, "次");
console.log("当前情侣:", (s.npcCouples || []).length, "对");

// 事件放大：同一事件在 40 与 90 关系下的差异
const ev = { id: "t", kind: "npc", social: true, title: "t", text: "", choices: [
  { text: "冷淡", result: "", effects: { relation: [{ who: "deskmate", amount: -6 }] } },
] };
for (const rel of [40, 90]) {
  const st = JSON.parse(JSON.stringify(s));
  st.socialTarget = "linxiaoman";
  st.npcs.find((n) => n.id === "linxiaoman").relation = rel;
  const after = applyEventChoice(st, ev, ev.choices[0]);
  console.log("关系", rel, "-> ", after.npcs.find((n) => n.id === "linxiaoman").relation.toFixed(1));
}
