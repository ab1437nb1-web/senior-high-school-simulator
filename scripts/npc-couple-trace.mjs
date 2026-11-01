import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 3, "normal", true, "m", "x", { col: 2, row: 2 });
let prev = 0;
const seen = new Set();
for (let i = 0; i < 120; i++) {
  s = settleWeek(s, p.build(s.choice)).state;
  const now = (s.npcCouples || []).length;
  for (const n of s.npcNews || []) {
    const k = n.week + "|" + n.text;
    if (seen.has(k)) continue;
    seen.add(k);
    if (n.text.includes("在一起") || n.text.includes("分开")) console.log("W" + n.week, n.text);
  }
  if (now !== prev) { console.log("  -> couples", now); prev = now; }
}
