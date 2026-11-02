import { newGame } from "../.tmp/engine.mjs";
import { NPC_MAP } from "../.tmp/engine.mjs";
let counts = [], fixed = 0;
for (let seed = 1; seed <= 20; seed++) {
  const s = newGame({ first: "physics", second: ["chemistry", "biology"] }, seed, "normal", true, "m", "x", { col: 2, row: 2 });
  const list = s.npcs.filter((n) => n.competition).map((n) => NPC_MAP[n.id].name + "(" + n.competition.subject + ")");
  counts.push(list.length);
  if (!list.some((x) => x.startsWith("周予安"))) fixed++;
}
console.log("每局参竞人数:", counts.join(","));
console.log("周予安缺席次数:", fixed);
