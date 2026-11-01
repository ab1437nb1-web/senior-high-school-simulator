import { newGame, settleWeek, planWeekEvents, mulberry32, applyEventChoice, stageDef } from "../.tmp/engine.mjs";
import { PRESETS, STAGES, TOTAL_WEEKS } from "../.tmp/engine.mjs";

const presetId = process.argv[2] || "balanced";
const difficulty = process.argv[3] || "normal";
const choice = { first: "physics", second: ["chemistry", "geography"] };
let s = newGame(choice, 424242, difficulty);
const preset = PRESETS.find((p) => p.id === presetId);
let lastStage = 1;

for (let i = 0; i < TOTAL_WEEKS; i++) {
  const plan = preset.build(s.choice);
  const evs = planWeekEvents(s, s.weekInStage, mulberry32(424242 + i), plan);
  for (const e of evs) s = applyEventChoice(s, e, e.choices[0]);
  const res = settleWeek(s, plan);
  s = res.state;
  if (res.report.exam) {
    const e = res.report.exam;
    console.log(stageDef(s.stage).name, "w" + (s.weekInStage - 1), e.kind, e.total, "rank", e.classRank);
  }
  if (s.stage !== lastStage) { console.log("--> stage", s.stage, stageDef(s.stage).name); lastStage = s.stage; }
}
const avg = Object.keys(s.units).reduce((a, k) => a + s.units[k].mastery, 0) / Object.keys(s.units).length;
console.log("avg mastery", Math.round(avg), "stats", JSON.stringify(s.stats), "ended", s.ended);
