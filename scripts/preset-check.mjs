import { PRESETS } from "../.tmp/engine.mjs";
const choice = { first: "physics", second: ["chemistry", "geography"] };
for (const id of ["six", "balanced", "science"]) {
  const p = PRESETS.find((x) => x.id === id);
  const plan = p.build(choice);
  console.log(id, "focus:", plan.focus.map((f) => f.a + ":" + (f.s || "")).join(","));
}
