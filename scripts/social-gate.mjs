import { newGame, planWeekEvents, mulberry32 } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = (s) => PRESETS.find((x) => x.id === "six").build(s.choice);
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 4, "normal", true, "m", "x", { col: 2, row: 2 });
let social = 0, tagged = 0, untagged = 0;
for (let k = 0; k < 40; k++) {
  const evs = planWeekEvents(s, 3, mulberry32(k + 7), p(s));
  for (const e of evs) {
    const isS = e.social === true || ["social", "friend", "crush", "love"].includes(e.group || "");
    if (!isS) continue;
    social++;
    if (e.npcId) tagged++; else { untagged++; console.log("漏标:", e.id, e.group); }
  }
}
console.log("社交事件总数:", social, "| 带 npcId:", tagged, "| 无 npcId:", untagged);
