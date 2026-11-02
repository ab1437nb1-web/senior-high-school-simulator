import { newGame, planWeekEvents, applyEventChoice, mulberry32, competitionProgress } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 3, "normal", true, "m", "x", { col: 2, row: 2 });
s.stage = 3; s.weekInStage = 5; s.week = 40;
s.competition = { subject: "math", progress: 0, weeks: 0, since: 30, sessions: 40, zBonus: 0 };
s.competition.progress = competitionProgress(40, false, 0);
console.log("初始进度", s.competition.progress.toFixed(0));
let ev = null;
for (let k = 0; k < 40 && !ev; k++) ev = planWeekEvents(s, 5, mulberry32(k + 1), p.build(s.choice)).find((e) => e.id === "comp-math-extra");
console.log("事件出现:", ev ? ev.title : "否");
if (ev) {
  const after = applyEventChoice(s, ev, ev.choices[0]);
  console.log("选择后进度", after.competition.progress.toFixed(0), "| zBonus", (after.competition.zBonus || 0).toFixed(3));
}
