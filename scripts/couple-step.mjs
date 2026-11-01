import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 77, "normal", true, "m", "x", { col: 2, row: 2 });
let prev = [];
for (let i = 0; i < 100; i++) {
  s = settleWeek(s, p.build(s.choice)).state;
  const now = s.npcCouples || [];
  if (now.length !== prev.length || JSON.stringify(now) !== JSON.stringify(prev)) {
    console.log("W" + s.week, JSON.stringify(now));
    prev = JSON.parse(JSON.stringify(now));
  }
}
