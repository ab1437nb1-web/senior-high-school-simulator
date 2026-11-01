import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { newGame, settleWeek, stageDef } from "../.tmp/engine.mjs";
import { PRESETS } from "../.tmp/engine.mjs";

// 造一个「高一暑假最后一晚」的存档
let s = newGame({ first: "physics", second: ["chemistry", "geography"] }, 77, "normal");
const preset = PRESETS.find((p) => p.id === "practice");
for (let i = 0; i < 60 && !(s.stage === 4 && s.weekInStage === 6); i++) {
  s = settleWeek(s, preset.build(s.choice)).state;
}
console.log("prepared at", stageDef(s.stage).name, s.weekInStage);

const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", { url: "http://127.0.0.1:5180/", pretendToBeVisual: true });
const w = dom.window;
for (const k of ["window","document","HTMLElement","Element","Node","Event","MouseEvent","getComputedStyle","requestAnimationFrame","cancelAnimationFrame","matchMedia","localStorage","MutationObserver","URL","Blob","FormData"]) {
  if (w[k] !== undefined) { try { Object.defineProperty(global, k, { value: w[k], configurable: true, writable: true }); } catch {} }
}
Object.defineProperty(global, "navigator", { value: w.navigator, configurable: true });
w.localStorage.setItem("hs-life-sim.save.v2", JSON.stringify({ game: s, plan: preset.build(s.choice) }));

const assets = fs.readdirSync("dist/assets").filter((f) => f.endsWith(".js"));
await import("file://" + path.resolve("dist/assets", assets[0]).split("\\").join("/"));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(400);
const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");
const click = async (label) => {
  const b = Array.from(document.querySelectorAll("button")).find((x) => (x.textContent || "").includes(label));
  if (!b) return false;
  b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await wait(150);
  return true;
};
console.log("header:", (txt().match(/^(.{0,30})/) || [])[1]);
await click("过完这一周");
for (let guard = 0; guard < 20; guard++) {
  const c = document.querySelector(".choice-btn");
  if (c) { c.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await wait(120); continue; }
  if (await click("下一件")) continue;
  if (await click("开始这一周")) continue;
  break;
}
await wait(300);
console.log("has 周报:", txt().includes("周报"), "| tail:", txt().slice(-260));
console.log("has 综合评价:", txt().includes("综合评价"));
console.log("snippet:", (txt().match(/综合评价.{0,60}/) || ["(none)"])[0]);