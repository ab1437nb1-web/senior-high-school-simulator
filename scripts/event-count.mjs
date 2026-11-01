import { newGame, planWeekEvents, mulberry32, applyEventChoice } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";

function run(presetId, choice) {
  const preset = PRESETS.find((p) => p.id === presetId);
  let s = newGame(choice, 12345);
  const all = [];
  for (let wk = 1; wk <= 18; wk++) {
    s.week = wk;
    const plan = preset.build(choice);
    const evs = planWeekEvents(s, wk, mulberry32(12345 * 31 + wk * 17), plan);
    all.push(...evs.map((e) => e.id));
    console.log("w" + wk, evs.length, evs.map((e) => e.id).join(","));
    for (const e of evs) s = applyEventChoice(s, e, e.choices[0]);
  }
  return all;
}

console.log("=== science (无志愿/社团/运动) ===");
const a = run("science", { first: "physics", second: ["chemistry", "biology"] });
console.log("含 volunteer/sports/festival/court:", ["volunteer-hours", "sports", "festival", "court"].filter((id) => a.includes(id)));
console.log("=== practice (有志愿) ===");
const b = run("practice", { first: "physics", second: ["chemistry", "geography"] });
console.log("含 volunteer:", b.includes("volunteer-hours"));
