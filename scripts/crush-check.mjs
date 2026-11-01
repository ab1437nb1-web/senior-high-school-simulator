import { newGame, tryConfess, canConfess } from "../.tmp/engine.mjs";
function make(rel, bonus) {
  const s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 5, "normal", true, "m", "x", { col: 2, row: 2 });
  s.week = 10;
  const g = s.npcs.find((n) => n.id === "linxiaoman");
  g.relation = rel;
  s.socialTarget = "linxiaoman";
  s.romanceBonus = bonus ? [{ amount: 2.5, week: 9 }, { amount: 2.5, week: 10 }] : [];
  return s;
}
function rate(s, n = 300) {
  let ok = 0;
  for (let i = 0; i < n; i++) { const c = JSON.parse(JSON.stringify(s)); if (tryConfess(c, "linxiaoman").ok) ok++; }
  return Math.round(ok / n * 100);
}
console.log("rel 90, 无暧昧加成:", rate(make(90, false)) + "%");
console.log("rel 90, 两次有利暧昧:", rate(make(90, true)) + "%");
console.log("rel 75, 无加成:", rate(make(75, false)) + "%");
console.log("rel 96, 一次不利:", (() => { const s = make(96, false); s.romanceBonus = [{ amount: -2.5, week: 10 }]; return rate(s) + "%"; })());