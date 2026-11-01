import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 3, "normal", true, "f", "x", { col: 2, row: 2 });
const p = PRESETS.find((x) => x.id === "social");
const target = "linxiaoman";
s.socialTarget = target;
s.socialTarget2 = "zhouyuan";
for (let i = 0; i < 6; i++) {
  const before = s.npcs.find((n) => n.id === target).relation;
  const res = settleWeek(s, p.build(s.choice));
  s = res.state;
  const after = s.npcs.find((n) => n.id === target).relation;
  console.log("w" + (i + 1), "林小满", before.toFixed(1), "->", after.toFixed(1), "| deskmate stat", s.relations.deskmate);
}
