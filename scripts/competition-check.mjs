import { newGame, settleWeek, planWeekEvents, applyEventChoice, mulberry32, competitionEligibility } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 424242, "normal", true, "m", "x", { col: 2, row: 2 });
for (let i = 0; i < 9; i++) s = settleWeek(s, p.build(s.choice)).state;
console.log("期中:", s.exams[0] ? s.exams[0].total : "无", "| 周", s.weekInStage);
console.log("可报名:", competitionEligibility(s).join(",") || "无");
const evs = planWeekEvents(s, s.weekInStage, mulberry32(5), p.build(s.choice));
const offer = evs.find((e) => e.id === "competition-offer");
console.log("事件:", offer ? offer.title + " 选项 " + offer.choices.map((c) => c.text).join(" / ") : "未触发");
if (offer) {
  s = applyEventChoice(s, offer, offer.choices[0]);
  console.log("报名后:", JSON.stringify(s.competition));
  const plan = p.build(s.choice);
  plan.evening = plan.evening.map((x) => x && x.a === "study" && !x.s ? { ...x, s: s.competition.subject } : x);
  for (let i = 0; i < 2; i++) s = settleWeek(s, plan).state;
  console.log("两周后进度:", s.competition.progress.toFixed(1), "周数:", s.competition.weeks, "压力:", Math.round(s.stats.stress));
}
