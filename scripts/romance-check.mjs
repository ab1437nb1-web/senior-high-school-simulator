import { newGame, settleWeek, canConfess, tryConfess, compatibility } from "../.tmp/engine.mjs";
import { PRESETS, NPC_MAP } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 12, "normal", true, "m", "林晚");
const p = PRESETS.find((x) => x.id === "six");
for (let i = 0; i < 3; i++) s = settleWeek(s, p.build(s.choice)).state;
const girl = s.npcs.find((n) => NPC_MAP[n.id].gender === "f");
girl.relation = 80;
console.log("target", NPC_MAP[girl.id].name, "compat", compatibility(s, girl.id).toFixed(2), "canConfess", canConfess(s, girl.id));
let succ = 0;
for (let i = 0; i < 200; i++) {
  const c = JSON.parse(JSON.stringify(s));
  c.npcs.find((n) => n.id === girl.id).relation = 80;
  if (tryConfess(c, girl.id).ok) succ++;
}
console.log("200 次成功率:", (succ / 2).toFixed(0) + "%");
const c2 = JSON.parse(JSON.stringify(s));
const r = tryConfess(c2, girl.id);
console.log(r.ok, r.text, "romance:", c2.romance ? c2.romance.npcId : "none");
