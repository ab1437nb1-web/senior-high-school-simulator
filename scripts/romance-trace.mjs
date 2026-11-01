import { newGame, settleWeek, planWeekEvents, mulberry32, applyEventChoice, lockChoice } from "../.tmp/engine.mjs";
const choice = { first: "physics", second: ["chemistry", "biology"] };
const s0 = newGame(choice, 1, "normal", true, "m", "你", { col: 2, row: 2 });
let s = s0;
s.socialTarget = "linxiaoman";
const SUBJ = ["chinese", "math", "english", "physics"];
const plan = () => ({
  focus: [0,1,2,3,4].map((d) => ({ a: "main", s: SUBJ[d % 4] })),
  evening: [0,1,2,3,4].map((d) => ({ a: "study", s: SUBJ[d % 4] })),
  weekend: [{a:"social"},{a:"social"},{a:"social"},{a:"social"},{a:"rest"},{a:"rest"}],
});
for (let i = 0; i < 70; i++) {
  if (s.stage >= 2 && !s.choiceLocked) s = lockChoice(s, choice);
  const p = plan();
  const evs = planWeekEvents(s, s.weekInStage, mulberry32(1 + i * 7), p);
  const chain = evs.find((e) => e.chainNpc);
  for (const e of evs) { const c = e.choices && e.choices[0]; if (c) s = applyEventChoice(s, e, c); }
  const before = s.npcs.find((n) => n.id === "linxiaoman");
  s = settleWeek(s, p).state;
  const n = s.npcs.find((x) => x.id === "linxiaoman");
  console.log("w" + (i+1), "rel", Math.round(n.relation), "beyond", Math.round(s.beyond["linxiaoman"]||0), "chain", s.chains["linxiaoman"]||0, chain ? "链:" + chain.id : "", s.romance ? "ROMANCE" : "");
  if (s.romance) break;
}
