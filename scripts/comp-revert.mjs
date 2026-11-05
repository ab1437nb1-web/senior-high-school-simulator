import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
function run(active) {
  let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 9, "normal", true, "m", "x", { col: 2, row: 2 });
  s.competition = { subject: "physics", progress: 0, weeks: 0, since: 1, sessions: 50, zBonus: 0, active, history: [] };
  const plan = p.build(s.choice);
  plan.evening = plan.evening.map((x) => (x && x.a === "study" ? { ...x, s: "physics" } : x));
  for (let i = 0; i < 2; i++) s = settleWeek(s, plan).state;
  return s.competition.sessions;
}
console.log("竞赛进行中，2 周后训练次数:", run(true), "（应增长）");
console.log("判定结束后，2 周后训练次数:", run(false), "（应不变）");
