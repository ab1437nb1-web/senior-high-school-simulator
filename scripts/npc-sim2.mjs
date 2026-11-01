import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 3, "normal");
const p = PRESETS.find((x) => x.id === "six");
const t0 = Date.now();
for (let i = 0; i < 18; i++) {
  const res = settleWeek(s, p.build(s.choice));
  s = res.state;
  if (i < 3) console.log("w" + (i + 1), res.report.npc ? res.report.npc.text : "-");
}
console.log("18 weeks in", Date.now() - t0, "ms");
for (const n of s.npcs) {
  const g = n.game;
  const e = g.exams[g.exams.length - 1];
  console.log(n.id, "rel", Math.round(n.relation), "grade", e ? e.total : "-", "stress", Math.round(g.stats.stress), "stage", g.stage);
}
