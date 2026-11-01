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
  await wait(90);
  return true;
};
const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");

await click("困难");
await click("开始第 1 周");
console.log("header:", (txt().match(/^(.{0,40})/) || [])[1]);

for (let i = 0; i < 18; i++) {
  await click("过完这一周");
  let guard = 0;
  while (!txt().includes("周报") && guard++ < 12) {
    const c = document.querySelector(".choice-btn");
    if (c) { c.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await wait(90); }
    if (!(await click("下一件"))) await click("开始这一周");
    await wait(110);
  }
  if (i === 17) console.log("stage card:", txt().includes("学期结束"), (txt().match(/下一站：(.{1,6})/) || [])[1]);
  await click("进入下一周");
}
console.log("after stage1:", (txt().match(/^(高.{2})/) || [])[1], (txt().match(/第 \d+ \/ \d+ 周/) || [])[0]);
