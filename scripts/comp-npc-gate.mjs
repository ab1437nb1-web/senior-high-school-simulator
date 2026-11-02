import { newGame, settleWeek, competitionEligibility } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 7, "normal", true, "m", "x", { col: 2, row: 2 });
for (let i = 0; i < 10; i++) s = settleWeek(s, p.build(s.choice)).state;
for (const n of s.npcs.filter((x) => x.competition)) {
  const g = n.game;
  const exam = g.exams[0];
  const scores = exam ? exam.scores.map((r) => NPC_MAP && r.subject + ":" + r.final).join(" ") : "无考试";
  console.log(NPC_MAP[n.id].name, n.competition.subject, "| 可报名:", competitionEligibility(g).join(",") || "无", "|", scores);
}
