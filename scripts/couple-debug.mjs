import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 77, "normal", true, "m", "x", { col: 2, row: 2 });
for (let i = 0; i < 100; i++) {
  s = settleWeek(s, p.build(s.choice)).state;
  if ((s.npcNews || []).length) {
    const n = s.npcNews[s.npcNews.length - 1];
    if (n.text.includes("在一起") || n.text.includes("分开") || n.text.includes("闹别扭")) console.log("W" + n.week, n.text);
  }
}
console.log("couples", JSON.stringify(s.npcCouples), "pairs high", Object.entries(s.npcPairs || {}).filter(([, v]) => v > 60).map(([k, v]) => k + "=" + Math.round(v)).join(","));
