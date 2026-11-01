import { newGame, planWeekEvents, applyEventChoice, mulberry32 } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 9, "normal", true, "m", "x", { col: 2, row: 2 });
s.week = 10;
s.socialTarget = "linxiaoman";
s.npcs.find((n) => n.id === "linxiaoman").relation = 40;
for (let k = 1; k <= 4; k++) {
  const evs = planWeekEvents(s, 5, mulberry32(k), p.build(s.choice));
  const chain = evs.find((e) => e.chainNpc);
  console.log("第" + k + "次:", chain ? chain.id + " 「" + chain.title + "」选项 " + chain.choices.length : "无链事件");
  if (chain) {
    s = applyEventChoice(s, chain, chain.choices[0]);
    console.log("  进度 ->", s.chains["linxiaoman"], "| flags:", s.flags["chain:linxiaoman"]);
    s.week += 3;
  }
}
