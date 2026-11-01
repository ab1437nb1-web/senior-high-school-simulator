import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";

const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", { url: "http://localhost/", pretendToBeVisual: true });
const w = dom.window;
for (const k of ["window", "document", "HTMLElement", "Element", "Node", "Event", "MouseEvent", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "matchMedia", "localStorage", "MutationObserver", "URL", "Blob", "FormData"]) {
  if (w[k] !== undefined) { try { Object.defineProperty(global, k, { value: w[k], configurable: true, writable: true }); } catch {} }
}
Object.defineProperty(global, "navigator", { value: w.navigator, configurable: true });

const assets = fs.readdirSync("dist/assets").filter((f) => f.endsWith(".js"));
await import("file://" + path.resolve("dist/assets", assets[0]).split("\\").join("/"));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(300);

const click = async (label) => {
  const btn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").includes(label));
  if (!btn) throw new Error("button not found: " + label);
  btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await wait(250);
};

const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");

await click("开始第 1 周");
console.log("week view:", txt().slice(0, 60));
console.log("selects:", document.querySelectorAll("select").length);
console.log("week header:", txt().match(/第 \d+ 周/)?.[0]);

await click("过完这一周");
const t = txt();
console.log("report shown:", t.includes("周报"));
console.log("has 依据:", t.includes("依据"));
console.log("report snippet:", t.slice(0, 260));
