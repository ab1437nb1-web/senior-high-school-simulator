import { newGame, planWeekEvents, mulberry32 } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
const choice = { first: "physics", second: ["chemistry", "geography"] };
let hit = 0, total = 0;
for (let seed = 1; seed <= 40; seed++) {
  const s = newGame(choice, seed, "normal", true, "f", "x", { col: 2, row: 2 });
  for (const wk of [1, 2, 3]) {
    const s2 = { ...s, weekInStage: wk, week: wk };
    const evs = planWeekEvents(s2, wk, mulberry32(seed * 31 + wk), p.build(choice));
    total++;
    if (evs.some((e) => e.id === "resit")) hit++;
  }
}
console.log("换座位出现率:", Math.round((hit / total) * 100) + "%", "(" + hit + "/" + total + ")");
