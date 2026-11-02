import { competitionZ, competitionProgress, competitionAwardZ } from "../.tmp/engine.mjs";
const rows = [10, 30, 60, 90, 120, 200, 300, 450, 600];
console.log("练习次数 | 普通 z/进度/奖项 | 真实 z/进度/奖项");
for (const n of rows) {
  const zn = competitionZ(n, false), pn = competitionProgress(n, false), an = competitionAwardZ(zn);
  const zr = competitionZ(n, true), pr = competitionProgress(n, true), ar = competitionAwardZ(zr);
  console.log(String(n).padStart(4) + " | " + zn.toFixed(2) + " / " + pn.toFixed(0).padStart(4) + " / " + an.level + " | " + zr.toFixed(2) + " / " + pr.toFixed(0).padStart(4) + " / " + ar.level);
}
