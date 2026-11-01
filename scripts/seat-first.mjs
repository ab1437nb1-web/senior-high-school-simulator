import { newGame, reshuffleBeforePlayer, reshuffleAfterPlayer, mulberry32, seatOf } from "../.tmp/engine.mjs";
import { NPC_MAP } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 4, "normal", true, "m", "x", { col: 2, row: 2 });
s.classRanking = [
  { id: "you", name: "你", total: 900, rank: 1 },
  ...s.npcs.filter((n) => n.kind === "classmate").map((n, i) => ({ id: n.id, name: NPC_MAP[n.id].name, total: 880 - i * 10, rank: i + 2 })),
];
const before = reshuffleBeforePlayer(JSON.parse(JSON.stringify(s)), mulberry32(1));
console.log("玩家第一时，选座前已占座位:", Object.keys(before.seats || {}).length);
const picked = { ...before, playerSeat: { col: 6, row: 8 } };
const after = reshuffleAfterPlayer(JSON.parse(JSON.stringify(picked)), mulberry32(2));
const keys = Object.entries(after.seats).map(([id, p]) => p.col + "-" + p.row);
console.log("选座后 12 人唯一:", new Set(keys).size === 12, "| 占玩家座位:", keys.includes("6-8"));
console.log("陈屿原座(2,1) 现在:", (() => { const e = Object.entries(after.seats).find(([, p]) => p.col === 2 && p.row === 1); return e ? NPC_MAP[e[0]].name : "空"; })());
