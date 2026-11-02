import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
function run(realMode, weeks) {
  let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 424242, "normal", true, "m", "x", { col: 2, row: 2 }, realMode);
  for (let i = 0; i < 9; i++) s = settleWeek(s, p.build(s.choice)).state;
  s.competition = { subject: "physics", progress: 0, weeks: 0, since: s.week };
  const plan = p.build(s.choice);
  plan.evening = plan.evening.map((x) => (x && x.a === "study" ? { ...x, s: "physics" } : x));
  for (let i = 0; i < weeks; i++) s = settleWeek(s, plan).state;
  return s.competition.progress;
}
for (const w of [4, 8, 16]) {
  console.log(w + " 周：普通 " + run(false, w).toFixed(0) + " / 真实 " + run(true, w).toFixed(0));
}
