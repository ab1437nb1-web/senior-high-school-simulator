import { newGame, planWeekEvents, applyEventChoice, mulberry32, qiangjiOptions } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
function make(total, withComp) {
  let s = newGame({ first: "physics", second: ["chemistry", "biology"] }, 3, "normal", true, "m", "x", { col: 2, row: 2 });
  s.stage = 9; s.weekInStage = 19; s.week = 110;
  s.exams = [{ week: 18, kind: "mock2", scores: [{ subject: "chinese", raw: 130, final: 130 }, { subject: "math", raw: 130, final: 130 }, { subject: "english", raw: 130, final: 130 }, { subject: "physics", raw: 90, final: 90 }, { subject: "chemistry", raw: 80, final: 80 }, { subject: "biology", raw: 80, final: 80 }, { subject: "history", raw: 60, final: 60 }], total, percentile: 90, classRank: 5, weak: [], max: 750, factor: 1 }];
  if (withComp) s.competition = { subject: "physics", progress: 0, weeks: 0, since: 40, sessions: 300, zBonus: 0, active: true, history: [{ week: 60, level: "省一", national: false }] };
  return s;
}
for (const [total, comp] of [[640, true], [600, true], [640, false]]) {
  const s = make(total, comp);
  const opts = qiangjiOptions(s);
  const ev = planWeekEvents(s, 19, mulberry32(1), p.build(s.choice)).find((e) => e.id === "qiangji-apply");
  console.log("total", total, "comp", comp, "| options", opts.map((o) => o.label + "+" + o.bonus).join(",") || "无", "| event", ev ? ev.choices.length : "无");
  if (ev) {
    const after = applyEventChoice(s, ev, ev.choices[0]);
    console.log("  报名后:", JSON.stringify(after.qiangji));
  }
}
