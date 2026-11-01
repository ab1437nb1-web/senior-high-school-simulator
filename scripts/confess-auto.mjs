import { newGame, settleWeek, planWeekEvents, applyEventChoice, mulberry32 } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 3, "normal", true, "m", "x", { col: 2, row: 2 });
s.week = 20;
s.socialTarget = "linxiaoman";
s.npcs.find((n) => n.id === "linxiaoman").relation = 92;
s.romanceBonus = [{ amount: 2.5, week: 18 }, { amount: 2.5, week: 19 }];

const evs = planWeekEvents(s, 5, mulberry32(1), p.build(s.choice));
console.log("1) 对方先开口排在第一位:", evs[0] && evs[0].id === "confess-them");
const settled = settleWeek(s, p.build(s.choice)).state;
console.log("2) 未做选择前不确立关系:", settled.romance ? "FAIL" : "OK");
const accepted = applyEventChoice(s, evs[0], evs[0].choices[0]);
console.log("3) 选择接受后确立关系:", accepted.romance && accepted.romance.npcId === "linxiaoman" ? "OK" : "FAIL");
const declined = applyEventChoice(s, evs[0], evs[0].choices[1]);
console.log("4) 选择婉拒后仍是单身:", declined.romance ? "FAIL" : "OK");
