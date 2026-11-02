import { newGame, planWeekEvents, applyEventChoice, mulberry32 } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 5, "normal", true, "m", "x", { col: 2, row: 2 });
s.stage = 5; s.weekInStage = 4; s.week = 60;
s.competition = { subject: "physics", progress: 0, weeks: 0, since: 50, sessions: 60, zBonus: 0 };
let ev = null;
for (let k = 0; k < 60 && !ev; k++) ev = planWeekEvents(s, 4, mulberry32(k + 1), p.build(s.choice)).find((e) => e.id === "comp-quit");
console.log("退出事件:", ev ? "出现" : "未出现");
if (ev) {
  const after = applyEventChoice(s, ev, ev.choices[2]);
  console.log("选择退出后 competition:", after.competition || "已退出");
}
