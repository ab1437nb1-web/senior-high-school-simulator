import { newGame, planWeekEvents, mulberry32, applyEventChoice, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const choice = { first: "physics", second: ["chemistry", "geography"] };
let s = newGame(choice, 7, "normal", true, "m", "x", { col: 2, row: 2 });
s.week = 20;
s.socialTarget = "linxiaoman";
const girl = s.npcs.find((n) => n.id === "linxiaoman");
girl.relation = 92;
s.romanceBonus = [{ amount: 2.5, week: 18 }, { amount: 2.5, week: 19 }];
let hit = 0, ev = null;
for (let i = 0; i < 80; i++) {
  const evs = planWeekEvents(s, 5, mulberry32(i + 1), PRESETS.find((p) => p.id === "six").build(choice));
  const found = evs.find((e) => e.id === "confess-them");
  if (found) { hit++; if (!ev) ev = found; }
}
console.log("主动表白出现次数:", hit + "/80");
const after = applyEventChoice(s, ev, ev.choices[0]);
console.log("接受后 romance:", after.romance && after.romance.npcId, "关系", after.npcs.find((n) => n.id === "linxiaoman").relation);

// 分手：连续 4 周关系 <70
let b = JSON.parse(JSON.stringify(s));
b.romance = { npcId: "linxiaoman", since: 10, chance: 1 };
b.npcs.find((n) => n.id === "linxiaoman").relation = 60;
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < 4; i++) b = settleWeek(b, p.build(choice)).state;
console.log("低关系周数:", b.flags.lowRelWeeks, "romance:", !!b.romance);
let hit2 = 0, de = null;
for (let i = 0; i < 80; i++) {
  const evs2 = planWeekEvents(b, 5, mulberry32(i + 1), p.build(choice));
  const found = evs2.find((e) => e.id === "love-drift");
  if (found) { hit2++; if (!de) de = found; }
}
console.log("分手事件出现次数:", hit2 + "/80");
const afterBreak = applyEventChoice(b, de, de.choices[2]);
console.log("选择分手后 romance:", afterBreak.romance || "none");