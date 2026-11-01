import { newGame, planWeekEvents, applyEventChoice, mulberry32, romanceScene, canConfess } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 9, "normal", true, "m", "x", { col: 2, row: 2 });
s.socialTarget = "linxiaoman";
s.npcs.find((n) => n.id === "linxiaoman").relation = 80;
s.beyond = { linxiaoman: 100 };
s.chains = { linxiaoman: 7 };
console.log("可表白:", canConfess(s, "linxiaoman"));
let ev = null;
for (let k = 0; k < 30 && !ev; k++) ev = planWeekEvents(s, 5, mulberry32(k + 1), p.build(s.choice)).find((e) => e.chainNpc);
console.log("链事件:", ev ? ev.id + " / " + ev.title : "无");
if (ev) {
  const after = applyEventChoice(s, ev, ev.choices[0]);
  console.log("接受后 romance:", after.romance && after.romance.npcId, "| chain:", after.chains["linxiaoman"]);
}
const b = romanceScene(s, "linxiaoman", "b");
console.log("玩家主动场景:", b ? b.title : "无");
