import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 2, "normal", true, "m", "x", { col: 2, row: 2 });
console.log("初始:", s.npcs.filter((n) => n.kind === "classmate").map((n) => n.id + "=" + n.relation).join(" "));
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < 40; i++) s = settleWeek(s, p.build(s.choice)).state;
console.log("40 周后:", s.npcs.filter((n) => n.kind === "classmate").map((n) => n.id + "=" + n.relation.toFixed(1)).join(" "));
