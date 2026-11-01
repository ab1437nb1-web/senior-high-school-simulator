import * as M from "../.tmp/engine.mjs";
const groups = {};
for (const e of M.EVENTS) { const g = e.group || "daily"; groups[g] = (groups[g] || 0) + 1; }
console.log("EVENTS", M.EVENTS.length, JSON.stringify(groups));
console.log("SUBJECTS", M.SUBJECTS.length, "units", M.SUBJECTS.reduce((a, s) => a + s.units.length, 0));
console.log("EDGES", M.EDGES.length, "transfer", M.EDGES.filter((e) => e.kind === "transfer").length);
console.log("NPCS", M.NPCS.length, "classmates", M.NPCS.filter((n) => n.kind === "classmate").length, "teachers", M.NPCS.filter((n) => n.kind === "teacher").length);
console.log("STAGES", M.STAGES.length, M.STAGES.map((s) => s.name).join(" / "));
console.log("WEEKS", M.TOTAL_WEEKS, "PRESETS", M.PRESETS.map((p) => p.id).join(","));
console.log("ACTIONS", M.ACTIONS.length, M.ACTIONS.map((a) => a.id).join(","));
console.log("DAY_FOCUS", M.DAY_FOCUS.map((d) => d.a + ":" + d.absorb).join(","));
console.log("DECAY_K", JSON.stringify(M.DECAY_K));
