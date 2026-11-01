import { SUBJECTS } from "../.tmp/engine.mjs";
let total = 0;
for (const s of SUBJECTS) { console.log(s.name, s.units.length); total += s.units.length; }
console.log("TOTAL", total);
