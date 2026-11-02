import { newGame, settleWeek, competitionEligibility } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 7, "normal", true, "m", "x", { col: 2, row: 2 });
const zy = () => s.npcs.find((n) => n.id === "zhouyuan");
console.log("start intent", zy().compIntent, "comp", zy().competition);
for (let i = 0; i < 12; i++) {
  s = settleWeek(s, p.build(s.choice)).state;
  if (s.stage === 1) {
    const e = zy().game.exams[0];
    const ph = e ? e.scores.find((r) => r.subject === "physics").final : "-";
    console.log("w" + s.weekInStage, "physics", ph, "intent", zy().compIntent, "comp", zy().competition ? zy().competition.subject : "无", "eligible", competitionEligibility(zy().game).join(",") || "无");
  }
}
