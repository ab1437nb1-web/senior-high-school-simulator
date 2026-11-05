import { newGame, competitionAwardZ, competitionZ, qiangjiOptions } from "../.tmp/engine.mjs";
for (const n of [420, 480, 540, 620, 700, 800]) {
  const z = competitionZ(n, true, 0);
  console.log(n, "次 ->", competitionAwardZ(z).level, "top", (competitionAwardZ(z).top * 100).toFixed(4) + "%");
}
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 1, "normal", true, "m", "x", { col: 2, row: 2 });
s.stage = 9; s.weekInStage = 19;
s.exams = [{ week: 18, kind: "mock2", scores: [{ subject: "chinese", raw: 120, final: 120 }, { subject: "math", raw: 120, final: 120 }, { subject: "english", raw: 120, final: 120 }, { subject: "physics", raw: 80, final: 80 }, { subject: "chemistry", raw: 60, final: 60 }, { subject: "biology", raw: 60, final: 60 }], total: 560, percentile: 90, classRank: 5, weak: [], max: 750, factor: 1 }];
s.competition = { subject: "physics", progress: 0, weeks: 0, since: 40, sessions: 600, zBonus: 0, active: true, history: [{ week: 60, level: "省队", national: false }, { week: 78, level: "决赛银牌", national: true }] };
console.log("银牌+总分560:", qiangjiOptions(s).map((o) => o.label + "+" + o.bonus).join(",") || "无");
