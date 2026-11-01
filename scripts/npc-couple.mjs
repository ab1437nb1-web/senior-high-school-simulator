import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let total = 0, splits = 0;
for (const seed of [3, 11, 42, 77]) {
  let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, seed, "normal", true, "m", "x", { col: 2, row: 2 });
  const seen = new Set();
  let formed = 0, broke = 0;
  for (let i = 0; i < 120; i++) {
    s = settleWeek(s, p.build(s.choice)).state;
    for (const n of s.npcNews || []) {
      const key = n.week + "|" + n.text;
      if (seen.has(key)) continue;
      seen.add(key);
      if (n.text.includes("在一起了")) formed++;
      if (n.text.includes("分开")) broke++;
    }
  }
  console.log("seed " + seed + ": 形成 " + formed + " 对，分开 " + broke + " 次，现存 " + (s.npcCouples || []).length);
  total += formed; splits += broke;
}
console.log("合计：形成 " + total + "，分开 " + splits);
