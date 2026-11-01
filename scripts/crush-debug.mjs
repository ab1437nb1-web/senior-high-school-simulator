import { newGame, planWeekEvents, mulberry32, applyEventChoice, settleWeek, lockChoice } from "../.tmp/engine.mjs";
const choice = { first: "physics", second: ["chemistry", "biology"] };
let s = newGame(choice, 1, "normal", true, "m", "你", { col: 2, row: 2 });
s.socialTarget = "linxiaoman";
s.chains = { linxiaoman: 7 };
s.beyond = { linxiaoman: 60 };
s.npcs.find((n) => n.id === "linxiaoman").relation = 75;
const SUBJ = ["chinese", "math", "english", "physics"];
for (let i = 0; i < 6; i++) {
  if (s.stage >= 2 && !s.choiceLocked) s = lockChoice(s, choice);
  const plan = { focus: [0,1,2,3,4].map(d => ({a:"main", s:SUBJ[d%4]})), evening: [0,1,2,3,4].map(d => ({a:"study", s:SUBJ[d%4]})), weekend: [{a:"social"},{a:"social"},{a:"social"},{a:"social"},{a:"rest"},{a:"rest"}] };
  const evs = planWeekEvents(s, s.weekInStage, mulberry32(100 + i), plan);
  const crush = evs.filter(e => e.preRomance).map(e => e.id);
  console.log("w", i, "events", evs.map(e => e.id).join(","), "| crush:", crush.join(",") || "none");
  for (const e of evs) s = applyEventChoice(s, e, e.choices[0]);
  s = settleWeek(s, plan).state;
  console.log("   beyond", Math.round(s.beyond["linxiaoman"]));
}
