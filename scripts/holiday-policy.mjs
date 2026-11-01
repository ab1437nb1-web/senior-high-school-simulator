import { newGame, settleWeek, stageDef } from "../.tmp/engine.mjs";
import { PRESETS, TOTAL_WEEKS } from "../.tmp/engine.mjs";

function run(termPreset, holidayPreset) {
  const tp = PRESETS.find((p) => p.id === termPreset);
  const hp = PRESETS.find((p) => p.id === holidayPreset);
  let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 21, "normal");
  const evals = [];
  for (let i = 0; i < TOTAL_WEEKS && !s.ended; i++) {
    const plan = (stageDef(s.stage).kind === "holiday" ? hp : tp).build(s.choice);
    s = settleWeek(s, plan).state;
    if (s.evaluations.length > evals.length) evals.push(s.evaluations[s.evaluations.length - 1].score);
  }
  const gaokao = s.exams.filter((e) => e.kind === "gaokao")[0];
  return { evals, gaokao: gaokao ? gaokao.total : 0, failed: s.failed };
}

for (const [t, h] of [["six", "six"], ["six", "practice"], ["six", "social"], ["six", "relax"], ["practice", "practice"]]) {
  const r = run(t, h);
  console.log((t + "+" + h).padEnd(20), "evals:", r.evals.join(" "), "| 高考", r.gaokao, r.failed ? "FAILED" : "");
}
