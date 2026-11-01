import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";

const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", { url: "http://localhost/", pretendToBeVisual: true });
const w = dom.window;
for (const k of ["window", "document", "HTMLElement", "Element", "Node", "Event", "MouseEvent", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "matchMedia", "localStorage", "MutationObserver", "URL", "Blob", "FormData", "IS_REACT_ACT_ENVIRONMENT"]) {
  if (w[k] !== undefined) {
    try { Object.defineProperty(global, k, { value: w[k], configurable: true, writable: true }); } catch {}
  }
}
Object.defineProperty(global, "navigator", { value: w.navigator, configurable: true });

const assets = fs.readdirSync("dist/assets").filter((f) => f.endsWith(".js"));
const file = path.resolve("dist/assets", assets[0]);
await import("file://" + file.split("\\").join("/"));
await new Promise((r) => setTimeout(r, 400));
const rootEl = document.getElementById("root");
const text = rootEl.textContent || "";
console.log("rendered chars:", text.length);
console.log("has setup:", text.includes("高一下学期") && text.includes("再选科目"));
console.log("body snippet:", text.slice(0, 120).replace(/\s+/g, " "));