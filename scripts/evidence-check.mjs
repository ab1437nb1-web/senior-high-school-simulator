import { newGame, settleWeek } from "../.tmp/engine.mjs";
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 8, "normal");
s.stage = 2; s.weekInStage = 2;
const mk = (a) => ({ focus: [{a:"free"},{a:"free"},{a:"free"},{a:"free"},{a:"free"}], evening: [{a},{a},{a},{a},{a}], weekend: [{a},{a},{a},{a},{a},{a}] });
for (const act of ["sport", "club", "volunteer", "rest"]) {
  const before = s.evidence.length;
  s = settleWeek(s, mk(act)).state;
  const added = s.evidence.slice(before);
  console.log(act, "→ evidence:", added.length, added.map((e) => e.dim).join(",") || "-");
}
