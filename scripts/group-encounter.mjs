import { newGame, planWeekEvents, mulberry32, applyEventChoice } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = (s) => PRESETS.find((x) => x.id === "six").build(s.choice);
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 5, "normal", true, "m", "x", { col: 2, row: 2 });
let groups = 0, singles = 0, sample = null;
for (let k = 0; k < 40; k++) {
  const evs = planWeekEvents(s, 3, mulberry32(k + 3), p(s));
  const ev = evs.find((e) => e.id.startsWith("encounter-"));
  if (!ev) continue;
  if (ev.id.startsWith("encounter-group")) { groups++; if (!sample) sample = ev; } else singles++;
}
console.log("群体偶遇:", groups, "| 单独偶遇:", singles);
if (sample) {
  console.log("样例:", sample.text);
  const before = s.npcs.filter((n) => sample.choices[0].effects.relationAll.ids.includes(n.id)).map((n) => n.relation.toFixed(0));
  const after = applyEventChoice(s, sample, sample.choices[0]);
  const now = after.npcs.filter((n) => sample.choices[0].effects.relationAll.ids.includes(n.id)).map((n) => n.relation.toFixed(0));
  console.log("关系 前:", before.join(","), "后:", now.join(","));
}
