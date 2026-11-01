import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 21, "normal", true, "m", "x", { col: 2, row: 2 });
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < 80; i++) s = settleWeek(s, p.build(s.choice)).state;
const deg = {};
for (const n of s.npcs) deg[n.id] = 0;
for (const [k, v] of Object.entries(s.npcPairs || {})) {
  if (v >= 55) { const [a, b] = k.split("|"); deg[a]++; deg[b]++; }
}
const rows = Object.entries(deg).map(([id, d]) => ({ id, name: NPC_MAP[id].name, social: NPC_MAP[id].traits.social, deg: d })).sort((x, y) => y.deg - x.deg);
console.log(rows.map((r) => r.name + "(外向" + r.social.toFixed(1) + ") 亲近 " + r.deg).join("\n"));
console.log("couples:", (s.npcCouples || []).map(([a, b]) => NPC_MAP[a].name + "+" + NPC_MAP[b].name).join(", ") || "none");
