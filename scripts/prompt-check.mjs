import { buildEventPrompt, newGame, settleWeek, relationTrend, NPC_PROFILE, traitsText, NPC_MAP } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";
const p = PRESETS.find((x) => x.id === "six");
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 3, "normal", true, "m", "x", { col: 2, row: 2 });
s.socialTarget = "linxiaoman";
for (let i = 0; i < 20; i++) s = settleWeek(s, p.build(s.choice)).state;
const npc = s.npcs.find((n) => n.id === "linxiaoman");
const def = NPC_MAP.linxiaoman;
const prompt = buildEventPrompt({ id: "x", kind: "npc", social: true, title: "借笔记", text: "{npc}把笔记本推过来。", choices: [] }, {
  name: def.name, persona: NPC_PROFILE.linxiaoman, traits: traitsText(def.traits),
  relation: npc.relation, trend: relationTrend(npc, s.week), history: npc.history, recent: npc.history.slice(-3),
});
console.log(prompt.slice(0, 700));
console.log("\n--- trend:", relationTrend(npc, s.week), "| trace points:", (npc.relTrace || []).length);
