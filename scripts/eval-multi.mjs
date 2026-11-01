import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS, TOTAL_WEEKS } from "../.tmp/engine.mjs";
for (const id of ["six", "balanced", "social", "practice", "relax"]) {
  const p = PRESETS.find((x) => x.id === id);
  let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 11, "normal");
  const scores = [];
  for (let i = 0; i < TOTAL_WEEKS && !s.ended; i++) {
    s = settleWeek(s, p.build(s.choice)).state;
    if (s.evaluations.length > scores.length) scores.push(s.evaluations[s.evaluations.length - 1].score);
  }
  console.log(id.padEnd(9), scores.join(" "), s.failed ? "FAILED@" + (s.evaluations.length) : "ok");
}
