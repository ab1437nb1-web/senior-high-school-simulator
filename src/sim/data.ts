import type { SubjectId, Slot } from "./types";

export type UnitDef = { name: string; stage: number };

export type SubjectMeta = {
  id: SubjectId;
  name: string;
  short: string;
  color: string;
  units: UnitDef[];
  full: number;
  graded: boolean;
  mu: number;
  sigma: number;
};

// 单元按人教版教材的章/单元粒度拆分，每学期 3 个，共 15 个/科。
// 单元按人教版教材的「章 / 单元」粒度拆分，stage 对应学期：1 高一上 … 5 高三。
const U = (stage: number, name: string): UnitDef => ({ name, stage });

export const SUBJECTS: SubjectMeta[] = [
  {
    id: "chinese", name: "语文", short: "语", color: "#8c6a4a", full: 150, graded: false, mu: 68, sigma: 10,
    units: [
      U(1, "现代诗歌与散文"), U(1, "古代叙事散文"), U(1, "古诗词诵读"), U(1, "论述类文本"),
      U(2, "小说与戏剧"), U(2, "古代议论散文"), U(2, "实用类文本"), U(2, "整本书阅读"),
      U(3, "诸子散文"), U(3, "现当代散文"), U(3, "古诗词鉴赏"), U(3, "外国小说"),
      U(4, "史传文言文"), U(4, "文学评论"), U(4, "诗歌鉴赏深化"), U(4, "语言运用"),
      U(5, "论述类文本深化"), U(5, "考场作文"), U(5, "套卷训练"),
    ],
  },
  {
    id: "math", name: "数学", short: "数", color: "#2f5d8a", full: 150, graded: false, mu: 58, sigma: 14,
    units: [
      U(1, "集合与常用逻辑用语"), U(1, "一元二次函数与不等式"), U(1, "函数的概念与性质"), U(1, "指数函数与对数函数"),
      U(2, "三角函数"), U(2, "平面向量及其应用"), U(2, "复数"), U(2, "立体几何初步"),
      U(3, "空间向量与立体几何"), U(3, "直线和圆的方程"), U(3, "圆锥曲线的方程"),
      U(4, "数列"), U(4, "一元函数的导数及其应用"), U(4, "计数原理"),
      U(5, "随机变量及其分布"), U(5, "成对数据的统计分析"), U(5, "导数综合"), U(5, "高考题型整合"),
    ],
  },
  {
    id: "english", name: "英语", short: "英", color: "#4a6b7c", full: 150, graded: false, mu: 66, sigma: 11,
    units: [
      U(1, "词汇与语音"), U(1, "定语从句"), U(1, "阅读与完形"), U(1, "应用文写作"),
      U(2, "非谓语动词"), U(2, "说明文阅读"), U(2, "七选五"), U(2, "读后续写"),
      U(3, "名词性从句"), U(3, "长难句分析"), U(3, "议论文写作"),
      U(4, "虚拟语气与倒装"), U(4, "完形与阅读"), U(4, "写作升级"),
      U(5, "高考词汇复现"), U(5, "听力"), U(5, "套卷训练"),
    ],
  },
  {
    id: "physics", name: "物理", short: "物", color: "#3f6b4f", full: 100, graded: false, mu: 60, sigma: 13,
    units: [
      U(1, "运动的描述"), U(1, "匀变速直线运动"), U(1, "相互作用——力"), U(1, "运动和力的关系"),
      U(2, "抛体运动"), U(2, "圆周运动"), U(2, "万有引力与宇宙航行"), U(2, "机械能守恒定律"),
      U(3, "动量守恒定律"), U(3, "机械振动"), U(3, "机械波"), U(3, "光"),
      U(4, "静电场"), U(4, "恒定电流"), U(4, "磁场"), U(4, "电磁感应"),
      U(5, "交变电流"), U(5, "电磁振荡与电磁波"), U(5, "近代物理"), U(5, "实验与综合"),
    ],
  },
  {
    id: "chemistry", name: "化学", short: "化", color: "#7a4a6b", full: 100, graded: true, mu: 62, sigma: 13,
    units: [
      U(1, "物质及其变化"), U(1, "钠及其化合物"), U(1, "氯及其化合物"), U(1, "铁 金属材料"), U(1, "物质结构 元素周期律"),
      U(2, "化工生产中的重要非金属元素"), U(2, "化学反应与能量"), U(2, "有机化合物"), U(2, "化学与可持续发展"),
      U(3, "化学反应的热效应"), U(3, "化学反应速率与化学平衡"), U(3, "水溶液中的离子反应与平衡"),
      U(4, "原子结构与性质"), U(4, "分子结构与性质"), U(4, "晶体结构与性质"),
      U(5, "有机化合物的结构特点"), U(5, "烃"), U(5, "烃的衍生物"), U(5, "生物大分子与合成高分子"),
    ],
  },
  {
    id: "biology", name: "生物", short: "生", color: "#556f3f", full: 100, graded: true, mu: 66, sigma: 12,
    units: [
      U(1, "走近细胞"), U(1, "组成细胞的分子"), U(1, "细胞的基本结构"), U(1, "细胞的物质输入和输出"), U(1, "细胞的能量供应和利用"), U(1, "细胞的生命历程"),
      U(2, "遗传因子的发现"), U(2, "基因和染色体的关系"), U(2, "基因的本质"), U(2, "基因的表达"), U(2, "基因突变及其他变异"), U(2, "生物的进化"),
      U(3, "人体的内环境与稳态"), U(3, "神经调节"), U(3, "体液调节"), U(3, "免疫调节"), U(3, "植物生命活动的调节"),
      U(4, "种群及其动态"), U(4, "群落及其演替"), U(4, "生态系统及其稳定性"), U(4, "人与环境"),
      U(5, "发酵工程"), U(5, "细胞工程"), U(5, "基因工程"), U(5, "生物技术的安全与伦理"),
    ],
  },
  {
    id: "politics", name: "政治", short: "政", color: "#8a3f3f", full: 100, graded: true, mu: 63, sigma: 13,
    units: [
      U(1, "社会主义从空想到科学"), U(1, "只有社会主义才能救中国"), U(1, "只有中国特色社会主义才能发展中国"), U(1, "只有坚持和发展中国特色社会主义才能实现中华民族伟大复兴"),
      U(2, "生产资料所有制与经济体制"), U(2, "经济发展与社会进步"), U(2, "中国共产党的领导"), U(2, "人民当家作主"), U(2, "全面依法治国"),
      U(3, "探索世界与把握规律"), U(3, "认识社会与价值选择"), U(3, "文化传承与文化创新"),
      U(4, "各具特色的国家"), U(4, "世界多极化"), U(4, "经济全球化"), U(4, "国际组织"),
      U(5, "民事权利与义务"), U(5, "家庭与婚姻"), U(5, "就业与创业"), U(5, "社会争议解决"), U(5, "逻辑与思维"),
    ],
  },
  {
    id: "history", name: "历史", short: "史", color: "#6b5a3f", full: 100, graded: false, mu: 63, sigma: 12,
    units: [
      U(1, "从中华文明起源到秦汉"), U(1, "三国两晋南北朝至隋唐"), U(1, "辽宋夏金多民族政权"), U(1, "明清中国版图的奠定"), U(1, "晚清时期的内忧外患"), U(1, "辛亥革命与中华民国的建立"),
      U(2, "中国共产党成立与新民主主义革命"), U(2, "中华人民共和国成立和社会主义革命"), U(2, "改革开放与社会主义现代化建设"), U(2, "古代文明的产生与发展"), U(2, "中古时期的世界"), U(2, "走向整体的世界"),
      U(3, "资本主义制度的确立"), U(3, "工业革命与马克思主义的诞生"), U(3, "世界殖民体系与亚非拉民族独立运动"), U(3, "两次世界大战与国际秩序"), U(3, "20 世纪下半叶世界的新变化"),
      U(4, "国家制度与社会治理"), U(4, "经济与社会生活"), U(4, "文化交流与传播"),
      U(5, "通史整合"), U(5, "史料实证"), U(5, "小论文训练"), U(5, "套卷训练"),
    ],
  },
  {
    id: "geography", name: "地理", short: "地", color: "#3f6b6b", full: 100, graded: true, mu: 64, sigma: 13,
    units: [
      U(1, "宇宙中的地球"), U(1, "地球上的大气"), U(1, "地球上的水"), U(1, "地貌"), U(1, "植被与土壤"), U(1, "自然灾害"),
      U(2, "人口"), U(2, "乡村和城镇"), U(2, "产业区位因素"), U(2, "交通运输布局与区域发展"), U(2, "环境与发展"),
      U(3, "地球的运动"), U(3, "地表形态的塑造"), U(3, "大气的运动"), U(3, "水的运动"), U(3, "自然环境的整体性与差异性"),
      U(4, "区域与区域发展"), U(4, "资源、环境与区域发展"), U(4, "城市、产业与区域发展"), U(4, "区际联系与区域协调发展"),
      U(5, "自然环境与人类社会"), U(5, "资源安全与国家安全"), U(5, "环境安全与国家安全"), U(5, "保障国家安全的资源、环境战略"),
    ],
  },
];

export const SUBJECT_MAP: Record<SubjectId, SubjectMeta> = SUBJECTS.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {} as Record<SubjectId, SubjectMeta>);

export const ALL_SUBJECTS: SubjectId[] = SUBJECTS.map((s) => s.id);

export function unitKey(subject: SubjectId, index: number): string {
  return subject + ":" + String(index);
}

export function unitLabel(key: string): string {
  const parts = key.split(":");
  const meta = SUBJECT_MAP[parts[0] as SubjectId];
  const idx = Number(parts[1]);
  const u = meta.units[idx];
  return meta.name + "·" + (u ? u.name : "?");
}

// 本学期第几周开始教这一单元：同册单元均匀铺开，期中只考已经教过的
export function unitEnterWeek(subject: SubjectId, index: number): number {
  const meta = SUBJECT_MAP[subject];
  const u = meta.units[index];
  const group = meta.units.filter((x) => x.stage === u.stage);
  const k = group.indexOf(u);
  const weeks = termOfAcademic(u.stage).weeks;
  return 1 + Math.floor((k * (weeks - 2)) / Math.max(1, group.length));
}

export function unitsUpTo(subject: SubjectId, stage: number): number[] {
  const meta = SUBJECT_MAP[subject];
  const out: number[] = [];
  for (let i = 0; i < meta.units.length; i++) if (meta.units[i].stage <= stage) out.push(i);
  return out;
}

export type Edge = { a: string; b: string; w: number; kind: "transfer" | "confusable" };

// 按教材章名定位，改目录时不用重新数下标
function idxOf(s: SubjectId, name: string): number {
  const i = SUBJECT_MAP[s].units.findIndex((u) => u.name === name);
  if (i < 0) throw new Error("unit not found: " + s + "/" + name);
  return i;
}

const E = (s1: SubjectId, n1: string, s2: SubjectId, n2: string, w: number, kind: "transfer" | "confusable" = "transfer"): Edge => ({
  a: unitKey(s1, idxOf(s1, n1)),
  b: unitKey(s2, idxOf(s2, n2)),
  w,
  kind,
});

export const EDGES: Edge[] = [
  { a: unitKey("math", 0), b: unitKey("politics", 20), w: 0.65, kind: "transfer" },
  { a: unitKey("math", 0), b: unitKey("chemistry", 0), w: 0.65, kind: "transfer" },
  { a: unitKey("math", 0), b: unitKey("biology", 0), w: 0.65, kind: "transfer" },
  { a: unitKey("math", 0), b: unitKey("chinese", 16), w: 0.65, kind: "transfer" },
  { a: unitKey("politics", 20), b: unitKey("chemistry", 0), w: 0.65, kind: "transfer" },
  { a: unitKey("politics", 20), b: unitKey("biology", 0), w: 0.65, kind: "transfer" },
  { a: unitKey("politics", 20), b: unitKey("chinese", 16), w: 0.65, kind: "transfer" },
  { a: unitKey("chemistry", 0), b: unitKey("biology", 0), w: 0.65, kind: "transfer" },
  { a: unitKey("chemistry", 0), b: unitKey("chinese", 16), w: 0.65, kind: "transfer" },
  { a: unitKey("biology", 0), b: unitKey("chinese", 16), w: 0.65, kind: "transfer" },
  { a: unitKey("politics", 4), b: unitKey("biology", 17), w: 0.65, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("math", 8), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("physics", 0), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("physics", 2), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("physics", 3), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("physics", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("physics", 14), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 8), b: unitKey("physics", 0), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 8), b: unitKey("physics", 2), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 8), b: unitKey("physics", 3), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 8), b: unitKey("physics", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 8), b: unitKey("physics", 14), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 0), b: unitKey("physics", 2), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 0), b: unitKey("physics", 3), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 0), b: unitKey("physics", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 0), b: unitKey("physics", 14), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 2), b: unitKey("physics", 3), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 2), b: unitKey("physics", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 2), b: unitKey("physics", 14), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 3), b: unitKey("physics", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 3), b: unitKey("physics", 14), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 4), b: unitKey("physics", 14), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 4), b: unitKey("math", 5), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 4), b: unitKey("physics", 5), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 4), b: unitKey("physics", 9), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 4), b: unitKey("physics", 10), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 4), b: unitKey("physics", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 4), b: unitKey("geography", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("physics", 5), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("physics", 9), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("physics", 10), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("physics", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 5), b: unitKey("geography", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 5), b: unitKey("physics", 9), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 5), b: unitKey("physics", 10), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 5), b: unitKey("physics", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 5), b: unitKey("geography", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 9), b: unitKey("physics", 10), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 9), b: unitKey("physics", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 9), b: unitKey("geography", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 10), b: unitKey("physics", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 10), b: unitKey("geography", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 11), b: unitKey("geography", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 12), b: unitKey("chemistry", 10), w: 0.65, kind: "transfer" },
  { a: unitKey("math", 12), b: unitKey("biology", 17), w: 0.65, kind: "transfer" },
  { a: unitKey("chemistry", 10), b: unitKey("biology", 17), w: 0.65, kind: "transfer" },
  { a: unitKey("biology", 6), b: unitKey("biology", 10), w: 0.75, kind: "transfer" },
  { a: unitKey("biology", 6), b: unitKey("biology", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("biology", 6), b: unitKey("geography", 6), w: 0.75, kind: "transfer" },
  { a: unitKey("biology", 6), b: unitKey("geography", 23), w: 0.75, kind: "transfer" },
  { a: unitKey("biology", 10), b: unitKey("biology", 11), w: 0.75, kind: "transfer" },
  { a: unitKey("biology", 10), b: unitKey("geography", 6), w: 0.75, kind: "transfer" },
  { a: unitKey("biology", 10), b: unitKey("geography", 23), w: 0.75, kind: "transfer" },
  { a: unitKey("biology", 11), b: unitKey("geography", 6), w: 0.75, kind: "transfer" },
  { a: unitKey("biology", 11), b: unitKey("geography", 23), w: 0.75, kind: "transfer" },
  { a: unitKey("geography", 6), b: unitKey("geography", 23), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 4), b: unitKey("physics", 6), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 4), b: unitKey("physics", 11), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 4), b: unitKey("geography", 11), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 6), b: unitKey("physics", 11), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 6), b: unitKey("geography", 11), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 18), b: unitKey("chemistry", 4), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 18), b: unitKey("biology", 1), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 18), b: unitKey("biology", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 18), b: unitKey("chemistry", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 4), b: unitKey("biology", 1), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 4), b: unitKey("biology", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 4), b: unitKey("chemistry", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 1), b: unitKey("biology", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 1), b: unitKey("chemistry", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 2), b: unitKey("chemistry", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 0), b: unitKey("chemistry", 6), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 0), b: unitKey("physics", 7), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 0), b: unitKey("physics", 13), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 0), b: unitKey("biology", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 0), b: unitKey("biology", 19), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 6), b: unitKey("physics", 7), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 6), b: unitKey("physics", 13), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 6), b: unitKey("biology", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 6), b: unitKey("biology", 19), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 7), b: unitKey("physics", 13), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 7), b: unitKey("biology", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 7), b: unitKey("biology", 19), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 13), b: unitKey("biology", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("physics", 13), b: unitKey("biology", 19), w: 0.75, kind: "transfer" },
  { a: unitKey("biology", 4), b: unitKey("biology", 19), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 6), b: unitKey("biology", 13), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 6), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 13), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 1), b: unitKey("geography", 13), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 1), b: unitKey("geography", 14), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 1), b: unitKey("geography", 22), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 13), b: unitKey("geography", 14), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 13), b: unitKey("geography", 22), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 14), b: unitKey("geography", 22), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 4), b: unitKey("geography", 0), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 4), b: unitKey("geography", 1), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 4), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 0), b: unitKey("geography", 1), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 0), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 1), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 11), b: unitKey("biology", 3), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 11), b: unitKey("biology", 12), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 11), b: unitKey("geography", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 3), b: unitKey("biology", 12), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 3), b: unitKey("geography", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 12), b: unitKey("geography", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 19), b: unitKey("biology", 19), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 19), b: unitKey("politics", 9), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 19), b: unitKey("politics", 9), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 8), b: unitKey("geography", 4), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 8), b: unitKey("geography", 15), w: 0.75, kind: "transfer" },
  { a: unitKey("chemistry", 8), b: unitKey("geography", 17), w: 0.75, kind: "transfer" },
  { a: unitKey("geography", 4), b: unitKey("geography", 15), w: 0.75, kind: "transfer" },
  { a: unitKey("geography", 4), b: unitKey("geography", 17), w: 0.75, kind: "transfer" },
  { a: unitKey("geography", 15), b: unitKey("geography", 17), w: 0.75, kind: "transfer" },
  { a: unitKey("math", 10), b: unitKey("geography", 0), w: 0.5, kind: "transfer" },
  { a: unitKey("math", 10), b: unitKey("geography", 11), w: 0.5, kind: "transfer" },
  { a: unitKey("math", 10), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 0), b: unitKey("geography", 11), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 11), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("chemistry", 5), b: unitKey("physics", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 7), b: unitKey("physics", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 7), b: unitKey("politics", 5), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 7), b: unitKey("history", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 18), b: unitKey("politics", 5), w: 0.5, kind: "transfer" },
  { a: unitKey("physics", 18), b: unitKey("history", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("politics", 5), b: unitKey("history", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 19), b: unitKey("history", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 19), b: unitKey("politics", 5), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 19), b: unitKey("math", 15), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 19), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 18), b: unitKey("math", 15), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 18), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("politics", 5), b: unitKey("math", 15), w: 0.5, kind: "transfer" },
  { a: unitKey("politics", 5), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("math", 15), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("politics", 14), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 13), b: unitKey("politics", 10), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 17), b: unitKey("history", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 17), b: unitKey("geography", 8), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 18), b: unitKey("geography", 8), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 17), b: unitKey("geography", 19), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 17), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("geography", 19), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 24), b: unitKey("politics", 16), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 24), b: unitKey("politics", 10), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 24), b: unitKey("history", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("biology", 24), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("politics", 16), b: unitKey("politics", 10), w: 0.5, kind: "transfer" },
  { a: unitKey("politics", 16), b: unitKey("history", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("politics", 16), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("politics", 10), b: unitKey("history", 18), w: 0.5, kind: "transfer" },
  { a: unitKey("politics", 10), b: unitKey("english", 2), w: 0.5, kind: "transfer" },
  { a: unitKey("history", 19), b: unitKey("politics", 11), w: 0.35, kind: "transfer" },
  { a: unitKey("history", 19), b: unitKey("geography", 7), w: 0.35, kind: "transfer" },
  { a: unitKey("politics", 11), b: unitKey("geography", 7), w: 0.35, kind: "transfer" },
  { a: unitKey("physics", 0), b: unitKey("chemistry", 0), w: 0.35, kind: "transfer" },
  { a: unitKey("chinese", 16), b: unitKey("chinese", 15), w: 0.65, kind: "transfer" },
  { a: unitKey("chinese", 16), b: unitKey("english", 2), w: 0.65, kind: "transfer" },
  { a: unitKey("chinese", 15), b: unitKey("english", 2), w: 0.65, kind: "transfer" },
  { a: unitKey("math", 2), b: unitKey("math", 11), w: 0.35, kind: "confusable" },
  { a: unitKey("politics", 9), b: unitKey("biology", 6), w: 0.3, kind: "confusable" },
  { a: unitKey("geography", 6), b: unitKey("history", 18), w: 0.25, kind: "confusable" },
  { a: unitKey("physics", 2), b: unitKey("physics", 4), w: 0.3, kind: "confusable" },
];

// 地点：轨迹系统的基础单位
export const PLACES = {
  dormM: "男生宿舍",
  dormF: "女生宿舍",
  home: "家",
  classroom: "教室",
  library: "图书馆",
  canteen: "食堂",
  field: "操场",
  clubroom: "社团活动室",
  community: "社区",
  competition: "竞赛教室",
  office: "办公室",
} as const;

export type PlaceId = keyof typeof PLACES;

// 宿舍按性别分开；家是每个人私有的，用 home:<id> 表示
export const dormKey = (gender: string) => (gender === "m" ? "dormM" : "dormF");
export const homeKey = (id: string) => "home:" + id;

export function placeLabel(key: string) {
  if (key.startsWith("home:")) return PLACES.home;
  if (key === "dormM" || key === "dormF") return PLACES[key];
  return (PLACES as any)[key] || key;
}

export type ActionMeta = {
  id: string;
  name: string;
  short: string;
  needSubject?: boolean;
  energy: number;
  stress: number;
  mood: number;
  health: number;
  relation: number;
  base: number;
  topic: "study" | "rest" | "social" | "art" | "labor" | "sport" | "none";
  hint: string;
  place?: PlaceId;
  // true 表示这个动作在家里进行（工作日会显示成宿舍）
  atHome?: boolean;
};

export const ACTIONS: ActionMeta[] = [
  { id: "study", name: "学习", short: "学", needSubject: true, energy: 16, stress: 2, mood: -1, health: 0, relation: 0, base: 12.5, topic: "study", place: "library", hint: "推进该科最薄弱的一单元" },
  { id: "review", name: "错题复盘", short: "复", needSubject: true, energy: 12, stress: 0, mood: 0, health: 0, relation: 0, base: 7.5, topic: "study", place: "library", hint: "按错因补，分数涨得更准" },
  { id: "preview", name: "预习", short: "预", needSubject: true, energy: 14, stress: 2, mood: -1, health: 0, relation: 0, base: 4, topic: "study", place: "library", hint: "假期限定：提前看下学期的内容，最多到 20" },
  { id: "rest", name: "休息", short: "歇", energy: -16, stress: -6, mood: 3, health: 1, relation: 0, base: 0, topic: "rest", atHome: true, hint: "回一点精力" },
  { id: "sport", name: "运动", short: "动", energy: 8, stress: -10, mood: 5, health: 2, relation: 0, base: 0, topic: "sport", place: "field", hint: "降压力，涨健康" },
  { id: "social", name: "社交", short: "社", energy: 8, stress: -7, mood: 5, health: 0, relation: 2, base: 0, topic: "social", hint: "关系与心情" },
  { id: "club", name: "社团", short: "团", energy: 10, stress: -4, mood: 4, health: 0, relation: 1, base: 0, topic: "art", place: "clubroom", hint: "艺术素养证据" },
  { id: "volunteer", name: "志愿服务", short: "志", energy: 12, stress: 0, mood: 1, health: 0, relation: 1, base: 0, topic: "labor", place: "community", hint: "劳动与实践证据" },
  { id: "entertain", name: "玩手机", short: "玩", energy: -8, stress: -8, mood: 6, health: -1, relation: 0, base: 0, topic: "rest", atHome: true, hint: "爽，但第二天专注下降" },
  { id: "sleep", name: "补觉", short: "睡", energy: -22, stress: -4, mood: 2, health: 1, relation: 0, base: 0, topic: "rest", atHome: true, hint: "把债还掉" },
  { id: "competition", name: "竞赛学习", short: "竞", needSubject: true, energy: 22, stress: 7, mood: -2, health: -1, relation: 0, base: 18, topic: "study", place: "competition", hint: "高强度集训：固定收益高、吃精力、几乎吃不到课堂加成" },
];

export const ACTION_MAP: Record<string, ActionMeta> = ACTIONS.reduce((acc, a) => {
  acc[a.id] = a;
  return acc;
}, {} as Record<string, ActionMeta>);

export const DAY_FOCUS = [
  { id: "listen", place: "classroom", name: "认真听讲", hint: "全科吸收 +15%，精力 -8", absorb: 1.15 },
  { id: "main", place: "classroom", name: "主攻一科", hint: "该科吸收 +30%，其他 -10%", absorb: 1.3 },
  { id: "homework", place: "classroom", name: "补作业", hint: "作业分 +，课堂 -20%", absorb: 0.8 },
  { id: "nap", place: "classroom", name: "趴桌补觉", hint: "精力 +12，课堂 -30%", absorb: 0.7 },
  { id: "slack", place: "classroom", name: "摸鱼", hint: "心情 +6，课堂 -25%", absorb: 0.75 },
  { id: "social", place: "classroom", name: "社交", hint: "关系 +1，课堂 -15%", absorb: 0.85 },
  { id: "duty", place: "classroom", name: "值日", hint: "劳动证据，精力 -6", absorb: 0.9 },
  { id: "free", place: "classroom", name: "自由", hint: "没有修正", absorb: 1 },
];

export const DAY_FOCUS_MAP: Record<string, { id: string; place?: string; name: string; hint: string; absorb: number }> =
  DAY_FOCUS.reduce((acc, d) => { acc[d.id] = d; return acc; }, {} as any);

function cyc<T>(arr: T[], n: number): T[] {
  return Array.from({ length: n }, (_, i) => arr[i % arr.length]);
}

export type Preset = { id: string; name: string; desc: string; build: (choice: ChoiceLike) => PlanLike };

type ChoiceLike = { first: string; second: string[] };
type PlanLike = { focus: Slot[]; evening: Slot[]; weekend: Slot[] };

const all9: SubjectId[] = ["chinese", "math", "english", "physics", "chemistry", "biology", "politics", "history", "geography"];
const arts: SubjectId[] = ["chinese", "english", "politics", "history", "geography"];
const sci: SubjectId[] = ["math", "physics", "chemistry", "biology"];
const big3: SubjectId[] = ["chinese", "math", "english"];

function mainOf(subjects: SubjectId[]): Slot[] {
  return cyc(subjects, 5).map((s) => ({ a: "main", s }));
}
function studyOf(subjects: SubjectId[]): Slot[] {
  return cyc(subjects, 5).map((s) => ({ a: "study", s }));
}

export const PRESETS: Preset[] = [
  {
    id: "balanced", name: "学习·均衡", desc: "九科都碰，先不定向",
    build: () => ({ focus: mainOf(all9), evening: studyOf(all9), weekend: [{ a: "study", s: "math" }, { a: "study", s: "chinese" }, { a: "rest" }, { a: "study", s: "english" }, { a: "review", s: "physics" }, { a: "rest" }] }),
  },
  {
    id: "arts", name: "学习·偏文", desc: "语英史政地",
    build: () => ({ focus: mainOf(arts), evening: studyOf(arts), weekend: [{ a: "study", s: "chinese" }, { a: "study", s: "english" }, { a: "study", s: "history" }, { a: "rest" }, { a: "review", s: "politics" }, { a: "rest" }] }),
  },
  {
    id: "science", name: "学习·偏理", desc: "数物化生",
    build: () => ({ focus: mainOf(sci), evening: studyOf(sci), weekend: [{ a: "study", s: "math" }, { a: "study", s: "physics" }, { a: "review", s: "chemistry" }, { a: "rest" }, { a: "study", s: "biology" }, { a: "rest" }] }),
  },
  {
    id: "big3", name: "学习·偏大三科", desc: "语数外优先",
    build: () => ({ focus: mainOf(big3), evening: studyOf(big3), weekend: [{ a: "study", s: "math" }, { a: "study", s: "chinese" }, { a: "study", s: "english" }, { a: "rest" }, { a: "review", s: "math" }, { a: "rest" }] }),
  },
  {
    id: "small2", name: "学习·偏小科目", desc: "赌赋分",
    build: (c) => {
      const small = (c.second.length ? c.second : ["chemistry", "geography"]) as SubjectId[];
      return { focus: mainOf(small), evening: studyOf(small), weekend: [{ a: "study", s: small[0] }, { a: "study", s: small[1] }, { a: "rest" }, { a: "study", s: small[0] }, { a: "review", s: small[1] }, { a: "rest" }] };
    },
  },
  {
    id: "six", name: "选科·六科", desc: "只练要考的那六门",
    build: (c) => {
      const six = ["chinese", "math", "english", (c.first || "physics") as SubjectId, ...(c.second.length ? c.second : ["chemistry", "geography"])] as SubjectId[];
      return { focus: mainOf(six), evening: studyOf(six), weekend: [{ a: "study", s: six[1] }, { a: "study", s: six[0] }, { a: "review", s: six[3] }, { a: "rest" }, { a: "study", s: six[2] }, { a: "rest" }] };
    },
  },
  {
    id: "social", name: "社交·社团", desc: "关系与艺术线",
    build: () => ({ focus: [{ a: "social" }, { a: "social" }, { a: "listen" }, { a: "social" }, { a: "social" }], evening: [{ a: "club" }, { a: "social" }, { a: "club" }, { a: "social" }, { a: "study", s: "chinese" }], weekend: [{ a: "social" }, { a: "club" }, { a: "entertain" }, { a: "social" }, { a: "club" }, { a: "rest" }] }),
  },
  {
    id: "relax", name: "运动·放松", desc: "回血周",
    build: () => ({ focus: [{ a: "nap" }, { a: "nap" }, { a: "free" }, { a: "nap" }, { a: "nap" }], evening: [{ a: "sport" }, { a: "rest" }, { a: "entertain" }, { a: "sport" }, { a: "rest" }], weekend: [{ a: "sleep" }, { a: "sport" }, { a: "entertain" }, { a: "sleep" }, { a: "rest" }, { a: "sport" }] }),
  },
  {
    id: "practice", name: "社会实践", desc: "劳动与实践",
    build: () => ({ focus: [{ a: "duty" }, { a: "listen" }, { a: "duty" }, { a: "listen" }, { a: "duty" }], evening: [{ a: "volunteer" }, { a: "study", s: "chinese" }, { a: "volunteer" }, { a: "study", s: "math" }, { a: "rest" }], weekend: [{ a: "volunteer" }, { a: "volunteer" }, { a: "rest" }, { a: "club" }, { a: "study", s: "english" }, { a: "rest" }] }),
  },
];

export type StageDef = {
  id: number;
  name: string;
  kind: "term" | "holiday";
  academic: number;
  weeks: number;
  exams: Record<number, "mid" | "final" | "mock1" | "mock2" | "mock3" | "gaokao">;
  allowPreview?: boolean;
  note: string;
};

// 学期与假期交替；academic 指向它属于哪个学年段（决定可用单元）
export const STAGES: StageDef[] = [
  { id: 1, name: "高一上", kind: "term", academic: 1, weeks: 18, exams: { 9: "mid", 17: "final" }, note: "适应、分班、第一次月考" },
  { id: 2, name: "高一寒假", kind: "holiday", academic: 1, weeks: 4, exams: {}, note: "整理一学期，预习下学期" },
  { id: 3, name: "高一下", kind: "term", academic: 2, weeks: 18, exams: { 9: "mid", 17: "final" }, note: "选科确认、分班" },
  { id: 4, name: "高一暑假", kind: "holiday", academic: 2, weeks: 6, exams: {}, note: "最长的一个假期" },
  { id: 5, name: "高二上", kind: "term", academic: 3, weeks: 18, exams: { 9: "mid", 17: "final" }, note: "难度跃升、竞赛" },
  { id: 6, name: "高二寒假", kind: "holiday", academic: 3, weeks: 4, exams: {}, note: "春节、补课、赶进度" },
  { id: 7, name: "高二下", kind: "term", academic: 4, weeks: 18, exams: { 9: "mid", 17: "final" }, note: "合格考、一轮复习启动" },
  { id: 8, name: "高二暑假", kind: "holiday", academic: 4, weeks: 6, exams: {}, allowPreview: false, note: "新课已讲完，只剩复习" },
  { id: 9, name: "高三", kind: "term", academic: 5, weeks: 30, exams: { 10: "mock1", 18: "mock2", 24: "mock3", 28: "gaokao" }, note: "全年压缩成一个板块" },
];

export const TOTAL_WEEKS = STAGES.reduce((a, s) => a + s.weeks, 0);

export function termOfAcademic(academic: number): StageDef {
  return STAGES.find((s) => s.academic === academic && s.kind === "term") || STAGES[0];
}

export function stageStart(stage: number): number {
  let sum = 0;
  for (const s of STAGES) {
    if (s.id === stage) return sum + 1;
    sum += s.weeks;
  }
  return 1;
}