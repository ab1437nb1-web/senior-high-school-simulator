import { newGame, settleWeek, planWeekEvents, applyEventChoice, mulberry32, reshuffleBeforePlayer, reshuffleAfterPlayer, seatOf } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 8, "normal", true, "m", "x", { col: 2, row: 2 });
for (let i = 0; i < 10; i++) s = settleWeek(s, p.build(s.choice)).state;
console.log("周次", s.weekInStage, "考试数", s.exams.length, "玩家排名", (s.classRanking || []).find((r) => r.id === "you")?.rank);
let ev = null, hit = 0;
for (let k = 0; k < 60 && !ev; k++) {
  const e2 = planWeekEvents(s, s.weekInStage, mulberry32(k + 1), p.build(s.choice));
  if (e2.some((e) => e.id === "resit")) { hit++; ev = e2.find((e) => e.id === "resit"); }
}
console.log("换座位出现（60 次尝试中）:", hit > 0 ? "是" : "否");
if (!ev) process.exit(0);
let g = applyEventChoice(s, ev, ev.choices[0]);
g = reshuffleBeforePlayer(JSON.parse(JSON.stringify(g)), mulberry32(11));
const taken = new Set(Object.entries(g.seats).map(([id, pos]) => pos.col + "-" + pos.row));
console.log("玩家选座前已占:", taken.size);
let pick = null;
for (let r = 1; r <= 6 && !pick; r++) for (let c = 1; c <= 6; c++) if (!taken.has(c + "-" + r)) { pick = { col: c, row: r }; break; }
g.playerSeat = pick;
g = reshuffleAfterPlayer(g, mulberry32(13));
const all = Object.entries(g.seats).map(([id, pos]) => pos.col + "-" + pos.row);
console.log("12 人座位唯一:", new Set(all).size === 12, "| 玩家在", pick.col + "-" + pick.row, "未撞:", !all.includes(pick.col + "-" + pick.row));
g.npcCouples = [["linxiaoman", "jiangye"]];
g.seats = {};
g = reshuffleBeforePlayer(JSON.parse(JSON.stringify(g)), mulberry32(5));
g.playerSeat = { col: 1, row: 6 };
g = reshuffleAfterPlayer(g, mulberry32(7));
for (const [x, y] of g.npcCouples || []) {
  const a = seatOf(g, x), b = seatOf(g, y);
  console.log("情侣", NPC_MAP[x].name, NPC_MAP[y].name, "距离", Math.abs(a.col - b.col) + Math.abs(a.row - b.row));
}
const rows = Object.entries(g.seats).map(([id, pos]) => ({ name: NPC_MAP[id].name, row: pos.row, dil: NPC_MAP[id].traits.diligence })).sort((a, b) => a.row - b.row);
console.log("前排:", rows.slice(0, 4).map((r) => r.name + "(勤" + r.dil.toFixed(1) + ")").join(" "));
const back = rows.slice(-3).map((r) => r.name + "(勤" + r.dil.toFixed(1) + ")" );
console.log("后排:", back.join(" "));