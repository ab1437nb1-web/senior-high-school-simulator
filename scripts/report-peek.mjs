import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", { url: "http://localhost/", pretendToBeVisual: true });
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
  const btn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").includes(label));
  if (!btn) return;
  btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await wait(150);
};
await click("开始第 1 周");
await click("过完这一周");
const sheet = document.querySelector(".sheet");
console.log("REPORT:\n" + (sheet.textContent || "").replace(/\s+/g, " "));
await click("进入下一周");
await click("过完这一周");
await click("进入下一周");
await click("过完这一周");
await click("进入下一周");
await click("过完这一周");
const s2 = document.querySelector(".sheet");
console.log("\nEXAM WEEK REPORT:\n" + (s2.textContent || "").replace(/\s+/g, " "));
