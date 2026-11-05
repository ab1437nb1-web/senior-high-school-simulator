import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
function run(sessions) {
  let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 11, "normal", true, "m", "x", { col: 2, row: 2 });
  s.competition = { subject: "physics", progress: 0, weeks: 0, since: 10, sessions, zBonus: 0, active: true, history: [] };
  for (let i = 0; i < 120 && s.stage < 5; i++) s = settleWeek(s, p.build(s.choice)).state;
  for (let i = 0; i < 3; i++) s = settleWeek(s, p.build(s.choice)).state;
  const first = s.competition.history[0];
  for (let i = 0; i < 20; i++) s = settleWeek(s, p.build(s.choice)).state;
  const nat = s.competition.history.find((h) => h.national);
  console.log("sessions", sessions, "| 高二:", first ? first.level : "无", "| 半年后国判:", nat ? nat.level : "未触发");
}
run(120); run(470); run(700);
