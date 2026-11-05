import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 11, "normal", true, "m", "x", { col: 2, row: 2 });
s.competition = { subject: "physics", progress: 0, weeks: 0, since: 10, sessions: 260, zBonus: 0, active: true, history: [] };
for (let i = 0; i < 80; i++) {
  s = settleWeek(s, p.build(s.choice)).state;
  if (i < 4 || (s.stage === 5 && s.weekInStage <= 2)) console.log("i", i, "stage", s.stage, "wk", s.weekInStage, "hist", s.competition.history.length, "due", s.competition.nationalDue || "-");
  if (s.competition.history.length) break;
}
console.log("final hist", JSON.stringify(s.competition.history));
