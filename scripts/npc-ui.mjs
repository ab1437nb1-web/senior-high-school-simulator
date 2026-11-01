import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", { url: "http://127.0.0.1:5180/", pretendToBeVisual: true });
const w = dom.window;
for (const k of ["window","document","HTMLElement","Element","Node","Event","MouseEvent","getComputedStyle","requestAnimationFrame","cancelAnimationFrame","matchMedia","localStorage","MutationObserver","URL","Blob","FormData"]) { if (w[k] !== undefined) { try { Object.defineProperty(global, k, { value: w[k], configurable: true, writable: true }); } catch {} } }
Object.defineProperty(global, "navigator", { value: w.navigator, configurable: true });
const assets = fs.readdirSync("dist/assets").filter((f) => f.endsWith(".js"));
await import("file://" + path.resolve("dist/assets", assets[0]).split("\\").join("/"));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(300);
const click = async (label) => { const b = Array.from(document.querySelectorAll("button")).find((x) => (x.textContent || "").includes(label)); if (!b) return false; b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await wait(180); return true; };
const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");
await click("开始第 1 周");
await click("同学");
console.log("has 同学 panel:", txt().includes("陈屿") && txt().includes("林小满"));
console.log("snippet:", (txt().match(/同学.{0,90}/) || ["(none)"])[0]);
