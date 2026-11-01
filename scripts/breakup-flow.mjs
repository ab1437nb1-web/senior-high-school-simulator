import { newGame, settleWeek } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 5, "normal", true, "m", "x", { col: 2, row: 2 });
s.npcPairs = { "shaotian|tangtang": 76 };
s.npcCouples = [["shaotian", "tangtang"]];
let broke = 0;
for (let i = 0; i < 40; i++) {
  s = settleWeek(s, p.build(s.choice)).state;
  const news = (s.npcNews || []).filter((n) => n.text.includes("分开") && n.week > i);
  if (s.npcCouples.length === 0 && !broke) { broke = i + 1; }
}
console.log("情侣在 40 周内结束于第", broke || "未", "周；现存", s.npcCouples.length);
console.log("相关新闻:", (s.npcNews || []).filter((n) => n.text.includes("闹别扭") || n.text.includes("分开")).slice(-4).map((n) => "W" + n.week + " " + n.text).join(" / "));
