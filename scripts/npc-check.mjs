import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 3, "normal");
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < 4; i++) {
  const res = settleWeek(s, p.build(s.choice));
  s = res.state;
  console.log("w" + (i + 1), "npc:", res.report.npc ? res.report.npc.text : "-");
}
console.log(s.npcs.map((n) => n.id + " g=" + Math.round(n.grade) + " s=" + Math.round(n.stress) + " r=" + Math.round(n.relation)).join(" | "));
