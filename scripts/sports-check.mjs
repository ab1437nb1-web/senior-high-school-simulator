import { newGame, planWeekEvents, mulberry32 } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
const choice = { first: "physics", second: ["chemistry", "geography"] };
for (const st of [1, 3, 5, 7, 9]) {
  const s = newGame(choice, 1, "normal");
  s.stage = st;
  const hits = [];
  for (let w = 1; w <= 12; w++) {
    s.weekInStage = w;
    const evs = planWeekEvents(s, w, mulberry32(w), p.build(choice));
    if (evs.some((e) => e.id === "sports")) hits.push(w);
  }
  console.log("stage", st, "sports weeks:", hits.join(",") || "-");
}
