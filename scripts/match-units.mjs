import { SUBJECTS } from "../.tmp/engine.mjs";
import fs from "node:fs";
const md = fs.readFileSync("高中九科知识点关联目录.md", "utf8");
const norm = (s) => s.replace(/[\s　·、，,（）()“”"':：\-—–]/g, "");
const parts = md.split(/\n#### 关联 /).slice(1);
const subjOf = (t) => (/^数/.test(t) ? "math" : /^物/.test(t) ? "physics" : /^化/.test(t) ? "chemistry" : /^生/.test(t) ? "biology" : /^政/.test(t) ? "politics" : /^史/.test(t) ? "history" : /^地/.test(t) ? "geography" : /^语/.test(t) ? "chinese" : /^英/.test(t) ? "english" : null);
const units = {};
for (const s of SUBJECTS) units[s.id] = s.units.map((u, i) => ({ i, name: u.name, n: norm(u.name) }));
const unmatched = new Set();
let matched = 0, total = 0;
for (const p of parts) {
  const loc = (p.match(/教材定位\*\*：([^\n]+)/) || [])[1] || "";
  for (const seg of loc.split(/[；;]/)) {
    const subj = subjOf(seg.trim());
    if (!subj) continue;
    for (const m of seg.matchAll(/[“"]([^”"]+)[”"]/g)) {
      total++;
      const n = norm(m[1]);
      const hit = units[subj].find((u) => u.n === n) || units[subj].find((u) => u.n.includes(n) || n.includes(u.n));
      if (hit) matched++;
      else unmatched.add(subj + "|" + m[1]);
    }
  }
}
console.log("quoted:", total, "matched:", matched, "unmatched:", unmatched.size);
console.log([...unmatched].join("\n"));
