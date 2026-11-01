import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", { url: "http://127.0.0.1:5180/", pretendToBeVisual: true });
const w = dom.window;
for (const k of ["window","document","HTMLElement","Element","Node","Event","MouseEvent","getComputedStyle","requestAnimationFrame","cancelAnimationFrame","matchMedia","localStorage","MutationObserver","URL","Blob","FormData"]) { if (w[k] !== undefined) { try { Object.defineProperty(global, k, { value: w[k], configurable: true, writable: true }); } catch {} } }
Object.defineProperty(global, "navigator", { value: w.navigator, configurable: true });
const errors = [];
w.addEventListener("error", (e) => errors.push(String(e.error || e.message)));
const origError = console.error;
console.error = (...a) => { errors.push(a.map(String).join(" ")); origError(...a); };
const assets = fs.readdirSync("dist/assets").filter((f) => f.endsWith(".js"));
await import("file://" + path.resolve("dist/assets", assets[0]).split("\\").join("/"));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(300);
const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");
const clickTab = async (label) => {
  const b = Array.from(document.querySelectorAll("button")).find((x) => (x.textContent || "").trim() === label);
  if (!b) return false;
  b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await wait(250);
  return true;
};
await clickTab("开始第 1 周");
await clickTab("星图");
console.log("view:", txt().slice(0, 80));
console.log("errors:", errors.slice(0, 3).join(" | ") || "none");
