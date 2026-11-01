import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", { url: "http://127.0.0.1:5180/", pretendToBeVisual: true });
const w = dom.window;
for (const k of ["window","document","HTMLElement","Element","Node","Event","MouseEvent","getComputedStyle","requestAnimationFrame","cancelAnimationFrame","matchMedia","localStorage","MutationObserver","URL","Blob","FormData"]) {
  if (w[k] !== undefined) { try { Object.defineProperty(global, k, { value: w[k], configurable: true, writable: true }); } catch {} }
}
Object.defineProperty(global, "navigator", { value: w.navigator, configurable: true });
const assets = fs.readdirSync("dist/assets").filter((f) => f.endsWith(".js"));
await import("file://" + path.resolve("dist/assets", assets[0]).split("\\").join("/"));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(300);
const click = async (label) => {
  const b = Array.from(document.querySelectorAll("button")).find((x) => (x.textContent || "").includes(label));
  if (!b) return false;
  b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await wait(120);
  return true;
};
const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");
const hasEvents = () => !!document.querySelector(".ev-text");

await click("开始第 1 周");
let weeks = 0, evTotal = 0, evMax = 0;
for (let i = 0; i < 18; i++) {
  if (txt().includes("高一下学期 · 结束")) break;
  await click("过完这一周");
  let guard = 0;
  let evThisWeek = 0;
  while (!txt().includes("周报") && guard++ < 12) {
    if (hasEvents()) {
      const c = document.querySelector(".choice-btn");
      if (c) { c.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); evThisWeek++; await wait(120); }
      const nxt = await click("下一件");
      if (!nxt) await click("开始这一周");
      await wait(150);
    } else break;
  }
  evTotal += evThisWeek;
  evMax = Math.max(evMax, evThisWeek);
  weeks++;
  if (txt().includes("期中成绩")) console.log("W" + weeks + " mid exam OK");
  if (txt().includes("期末成绩")) console.log("W" + weeks + " final exam OK @", (txt().match(/期末考试 · 第 \d+ 周/) || [])[0]);
  await click("进入下一周");
}
console.log("weeks played:", weeks, "events total:", evTotal, "max/week:", evMax);
console.log("ending:", txt().includes("高一下学期 · 结束"));
console.log("tail:", txt().slice(0, 120));
