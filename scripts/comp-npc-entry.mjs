import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let counts = [], fixed = 0;
for (let seed = 1; seed <= 20; seed++) {
  let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, seed, "normal", true, "m", "x", { col: 2, row: 2 });
  for (let i = 0; i < 10; i++) s = settleWeek(s, p.build(s.choice)).state;
  const list = s.npcs.filter((n) => n.competition).map((n) => NPC_MAP[n.id].name);
  counts.push(list.length);
  if (!list.some((x) => x.startsWith("周予安"))) fixed++;
}
console.log("通过门槛后的参竞人数:", counts.join(","));
console.log("周予安缺席次数:", fixed);
