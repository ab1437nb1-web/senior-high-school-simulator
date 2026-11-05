import { newGame, qiangjiOptions } from "../.tmp/engine.mjs";
function base(total, scores) {
  const s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 1, "normal", true, "m", "x", { col: 2, row: 2 });
  s.stage = 9; s.weekInStage = 19;
  s.exams = [{ week: 18, kind: "mock2", scores, total, percentile: 90, classRank: 5, weak: [], max: 750, factor: 1 }];
  return s;
}
const sc = (arr) => arr.map(([subject, final]) => ({ subject, raw: final, final }));
// 国家金牌免总分
let s = base(560, sc([["chinese", 120], ["math", 120], ["english", 120], ["physics", 80], ["chemistry", 60], ["biology", 60]]));
s.competition = { subject: "physics", progress: 0, weeks: 0, since: 40, sessions: 900, zBonus: 0, active: true, history: [{ week: 60, level: "省队", national: false }, { week: 78, level: "决赛金牌", national: true }] };
console.log("国家金牌总分 560:", qiangjiOptions(s).map((o) => o.label + "+" + o.bonus).join(",") || "无");
// 文史类
s = base(630, sc([["chinese", 143], ["math", 120], ["english", 120], ["history", 96], ["physics", 70], ["chemistry", 60]]));
console.log("文史 语文143 历史96 总分630:", qiangjiOptions(s).map((o) => o.label + "+" + o.bonus).join(",") || "无");
