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
  const btn = Array.from(document.querySelectorAll("button")).find((b) => (b.textContent || "").includes(label));
  if (!btn) return false;
  btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await wait(200);
  return true;
};
const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");
await click("开始第 1 周");
await click("设置");
console.log("default source:", document.querySelector(".sheet select")?.value);
console.log("key field visible:", !!document.querySelector(".sheet input[type=password]"));
await click("测试连接");
await wait(1500);
console.log("status:", (txt().match(/代理在线[^ ]*|连不上[^ ]*|还没配置 Key|连接成功[^ ]*/) || ["(none)"])[0]);
console.log("has 本地代理 text:", txt().includes("本地代理"));
