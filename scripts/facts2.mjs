import * as M from "../.tmp/engine.mjs";
console.log(M.STAGES.map((s) => s.id + ":" + s.name + "(w" + s.weeks + ",acad" + s.academic + (s.holiday ? ",holiday" : "") + ")").join("\n"));
console.log("---");
console.log("ACTIONS", M.ACTIONS.map((a) => a.id + "/" + a.name + "/base" + a.base).join(" | "));
console.log("FOCUS", M.DAY_FOCUS.map((d) => JSON.stringify(d)).join(" ").slice(0, 500));
