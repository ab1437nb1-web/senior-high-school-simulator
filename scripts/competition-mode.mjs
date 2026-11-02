import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
function run(realMode) {
  let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 424242, "normal", true, "m", "x", { col: 2, row: 2 }, realMode);
  for (let i = 0; i < 9; i++) s = settleWeek(s, p.build(s.choice)).state;
  s.competition = { subject: "physics", progress: 0, weeks: 0, since: s.week };
  const plan = p.build(s.choice);
  plan.evening = plan.evening.map((x) => (x && x.a === "study" ? { ...x, s: "physics" } : x));
  for (let i = 0; i < 4; i++) s = settleWeek(s, plan).state;
  return { progress: s.competition.progress, mastery: s.units["physics:0"] ? undefined : undefined };
}
const a = run(false), b = run(true);
console.log("普通模式 4 周进度:", a.progress.toFixed(1));
console.log("真实模式 4 周进度:", b.progress.toFixed(1));
