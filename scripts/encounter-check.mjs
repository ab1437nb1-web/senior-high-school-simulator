import { newGame, weekdayTrace, weekendTrace, planWeekEvents, mulberry32, encounterOf } from "../.tmp/engine.mjs";
import { PRESETS, placeLabel, NPC_MAP } from "../.tmp/engine.mjs";
const p = (s) => PRESETS.find((x) => x.id === "six").build(s.choice);
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 3, "normal", true, "m", "x", { col: 2, row: 2 });
const show = (l) => l.map((t) => t.time + ":" + placeLabel(t.place)).join(" → ");
console.log("周五:", show(weekdayTrace(s, p(s), 4)));
console.log("周日晚:", show(weekendTrace(p(s), 5, "you", "m")));
let hit = 0;
for (let k = 0; k < 30; k++) {
  const evs = planWeekEvents(s, 3, mulberry32(k + 1), p(s));
  const ev = evs.find((e) => e.id.startsWith("encounter-"));
  if (ev) { hit++; if (hit === 1) console.log("偶遇:", ev.text.replace("{npc}", NPC_MAP[ev.npcId].name), "| 选项", ev.choices.map((c) => c.text).join("/")); }
}
console.log("30 周里出现偶遇:", hit, "次");
