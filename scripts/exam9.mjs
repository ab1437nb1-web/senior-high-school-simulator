import { newGame, settleWeek, lockChoice } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 4, "normal", true, "f", "林晚");
const p = PRESETS.find((x) => x.id === "six");
let firstExam = null, qualify = null;
for (let i = 0; i < 60 && !s.ended; i++) {
  if (s.stage >= 2 && !s.choiceLocked) s = lockChoice(s, s.choice);
  const res = settleWeek(s, p.build(s.choice));
  s = res.state;
  if (res.report.exam && !firstExam) firstExam = res.report.exam;
  if (res.report.qualify) qualify = res.report.qualify;
}
console.log("first exam:", firstExam.total, "/", firstExam.max, "subjects", firstExam.scores.length);
console.log("qualify:", qualify ? qualify.map((q) => q.subject + (q.pass ? "✓" : "✗")).join(" ") : "none");
