import { newGame, settleWeek, stageDef } from "../.tmp/engine.mjs";
import { PRESETS, TOTAL_WEEKS } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 3, "normal");
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < TOTAL_WEEKS && !s.ended; i++) {
  s = settleWeek(s, p.build(s.choice)).state;
}
const myLast = s.exams.filter((e) => e.kind === "gaokao")[0];
console.log("player 高考:", myLast ? myLast.total : "-");
for (const n of s.npcs) {
  const g = n.game;
  const e = g.exams.filter((x) => x.kind === "gaokao")[0] || g.exams[g.exams.length - 1];
  console.log(n.id.padEnd(11), "last", e ? e.total : "-", "stage", g.stage, "stress", Math.round(g.stats.stress));
}
