import { newGame, planWeekEvents, applyEventChoice, mulberry32, competitionEligibility, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 1, "normal", true, "m", "x", { col: 2, row: 2 });
const scores = [
  { subject: "chinese", raw: 143, final: 143 },
  { subject: "math", raw: 146, final: 146 },
  { subject: "english", raw: 144, final: 144 },
  { subject: "physics", raw: 97, final: 97 },
  { subject: "chemistry", raw: 96, final: 96 },
  { subject: "biology", raw: 95, final: 95 },
  { subject: "politics", raw: 70, final: 70 },
  { subject: "history", raw: 70, final: 70 },
  { subject: "geography", raw: 70, final: 70 },
];
s.exams = [{ week: 9, kind: "mid", scores, total: 956, percentile: 99, classRank: 1, weak: [], max: 1050, factor: 1 }];
s.stage = 1; s.weekInStage = 10;
console.log("可报名:", competitionEligibility(s).join(","));
const evs = planWeekEvents(s, 10, mulberry32(1), p.build(s.choice));
const offer = evs.find((e) => e.id === "competition-offer");
console.log("事件:", offer ? offer.title : "未触发", "| 选项", offer ? offer.choices.map((c) => c.text).join(" / ") : "");
if (offer) {
  s = applyEventChoice(s, offer, offer.choices[0]);
  console.log("报名:", JSON.stringify(s.competition));
  const plan = p.build(s.choice);
  plan.evening = plan.evening.map((x) => (x && x.a === "study" ? { ...x, s: s.competition.subject } : x));
  for (let i = 0; i < 2; i++) s = settleWeek(s, plan).state;
  console.log("两周后进度:", s.competition.progress.toFixed(1), "周数:", s.competition.weeks);
}
