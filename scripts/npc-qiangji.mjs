import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 7, "normal", true, "m", "x", { col: 2, row: 2 });
for (let i = 0; i < 125; i++) s = settleWeek(s, p.build(s.choice)).state;
const list = s.npcs.filter((n) => n.qiangji).map((n) => NPC_MAP[n.id].name + "(" + n.qiangji.subject + "/" + n.qiangji.level + ")");
console.log("强基意向:", list.join(" ") || "无");
console.log("相关新闻:", (s.npcNews || []).filter((n) => n.text.includes("强基")).slice(-3).map((n) => n.text).join(" / ") || "无");
