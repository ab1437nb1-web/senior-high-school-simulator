import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 77, "normal", true, "m", "x", { col: 2, row: 2 });
let together = 0, broke = 0, fights = 0;
let seen = new Set();
for (let i = 0; i < 100; i++) {
  s = settleWeek(s, p.build(s.choice)).state;
  for (const n of s.npcNews || []) {
    const key = n.week + "|" + n.text;
    if (seen.has(key)) continue;
    seen.add(key);
    if (n.text.includes("在一起")) together++;
    if (n.text.includes("分开")) broke++;
    if (n.text.includes("闹别扭")) fights++;
  }
}
console.log("100 周累计：在一起", together, "分开", broke, "闹别扭", fights, "| 现存", (s.npcCouples || []).length);
