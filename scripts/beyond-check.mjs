import { newGame, planWeekEvents, applyEventChoice, mulberry32, canConfess, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 9, "normal", true, "m", "x", { col: 2, row: 2 });
s.socialTarget = "linxiaoman";
const get = () => s.npcs.find((n) => n.id === "linxiaoman");
const setRel = (v) => { get().relation = v; };
setRel(65);
console.log("起点 关系", get().relation, "beyond", s.beyond["linxiaoman"], "可表白", canConfess(s, "linxiaoman"));

let ev = null;
for (let k = 0; k < 40 && !ev; k++) ev = planWeekEvents(s, 5, mulberry32(k + 1), p.build(s.choice)).find((e) => e.chainNpc);
console.log("链事件:", ev ? ev.id + " (" + ev.chainStage + ")" : "无");
s = applyEventChoice(s, ev, ev.choices[0]);
console.log("完成后 beyond:", s.beyond["linxiaoman"], "关系", get().relation.toFixed(1));

setRel(74);
for (let i = 0; i < 6; i++) s = settleWeek(s, p.build(s.choice)).state;
console.log("社交 6 周后关系:", get().relation.toFixed(1), "(≤75 才正确)");

s.beyond["linxiaoman"] = 100;
setRel(76);
console.log("beyond 满、关系 76 可表白:", canConfess(s, "linxiaoman"));
