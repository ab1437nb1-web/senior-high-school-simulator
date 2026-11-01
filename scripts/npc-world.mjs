import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 11, "normal", true, "m", "x", { col: 2, row: 2 });
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < 100; i++) s = settleWeek(s, p.build(s.choice)).state;
console.log("news:", (s.npcNews || []).length);
console.log((s.npcNews || []).slice(-8).map((n) => "W" + n.week + " " + n.text).join("\n"));
const vals = Object.values(s.npcPairs || {}); console.log("pairs max", Math.max(...vals).toFixed(0), "avg", (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(0));
console.log("couples:", (s.npcCouples || []).map(([a, b]) => a + "+" + b).join(", ") || "none");