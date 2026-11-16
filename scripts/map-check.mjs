import { newGame, campusMap, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = (s) => PRESETS.find((x) => x.id === "six").build(s.choice);
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 2, "normal", true, "m", "x", { col: 2, row: 2 });
s.lastPlan = p(s);
for (let i = 0; i < 6; i++) { s = settleWeek(s, p(s)).state; s.lastPlan = p(s); }
for (const r of campusMap(s, "weekday")) console.log(r.label, "| 你:", r.you ? "是" : "否", "|", r.people.join("、") || "没有人");
