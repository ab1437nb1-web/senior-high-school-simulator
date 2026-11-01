import { newGame, settleWeek, planWeekEvents, mulberry32, applyEventChoice, stageDef, lockChoice } from "../.tmp/engine.mjs";
import { TOTAL_WEEKS } from "../.tmp/engine.mjs";

const choice = { first: "physics", second: ["chemistry", "biology"] };
const target = "linxiaoman";
const seed = Number(process.argv[2] || 424242);

const SUBJ = ["chinese", "math", "english", "physics"];
const SECOND = ["chemistry", "biology", "geography"];

function buildPlan(s) {
  const secondPick = SECOND[(s.week >> 1) % SECOND.length];
  const core = [...SUBJ, secondPick];
  const focus = [0, 1, 2, 3, 4].map((d) => ({ a: "main", s: core[d % core.length] }));
  const evening = [0, 1, 2, 3, 4].map((d) => ({ a: "study", s: core[d % core.length] }));
  const weekend = [
    { a: "social" }, { a: "social" }, { a: "social" }, { a: "social" },
    { a: "rest" }, { a: "rest" },
  ];
  return { focus, evening, weekend };
}

let s = newGame(choice, seed, "normal", true, "m", "你", { col: 2, row: 2 });
s.socialTarget = target;
s.socialTarget2 = "chenyu";
let romanceWeek = null;
let lastStage = 1;

for (let i = 0; i < TOTAL_WEEKS; i++) {
  if (s.stage >= 2 && !s.choiceLocked) s = lockChoice(s, choice);
  const plan = buildPlan(s);
  const evs = planWeekEvents(s, s.weekInStage, mulberry32(seed + i * 7), plan);
  for (const e of evs) {
    const pick = e.choices && e.choices[0];
    if (pick) s = applyEventChoice(s, e, pick);
  }
  const res = settleWeek(s, plan);
  s = res.state;
  if (res.report.exam) {
    const e = res.report.exam;
    console.log("  " + stageDef(s.stage).name + " w" + (s.weekInStage - 1) + " " + e.kind + " " + e.total + " 排名 " + e.classRank);
  }
  if (s.stage !== lastStage) { lastStage = s.stage; }
  if (s.romance && romanceWeek === null) {
    romanceWeek = i + 1;
    console.log("确立关系：第 " + romanceWeek + " 周（" + stageDef(s.stage).name + " 第 " + s.weekInStage + " 周）");
    break;
  }
}
if (romanceWeek === null) console.log("到第 " + TOTAL_WEEKS + " 周仍未确立关系");
const girl = s.npcs.find((n) => n.id === target);
console.log("关系", Math.round(girl.relation), "| 跨越朋友", Math.round((s.beyond && s.beyond[target]) || 0), "| 链进度", (s.chains && s.chains[target]) || 0);
