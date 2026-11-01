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
  if (!btn) return false;
  btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await wait(120);
  return true;
};
const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");

await click("开始第 1 周");
for (let i = 0; i < 10; i++) {
  const ok = await click("过完这一周");
  if (!ok) { console.log("commit failed at", i); break; }
  const t = txt();
  if (t.includes("期中成绩")) console.log("week", i + 1, "→ mid exam shown");
  if (t.includes("期末成绩")) console.log("week", i + 1, "→ final exam shown");
  await click("进入下一周");
}
console.log("ending:", txt().includes("高一下学期 · 结束"));
console.log("ending snippet:", txt().slice(0, 160));

// tabs
await click("再来一局");
await click("开始第 1 周");
const tabs = ["星图", "成绩", "档案"];
for (const t of tabs) {
  await click(t);
  console.log(t + " view chars:", txt().length, "svg:", document.querySelectorAll("svg").length);
}
