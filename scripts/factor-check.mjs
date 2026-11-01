import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 7, "normal");
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < 12; i++) {
  const res = settleWeek(s, p.build(s.choice));
  s = res.state;
  if (res.report.exam) console.log(res.report.exam.kind, res.report.exam.total, "factor", res.report.exam.factor);
}
