import { SUBJECTS } from "../.tmp/engine.mjs";
import fs from "node:fs";

const ALIAS = {
  "politics|树立科学思维观念": "逻辑与思维",
  "politics|遵循逻辑思维规则": "逻辑与思维",
  "chemistry|物质的分类及转化": "物质及其变化",
  "chinese|逻辑的力量": "论述类文本深化",
  "politics|我国的社会主义市场经济体制": "生产资料所有制与经济体制",
  "physics|安培力与洛伦兹力": "磁场",
  "math|向量的数量积与三角恒等变换": "平面向量及其应用",
  "chemistry|化学反应的速率与限度": "化学反应速率与化学平衡",
  "biology|种群数量的变化": "种群及其动态",
  "physics|原子结构和波粒二象性": "近代物理",
  "physics|原子核": "近代物理",
  "chemistry|氧化还原反应": "物质及其变化",
  "physics|电能　能量守恒定律": "恒定电流",
  "chemistry|化学反应与电能": "化学反应与能量",
  "biology|神经冲动的产生和传导": "神经调节",
  "english|Looking into the Future": "阅读与完形",
  "geography|海—气相互作用": "水的运动",
  "geography|全球气候变化与国家安全": "环境安全与国家安全",
  "biology|光合作用与能量转化": "细胞的能量供应和利用",
  "geography|太阳对地球的影响": "宇宙中的地球",
  "geography|大气受热过程和大气运动": "地球上的大气",
  "english|Sea Exploration": "阅读与完形",
  "physics|传感器": "实验与综合",
  "biology|生态系统的稳定性": "生态系统及其稳定性",
  "politics|把握世界的规律": "探索世界与把握规律",
  "english|Space Exploration": "阅读与完形",
  "physics|气体、固体和液体": "近代物理",
  "physics|能源与可持续发展": "机械能守恒定律",
  "politics|我国的经济发展": "经济发展与社会进步",
  "history|生产工具与劳作方式": "经济与社会生活",
  "history|人口迁徙、文化交融与认同": "文化交流与传播",
  "history|村落、城镇与居住环境": "经济与社会生活",
  "politics|我国的个人收入分配与社会保障": "经济发展与社会进步",
  "english|Diverse Cultures": "阅读与完形",
  "english|Journey Across a Vast Land": "阅读与完形",
  "history|影响世界的工业革命": "工业革命与马克思主义的诞生",
  "politics|寻觅社会的真谛": "认识社会与价值选择",
  "history|货币与赋税制度": "国家制度与社会治理",
  "history|基层治理与社会保障": "国家制度与社会治理",
  "history|商业贸易与日常生活": "经济与社会生活",
  "history|民族关系与国家关系": "国家制度与社会治理",
  "geography|国际合作": "区际联系与区域协调发展",
  "english|Sharing": "阅读与完形",
  "biology|生物技术的安全性与伦理问题": "生物技术的安全与伦理",
  "politics|在生活中学民法用民法": "民事权利与义务",
  "politics|侵权责任与权利界限": "民事权利与义务",
  "politics|实现人生的价值": "认识社会与价值选择",
  "history|医疗与公共卫生": "经济与社会生活",
  "english|Science and Scientists": "阅读与完形",
  "history|源远流长的中华文化": "文化交流与传播",
  "politics|继承发展中华优秀传统文化": "文化传承与文化创新",
  "geography|地域文化与城乡景观": "乡村和城镇",
  "politics|学习借鉴外来文化的有益成果": "文化传承与文化创新",
  "physics|序言": "运动的描述",
  "chemistry|绪言": "物质及其变化",
  "chinese|信息时代的语文生活": "语言运用",
  "english|The Internet": "阅读与完形",
};

const md = fs.readFileSync("高中九科知识点关联目录.md", "utf8");
const norm = (s) => s.replace(/[\s　·、，,（）()“”"':：\-—–]/g, "");
const parts = md.split(/\n#### 关联 /).slice(1);
const subjOf = (t) => (/^数/.test(t) ? "math" : /^物/.test(t) ? "physics" : /^化/.test(t) ? "chemistry" : /^生/.test(t) ? "biology" : /^政/.test(t) ? "politics" : /^史/.test(t) ? "history" : /^地/.test(t) ? "geography" : /^语/.test(t) ? "chinese" : /^英/.test(t) ? "english" : null);
const units = {};
for (const s of SUBJECTS) units[s.id] = s.units.map((u, i) => ({ i, name: u.name, n: norm(u.name) }));

const findUnit = (subj, raw) => {
  const alias = ALIAS[subj + "|" + raw];
  const target = alias || raw;
  const n = norm(target);
  const list = units[subj] || [];
  return list.find((u) => u.n === n) || list.find((u) => u.n.includes(n) || n.includes(u.n)) || null;
};

const edges = new Map();
let miss = [];
for (const p of parts) {
  const head = p.split("\n")[0];
  const lvl = (head.match(/【(Ⅰ|Ⅱ|Ⅲ)级/) || [])[1] || "Ⅱ";
  const strong = /强关联/.test(head);
  const loc = (p.match(/教材定位\*\*：([^\n]+)/) || [])[1] || "";
  const keys = [];
  for (const seg of loc.split(/[；;]/)) {
    const subj = subjOf(seg.trim());
    if (!subj) continue;
    for (const m of seg.matchAll(/[“"]([^”"]+)[”"]/g)) {
      const u = findUnit(subj, m[1]);
      if (u) keys.push(subj + ":" + u.i);
      else miss.push(subj + "|" + m[1]);
    }
  }
  const uniq = [...new Set(keys)];
  const w = strong ? 0.75 : lvl === "Ⅰ" ? 0.65 : lvl === "Ⅱ" ? 0.5 : 0.35;
  for (let i = 0; i < uniq.length; i++)
    for (let j = i + 1; j < uniq.length; j++) {
      const a = uniq[i], b = uniq[j];
      const k = a < b ? a + "|" + b : b + "|" + a;
      if (!edges.has(k)) edges.set(k, { a, b, w, lvl });
    }
}
console.log("edges:", edges.size, "unmatched:", miss.length);
if (miss.length) console.log("MISS:", [...new Set(miss)].join(" ; "));
const arr = [...edges.values()].map((e) => ({ ...e, a: e.a.replace(":", ":"), b: e.b.replace(":", ":") }));
fs.writeFileSync("_edges.json", JSON.stringify(arr, null, 1));
