import { competitionAward, competitionPercentile } from "../.tmp/engine.mjs";
for (const p of [0, 100, 200, 300, 350, 450, 520, 600, 680, 800, 900, 950, 1000]) {
  const a = competitionAward(p);
  console.log(String(p).padStart(4) + " -> " + a.level.padEnd(6) + " 全国前 " + (a.top * 100).toFixed(4) + "%");
}
