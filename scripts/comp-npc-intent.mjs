import { newGame, settleWeek, competitionEligibility } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let total = 0, pass = 0;
for (let seed = 1; seed <= 8; seed++) {
  let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, seed, "normal", true, "m", "x", { col: 2, row: 2 });
  for (let i = 0; i < 10; i++) s = settleWeek(s, p.build(s.choice)).state;
  for (const n of s.npcs.filter((n) => n.compIntent && n.id !== "zhouyuan")) {
    total++;
    const ok = competitionEligibility(n.game);
    if (ok.includes(n.compIntent)) pass++;
    if (ok.length) console.log(NPC_MAP[n.id].name, "想报", n.compIntent, "可报", ok.join(","));
  }
}
console.log("非周予安意向生:", total, "其中过线:", pass);
