import { newGame, settleWeek, planWeekEvents, mulberry32, applyEventChoice } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 5, "normal");
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < 140 && !s.ended; i++) {
  const plan = p.build(s.choice);
  s = settleWeek(s, plan).state;
  if (s.evaluations.length) {
    const e = s.evaluations[s.evaluations.length - 1];
    console.log("eval@" + e.stageName, e.score, e.passed ? "PASS" : "FAIL");
  }
}
console.log("ended", s.ended, "failed", s.failed, "stage", s.stage, "evals", s.evaluations.length);
