import { newGame, planWeekEvents, mulberry32 } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const choice = { first: "physics", second: ["chemistry", "geography"] };
const p = PRESETS.find((x) => x.id === "social");
let s = newGame(choice, 9, "normal", true, "m", "x", { col: 2, row: 2 });
s.socialTarget = "linxiaoman";
s.npcs.find((n) => n.id === "linxiaoman").friend = true;
s.npcs.find((n) => n.id === "linxiaoman").relation = 70;
let hit = 0;
for (let i = 0; i < 60; i++) {
  const evs = planWeekEvents(s, 5, mulberry32(i + 1), p.build(choice));
  if (evs.some((e) => e.group === "friend")) hit++;
}
console.log("朋友事件出现:", hit + "/60");
