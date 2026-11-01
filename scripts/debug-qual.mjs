import { newGame, settleWeek, lockChoice } from "../.tmp/engine.mjs";
import { PRESETS, SUBJECT_MAP } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 4, "normal", true, "f", "林晚");
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < 60 && !s.ended; i++) {
  if (s.stage >= 2 && !s.choiceLocked) s = lockChoice(s, s.choice);
  const res = settleWeek(s, p.build(s.choice));
  s = res.state;
  if (s.stage === 3 && s.weekInStage === 12) {
    for (const sub of ["biology", "politics", "history"]) {
      const meta = SUBJECT_MAP[sub];
      let sum = 0, c = 0;
      for (let j = 0; j < meta.units.length; j++) if (meta.units[j].stage === 1) { sum += s.units[sub + ":" + j].mastery; c++; }
      console.log(sub, "avg", (sum / c).toFixed(1));
    }
    console.log("locked", s.choiceLocked, "choice", JSON.stringify(s.choice));
    break;
  }
}
