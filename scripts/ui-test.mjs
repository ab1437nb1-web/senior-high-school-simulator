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
  if (!btn) return false;
  btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await wait(150);
  return true;
};
const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");

await click("开始第 1 周");
const chips = document.querySelectorAll(".chip");
console.log("chips:", chips.length, Array.from(chips).map(c => c.textContent).join("/"));

// star map focus
await click("星图");
const labels = Array.from(document.querySelectorAll("svg text"));
console.log("subject labels:", labels.length);
const mathLabel = labels.find((t) => t.textContent === "数学");
mathLabel.parentElement.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
await wait(300);
const g = document.querySelector("svg g");
console.log("transform after focus:", g.getAttribute("style")?.slice(0, 90));
console.log("reset button:", !!Array.from(document.querySelectorAll("button")).find(b => (b.textContent||"").includes("返回全图")));

// settings
await click("返回全图");
await click("设置");
console.log("settings text:", txt().slice(0, 120));
console.log("has key field:", !!document.querySelector("input[type=password]"));
console.log("source options:", document.querySelectorAll(".sheet select option").length);
