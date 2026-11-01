import { newGame, settleWeek, stageDef } from "../.tmp/engine.mjs";

const plan = {
  focus: [{ a: "free" }, { a: "free" }, { a: "free" }, { a: "free" }, { a: "free" }],
  evening: [{ a: "preview", s: "math" }, { a: "preview", s: "math" }, { a: "preview", s: "math" }, { a: "preview", s: "math" }, { a: "preview", s: "math" }],
  weekend: [{ a: "preview", s: "math" }, { a: "preview", s: "math" }, { a: "rest" }, { a: "rest" }, { a: "rest" }, { a: "rest" }],
};
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 99, "normal");
s.stage = 2;
s.weekInStage = 2;
const before = s.units["math:4"].mastery;
const res = settleWeek(s, plan);
const after = res.state.units["math:4"].mastery;
console.log("holiday:", stageDef(res.state.stage).name, "math:4", before.toFixed(1), "->", after.toFixed(1), "capped<=20");
const res2 = settleWeek(res.state, plan);
console.log("after 2nd week:", res2.state.units["math:4"].mastery.toFixed(1));
// 高二暑假 allowPreview false
let s2 = newGame({ first: "physics", second: ["chemistry", "geography"] }, 99, "normal");
s2.stage = 8;
console.log("stage8 allowPreview:", stageDef(8).allowPreview, "kind:", stageDef(8).kind);
