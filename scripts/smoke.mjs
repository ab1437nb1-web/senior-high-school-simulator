import { newGame, settleWeek, buildReport, templateNarrative, fiveEdu } from "../.tmp/engine.mjs";
import { PRESETS, TOTAL_WEEKS, SUBJECT_MAP } from "../.tmp/engine.mjs";

const seed = Number(process.argv[2] || 20261031);
const presetId = process.argv[3] || "science";
let state = newGame({ first: "physics", second: ["chemistry", "geography"] }, seed);
const preset = PRESETS.find((p) => p.id === presetId);

for (let i = 0; i < TOTAL_WEEKS; i++) {
  const plan = preset.build(state.choice);
  const res = settleWeek(state, plan);
  state = res.state;
  buildReport(res.report, state);
  if (res.report.exam) {
    const e = res.report.exam;
    console.log("W" + String(i + 1) + " EXAM " + e.kind + " total=" + e.total + " rank=" + e.classRank + " pct=" + e.percentile);
  }
}
const avg = Object.keys(state.units).reduce((a, k) => a + state.units[k].mastery, 0) / Object.keys(state.units).length;
console.log("avg mastery", Math.round(avg));
for (const s of ["math", "physics", "chemistry", "geography", "chinese"]) {
  console.log(s, Math.round(state.units[s + ":0"].mastery), Math.round(state.units[s + ":1"].mastery), Math.round(state.units[s + ":2"].mastery), Math.round(state.units[s + ":3"].mastery));
}
console.log("stats", JSON.stringify(state.stats), "edu", JSON.stringify(fiveEdu(state)));
