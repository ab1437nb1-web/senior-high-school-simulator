import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let bad = 0, exams = 0;
for (let seed = 1; seed <= 12; seed++) {
  let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, seed, "normal", true, "m", "x", { col: 2, row: 2 });
  for (let i = 0; i < 30; i++) s = settleWeek(s, p.build(s.choice)).state;
  for (const r of s.classRanking || []) { exams++; if (!Number.isFinite(r.total)) bad++; }
  const ranks = new Set((s.classRanking || []).map((r) => r.rank));
  if (ranks.size !== 48) console.log("rank collision", seed);
}
console.log("checked", exams, "rows, non-finite:", bad);
