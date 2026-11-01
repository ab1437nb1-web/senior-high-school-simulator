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
const click = async (label, nth = 0) => {
  const all = Array.from(document.querySelectorAll("button")).filter((b) => (b.textContent || "").includes(label));
  if (!all[nth]) return false;
  all[nth].dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await wait(200);
  return true;
};
const txt = () => (document.getElementById("root").textContent || "").replace(/\s+/g, " ");

await click("开始第 1 周");
await click("过完这一周");
await click("进入下一周");
console.log("week after commit:", txt().match(/第 \d+ 周/)?.[0]);
await click("档案");
console.log("archive has slots:", txt().includes("槽位 1"), "restart:", txt().includes("重新开始"));
await click("保存");
console.log("slot saved:", !!localStorage.getItem("hs-life-sim.slot.1"), localStorage.getItem("hs-life-sim.slot.1")?.slice(0, 40));
await click("重新开始");
console.log("back to setup:", txt().includes("再选科目"), "has 读取存档:", txt().includes("读取存档"));
await click("读取");
await wait(300);
console.log("after load:", txt().match(/第 \d+ 周/)?.[0]);
// proxy key field
await click("设置");
console.log("proxy key input:", !!document.querySelector(".sheet input[type=password]"), txt().includes("保存到服务端"));
