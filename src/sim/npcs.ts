import type { SubjectId } from "./types";

export type NpcTraits = { diligence: number; social: number; anxiety: number; ambition: number };

export type NpcDef = {
  id: string;
  name: string;
  kind: "classmate" | "teacher" | "parent";
  gender: "m" | "f" | "x";
  seat: string;
  line: string;
  traits: NpcTraits;
  start: { relation: number; mood: number };
  choice?: { first: "physics" | "history"; second: SubjectId[] };
  subject?: SubjectId;
  seatPos?: { col: number; row: number };
};

const T = (d: number, s: number, a: number, am: number): NpcTraits => ({ diligence: d, social: s, anxiety: a, ambition: am });

export const NPCS: NpcDef[] = [
  // 男生 6
  { id: "chenyu", name: "陈屿", kind: "classmate", gender: "m", seat: "同桌", seatPos: { col: 2, row: 1 }, line: "话少，草稿纸上永远画满格子。", traits: T(0.72, 0.28, 0.5, 0.6), start: { relation: 32, mood: 2 }, choice: { first: "physics", second: ["chemistry", "geography"] } },
  { id: "zhouyuan", name: "周予安", kind: "classmate", gender: "m", seat: "后桌", seatPos: { col: 1, row: 4 }, line: "竞赛生，聪明但偏科，经常熬夜。", traits: T(0.82, 0.36, 0.62, 0.92), start: { relation: 27, mood: -4 }, choice: { first: "physics", second: ["chemistry", "biology"] } },
  { id: "jiangye", name: "江野", kind: "classmate", gender: "m", seat: "靠门", seatPos: { col: 2, row: 4 }, line: "上课睡觉，下课打球，考试却能进前十。", traits: T(0.55, 0.8, 0.3, 0.4), start: { relation: 30, mood: 8 }, choice: { first: "physics", second: ["chemistry", "geography"] } },
  { id: "chengyiming", name: "程一鸣", kind: "classmate", gender: "m", seat: "斜后桌", seatPos: { col: 3, row: 5 }, line: "班长，做什么都很认真，包括记名字。", traits: T(0.85, 0.6, 0.55, 0.75), start: { relation: 28, mood: 3 }, choice: { first: "history", second: ["politics", "geography"] } },
  { id: "shaotian", name: "邵天成", kind: "classmate", gender: "m", seat: "最后一排", seatPos: { col: 5, row: 6 }, line: "总在最后一排，桌肚里藏着一把吉他。", traits: T(0.35, 0.75, 0.4, 0.3), start: { relation: 26, mood: 5 }, choice: { first: "history", second: ["politics", "geography"] } },
  { id: "xucheng", name: "许澄", kind: "classmate", gender: "m", seat: "讲台边", seatPos: { col: 4, row: 2 }, line: "安静，字很好看，作文常被当范文念。", traits: T(0.7, 0.35, 0.6, 0.55), start: { relation: 26, mood: -2 }, choice: { first: "history", second: ["politics", "geography"] } },
  // 女生 6
  { id: "linxiaoman", name: "林小满", kind: "classmate", gender: "f", seat: "斜前桌", seatPos: { col: 3, row: 2 }, line: "社团骨干，嗓门大，成绩中游。", traits: T(0.42, 0.9, 0.42, 0.5), start: { relation: 34, mood: 12 }, choice: { first: "history", second: ["politics", "geography"] } },
  { id: "hejia", name: "何嘉", kind: "classmate", gender: "f", seat: "隔壁班", line: "成绩很好，但每次提到家里就换话题。", traits: T(0.78, 0.5, 0.86, 0.7), start: { relation: 28, mood: -8 }, choice: { first: "history", second: ["politics", "chemistry"] } },
  { id: "suqing", name: "苏晴", kind: "classmate", gender: "f", seat: "前桌", seatPos: { col: 1, row: 1 }, line: "英语课代表，桌角贴着一张世界地图。", traits: T(0.75, 0.6, 0.55, 0.65), start: { relation: 30, mood: 4 }, choice: { first: "history", second: ["politics", "geography"] } },
  { id: "shenzhixia", name: "沈知夏", kind: "classmate", gender: "f", seat: "前排", seatPos: { col: 5, row: 3 }, line: "成绩一直在掉，但谁也不肯说为什么。", traits: T(0.5, 0.4, 0.9, 0.45), start: { relation: 26, mood: -10 }, choice: { first: "history", second: ["politics", "geography"] } },
  { id: "tangtang", name: "唐棠", kind: "classmate", gender: "f", seat: "后排", seatPos: { col: 4, row: 5 }, line: "体育生，800 米能跑进三分钟。", traits: T(0.45, 0.85, 0.35, 0.4), start: { relation: 29, mood: 9 }, choice: { first: "physics", second: ["biology", "geography"] } },
  { id: "wenyining", name: "温以宁", kind: "classmate", gender: "f", seat: "窗边", seatPos: { col: 6, row: 3 }, line: "总在窗边看书，声音轻得像怕吵到谁。", traits: T(0.8, 0.3, 0.62, 0.6), start: { relation: 27, mood: 0 }, choice: { first: "history", second: ["politics", "geography"] } },
  // 老师 4
  { id: "teacher_chen", name: "陈老师", kind: "teacher", gender: "m", seat: "班主任", line: "教数学，讲话慢，盯着你看的时候像在解题。", traits: T(0.9, 0.4, 0.5, 0.8), start: { relation: 50, mood: 0 }, subject: "math" },
  { id: "teacher_zhou", name: "周老师", kind: "teacher", gender: "f", seat: "语文老师", line: "念课文时会把眼镜摘下来。", traits: T(0.8, 0.55, 0.4, 0.6), start: { relation: 50, mood: 2 }, subject: "chinese" },
  { id: "teacher_lin", name: "林老师", kind: "teacher", gender: "f", seat: "英语老师", line: "上课只说英语，下课会说一句中文。", traits: T(0.75, 0.6, 0.45, 0.65), start: { relation: 48, mood: 3 }, subject: "english" },
  { id: "teacher_physics", name: "赵老师", kind: "teacher", gender: "m", seat: "物理老师", line: "讲题时喜欢把粉笔掰成两半。", traits: T(0.85, 0.45, 0.5, 0.7), start: { relation: 50, mood: 0 }, subject: "physics" },
  { id: "teacher_chemistry", name: "钱老师", kind: "teacher", gender: "f", seat: "化学老师", line: "实验课永远第一个到，手套戴得很慢。", traits: T(0.8, 0.5, 0.55, 0.65), start: { relation: 50, mood: 1 }, subject: "chemistry" },
  { id: "teacher_biology", name: "孙老师", kind: "teacher", gender: "f", seat: "生物老师", line: "讲话很轻，板书却写满一整面。", traits: T(0.75, 0.45, 0.5, 0.6), start: { relation: 48, mood: 1 }, subject: "biology" },
  { id: "teacher_politics", name: "李老师", kind: "teacher", gender: "m", seat: "政治老师", line: "总说“这个要背”，但从不检查。", traits: T(0.6, 0.55, 0.45, 0.55), start: { relation: 47, mood: 2 }, subject: "politics" },
  { id: "teacher_history", name: "吴老师", kind: "teacher", gender: "f", seat: "历史老师", line: "讲到近代会突然停下来喝水。", traits: T(0.7, 0.5, 0.55, 0.6), start: { relation: 49, mood: 0 }, subject: "history" },
  { id: "teacher_geography", name: "郑老师", kind: "teacher", gender: "m", seat: "地理老师", line: "上课爱画地球，画得歪也照画。", traits: T(0.65, 0.6, 0.4, 0.5), start: { relation: 48, mood: 3 }, subject: "geography" },
  // 家长
  { id: "mother", name: "母亲", kind: "parent", gender: "f", seat: "家里", line: "不太问成绩，但会把牛奶放在你桌上。", traits: T(0.6, 0.5, 0.7, 0.5), start: { relation: 60, mood: 0 } },
];

const pairOf = (c: number) => Math.ceil(c / 2);

export function relativeSeat(playerSeat: { col: number; row: number } | undefined, def: NpcDef) {
  if (!playerSeat || !def.seatPos) return def.seat;
  const { col, row } = def.seatPos;
  const dc = col - playerSeat.col;
  const dr = row - playerSeat.row;
  if (dr === 0 && dc === 0) return "你自己";
  if (dr === 0) {
    if (pairOf(col) === pairOf(playerSeat.col)) return "同桌";
    return dc > 0 ? "同排右侧" : "同排左侧";
  }
  if (dc === 0) {
    if (Math.abs(dr) === 1) return dr < 0 ? "前桌" : "后桌";
    return dr < 0 ? "前排远处" : "后排远处";
  }
  if (Math.abs(dc) === 1 && Math.abs(dr) === 1) {
    return (dr < 0 ? "斜前" : "斜后") + (dc > 0 ? "右" : "左");
  }
  return dr < 0 ? "前排远处" : "后排远处";
}

export const NPC_PROFILE: Record<string, string> = {
  chenyu: "话少，习惯用行动表达。冲突时先退让，但会记住。不擅长主动，被点名会先看别处。",
  zhouyuan: "聪明、好胜，对排名敏感。熬夜是他的常态，嘴上说无所谓，考砸会一个人待很久。",
  jiangye: "松弛，朋友多，考试前才发力但效果不差。不争，也不让人难堪。",
  chengyiming: "班长式的认真：点名、记名单、提醒交作业。规则感强，偶尔显得不近人情。",
  shaotian: "后排的吉他手，话不多但接得住梗。对成绩无所谓，对喜欢的事很执着。",
  xucheng: "安静，字好看，作文常被念。不擅长拒绝，也不太会主动开口。",
  linxiaoman: "嗓门大，社团里说得上话。情绪写在脸上，难过也不藏着，需要有人接住。",
  hejia: "成绩好，礼貌，但一提到家里就换话题。习惯自己扛，很难开口求助。",
  suqing: "英语课代表，桌角贴着世界地图。认真、好说话，喜欢把事做得体面。",
  shenzhixia: "这学期成绩一直在掉，但问起来只说没事。会突然安静，也会突然对一件小事很在意。",
  tangtang: "体育生，800 米能跑进三分钟。直来直去，讨厌拐弯抹角，答应的事一定做到。",
  wenyining: "窗边那个，声音轻，看书很投入。不主动，但会记得你说过的话。",
  teacher_chen: "教数学，讲话慢，盯着你看的时候像在解题。不轻易表扬，也不轻易放弃谁。",
  teacher_zhou: "念课文时会把眼镜摘下来。对学生耐心，对敷衍没耐心。",
  teacher_lin: "上课只说英语，下课会说一句中文。要求严，但会记得每个人的名字。",
  mother: "不太问成绩，但会把牛奶放在你桌上。担心的时候会反复做家务。",
};

export function traitsText(t: NpcTraits) {
  const pick = (v: number, hi: string, mid: string, lo: string) => (v >= 0.68 ? hi : v >= 0.42 ? mid : lo);
  return [
    pick(t.diligence, "很勤奋", "按部就班", "不太爱学"),
    pick(t.social, "外向", "不冷不热", "内向"),
    pick(t.anxiety, "容易紧张", "情绪平稳", "很钝"),
    pick(t.ambition, "目标感强", "有想法但不确定", "没什么打算"),
  ].join("、");
}

export const CLASSMATES = NPCS.filter((n) => n.kind === "classmate");
export const ADULTS = NPCS.filter((n) => n.kind !== "classmate");

export type BehaviorDef = {
  id: string;
  label: string;
  grade: number;
  stress: number;
  mood: number;
  weight: (t: NpcTraits) => number;
};

export const BEHAVIORS: BehaviorDef[] = [
  { id: "grind", label: "在刷题", grade: 2.1, stress: 3, mood: -1, weight: (t) => 0.6 + t.diligence * 2.4 },
  { id: "cram", label: "在补课", grade: 1.5, stress: 4, mood: -2, weight: (t) => 0.3 + t.ambition * 1.6 + t.anxiety * 0.8 },
  { id: "club", label: "在社团", grade: 0.1, stress: -3, mood: 4, weight: (t) => 0.2 + t.social * 2.0 },
  { id: "sport", label: "在打球", grade: 0, stress: -5, mood: 4, weight: (t) => 0.3 + t.social * 1.2 },
  { id: "slack", label: "在发呆", grade: -1.1, stress: -2, mood: 3, weight: (t) => 0.3 + (1 - t.diligence) * 1.8 },
  { id: "sleep", label: "在补觉", grade: -0.3, stress: -4, mood: 2, weight: (t) => 0.2 + t.anxiety * 1.1 },
  { id: "talk", label: "在聊天", grade: 0.2, stress: -2, mood: 3, weight: (t) => 0.2 + t.social * 1.0 },
];

export const NPC_MAP: Record<string, NpcDef> = NPCS.reduce((acc, n) => {
  acc[n.id] = n;
  return acc;
}, {} as Record<string, NpcDef>);