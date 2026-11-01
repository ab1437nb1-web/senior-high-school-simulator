import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "social");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 33, "normal", true, "m", "x", { col: 2, row: 2 });
s.socialTarget = "linxiaoman";
for (let i = 0; i < 12; i++) s = settleWeek(s, p.build(s.choice)).state;
const g = s.npcs.find((n) => n.id === "linxiaoman");
console.log("主动社交 12 周后 林小满:", g.relation.toFixed(0), "| 新闻:", (s.npcNews || []).slice(-3).map((n) => n.text).join(" / "));
