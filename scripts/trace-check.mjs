import { newGame, weekdayTrace, weekendTrace } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 1, "normal", true, "m", "x", { col: 2, row: 2 });
const p = PRESETS.find((x) => x.id === "six").build(s.choice);
console.log("周一:", weekdayTrace(s, p, 0).map((t) => t.time + ":" + t.place).join(" → "));
console.log("周六上午:", weekendTrace(p, 0).map((t) => t.time + ":" + t.place).join(" → "));
console.log("周六晚(休息):", weekendTrace(p, 2).map((t) => t.time + ":" + t.place).join(" → "));
s.stage = 2;
console.log("寒假上午:", weekdayTrace(s, p, 0).map((t) => t.time + ":" + t.place).join(" → "));
