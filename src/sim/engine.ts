import type {
  Choice, Difficulty, Fact, GameState, NarrativeLine, Plan, Slot, Stats, SubjectId, UnitState, WeekReport,
} from "./types";
import {
  ACTION_MAP, ALL_SUBJECTS, DAY_FOCUS_MAP, EDGES, STAGES, SUBJECT_MAP, TOTAL_WEEKS,
  unitEnterWeek, unitKey, unitLabel, unitsUpTo,
} from "./data";
import { EVENTS } from "./events";
import { BEHAVIORS, CLASSMATES, NPCS, NPC_MAP } from "./npcs";

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function rated(rng: () => number, lo: number, hi: number) {
  return lo + rng() * (hi - lo);
}

export const DECAY_K: Record<Difficulty, number> = { easy: 0.45, normal: 0.85, hard: 1.45 };
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: "轻松", normal: "标准", hard: "困难" };

export const CONFESS_MIN = 75;
export const CRUSH_MIN = 75; // 与表白线一致：能表白而未表白，才叫暧昧
export const REL_FLOOR = 25;

export function stageDef(stage: number) {
  return STAGES.find((s) => s.id === stage) || STAGES[0];
}

export function academicOf(state: GameState) {
  return stageDef(state.stage).academic;
}

export function isHoliday(state: GameState) {
  return stageDef(state.stage).kind === "holiday";
}

const NPC_CHOICE: Record<string, { first: "physics" | "history"; second: SubjectId[] }> = {
  chenyu: { first: "physics", second: ["chemistry", "geography"] },
  linxiaoman: { first: "history", second: ["politics", "geography"] },
  zhouyuan: { first: "physics", second: ["chemistry", "biology"] },
  hejia: { first: "history", second: ["politics", "chemistry"] },
};

export function newGame(choice: Choice, seed: number, difficulty: Difficulty = "normal", withNpcs = true, gender: "m" | "f" = "f", name = "", seat?: { col: number; row: number }): GameState {
  const rng = mulberry32(seed);
  const units: Record<string, UnitState> = {};
  const aptitude = {} as Record<SubjectId, number>;
  for (const s of ALL_SUBJECTS) {
    const meta = SUBJECT_MAP[s];
    aptitude[s] = rated(rng, 0.88, 1.12);
    for (let i = 0; i < meta.units.length; i++) {
      const unlocked = meta.units[i].stage <= 1;
      units[unitKey(s, i)] = {
        mastery: unlocked ? rated(rng, 14, 24) : 0,
        confusion: 0,
        primed: false,
        lastStudied: 0,
      };
    }
  }
  return {
    version: 2,
    seed,
    week: 1,
    totalWeeks: TOTAL_WEEKS,
    stage: 1,
    weekInStage: 1,
    difficulty,
    choice,
    stats: { energy: 100, stress: 42, mood: 0, health: 80 },
    focus: 1,
    units,
    aptitude,
    relations: { deskmate: 50, teacher: 50, mother: 60 },
    evidence: [],
    exams: [],
    flags: {},
    lastPlan: null,
    ended: false,
    evaluations: [],
    npcs: withNpcs
      ? NPCS.map((n, i) => ({
          id: n.id,
          kind: n.kind,
          relation: n.start.relation,
          last: n.kind === "classmate" ? "grind" : "idle",
          mood: n.start.mood,
          history: [] as string[],
          relTrace: [] as { w: number; v: number }[],
          game:
            n.kind === "classmate"
              ? newGame(n.choice || NPC_CHOICE[n.id] || { first: "physics", second: ["chemistry", "geography"] }, seed + 101 + i * 17, "normal", false)
              : undefined,
        }))
      : [],
    playerName: name,
    playerSeat: seat,
    choiceLocked: false,
    socialTarget: withNpcs ? CLASSMATES[0].id : undefined,
    socialTarget2: withNpcs && CLASSMATES[1] ? CLASSMATES[1].id : undefined,
    gender,
  };
}

// 交选科表：确定六科，非选科目按"上完了课"补到合格线附近并冻结
export function lockChoice(prev: GameState, choice: Choice): GameState {
  const s: GameState = JSON.parse(JSON.stringify(prev));
  s.choice = choice;
  s.choiceLocked = true;
  const chosen: SubjectId[] = ["chinese", "math", "english", choice.first, ...choice.second];
  for (const sub of ALL_SUBJECTS) {
    if (chosen.indexOf(sub) >= 0) continue;
    const meta = SUBJECT_MAP[sub];
    for (let i = 0; i < meta.units.length; i++) {
      if (meta.units[i].stage !== 1) continue;
      const k = unitKey(sub, i);
      s.units[k].mastery = Math.max(s.units[k].mastery, 35);
    }
  }
  return s;
}

export function adjacentIds(state: GameState): string[] {
  const seat = state.playerSeat;
  if (!seat) return [];
  const out: string[] = [];
  for (const n of state.npcs) {
    const def = NPC_MAP[n.id];
    const pos = def && def.seatPos;
    if (!pos) continue;
    const dc = Math.abs(pos.col - seat.col);
    const dr = Math.abs(pos.row - seat.row);
    if ((dr === 0 && dc === 1) || (dc === 0 && dr === 1) || (dr === 1 && dc === 1)) out.push(n.id);
  }
  return out;
}

export function testedSubjects(state: GameState): SubjectId[] {
  if (state.stage < 3) return ALL_SUBJECTS.slice();
  return ["chinese", "math", "english", state.choice.first, ...state.choice.second] as SubjectId[];
}

function other(e: { a: string; b: string }, key: string) {
  return e.a === key ? e.b : e.a;
}

export function transferInfo(state: GameState, key: string) {
  const self = state.units[key].mastery;
  let sum = 0;
  const sources: { key: string; w: number }[] = [];
  if (self < 10) return { mul: 1, sources, clash: null as null | { key: string; w: number } };
  for (const e of EDGES) {
    if (e.kind !== "transfer") continue;
    if (e.a !== key && e.b !== key) continue;
    const k = other(e, key);
    const m = state.units[k].mastery;
    if (m < 20) continue;
    const bonus = 0.12 * e.w * Math.max(0, (m - 20) / 80);
    sum += bonus;
    sources.push({ key: k, w: bonus });
  }
  let mul = Math.min(1.35, 1 + sum);
  if (state.units[key].primed) mul += 0.15;
  let clash: { key: string; w: number } | null = null;
  for (const e of EDGES) {
    if (e.kind !== "confusable") continue;
    if (e.a !== key && e.b !== key) continue;
    const k = other(e, key);
    const m = state.units[k].mastery;
    if (self >= 30 && self <= 70 && m >= 30 && m <= 70) {
      mul *= 0.85;
      clash = { key: k, w: e.w };
    }
  }
  return { mul, sources: sources.sort((x, y) => y.w - x.w), clash };
}

function effOf(stats: Stats, focus: number) {
  const e = clamp(0.35 + 0.65 * (stats.energy / 100), 0.25, 1);
  const sm = 1 - 0.35 * Math.pow((stats.stress - 45) / 50, 2);
  return e * clamp(sm, 0.55, 1) * focus;
}

// 已经教过、可以学也可以考的单元
export function enteredUnits(state: GameState, subject: SubjectId): number[] {
  const meta = SUBJECT_MAP[subject];
  const acad = academicOf(state);
  const out: number[] = [];
  for (let i = 0; i < meta.units.length; i++) {
    const u = meta.units[i];
    if (u.stage < acad) out.push(i);
    else if (u.stage === acad && (acad >= 5 || unitEnterWeek(subject, i) <= state.weekInStage)) out.push(i);
  }
  return out;
}

function pickUnit(state: GameState, subject: SubjectId) {
  const idxs = enteredUnits(state, subject);
  let best = idxs[0] || 0;
  let low = 999;
  for (const i of idxs) {
    const m = state.units[unitKey(subject, i)].mastery;
    if (m < low) { low = m; best = i; }
  }
  return { key: unitKey(subject, best), index: best };
}

export const REVIEW_FACTOR = 0.7;

// 高三：按整册（同 stage 的单元组）的平均掌握度挑最生的一组
function pickGroup(state: GameState, subject: SubjectId): number[] {
  const meta = SUBJECT_MAP[subject];
  const groups = new Map<number, number[]>();
  for (const i of unitsUpTo(subject, academicOf(state))) {
    const st = meta.units[i].stage;
    if (!groups.has(st)) groups.set(st, []);
    (groups.get(st) as number[]).push(i);
  }
  let best: number[] = [];
  let bestAvg = Infinity;
  for (const idxs of groups.values()) {
    const avg = idxs.reduce((a, i) => a + state.units[unitKey(subject, i)].mastery, 0) / idxs.length;
    if (avg < bestAvg) { bestAvg = avg; best = idxs; }
  }
  return best;
}


export const PASS_LINE = 55;

export function evaluateTerm(state: GameState, def: { id: number; name: string }): any {
  const from = (state.flags["evalFrom"] as number) || 1;
  const win = state.evidence.filter((e) => e.week > from);
  const byDim = { moral: 0, academic: 0, health: 0, art: 0, labor: 0 } as Record<string, number>;
  for (const e of win) byDim[e.dim] += e.value * (e.documented ? 1 : 0.6);

  const lastExam = state.exams[state.exams.length - 1];
  const academic = clamp(lastExam ? lastExam.total / 7.5 : 55, 0, 100);
  const moral = clamp(55 + byDim.moral * 2 + (state.relations.deskmate - 50) * 0.15, 0, 100);
  const health = clamp(state.stats.health * 0.6 + (100 - state.stats.stress) * 0.25 + 15 + byDim.health * 1.5, 0, 100);
  const art = clamp(50 + byDim.art * 2.5, 0, 100);
  const labor = clamp(50 + byDim.labor * 2.5, 0, 100);
  const score = moral * 0.25 + academic * 0.3 + health * 0.15 + art * 0.12 + labor * 0.18;

  state.flags["evalFrom"] = state.week;
  return {
    stageId: def.id,
    stageName: def.name,
    week: state.week,
    score: Math.round(score * 10) / 10,
    passed: score >= PASS_LINE,
    dims: {
      moral: Math.round(moral), academic: Math.round(academic),
      health: Math.round(health), art: Math.round(art), labor: Math.round(labor),
    },
  };
}


const NPC_SIGNAL: Record<string, string[]> = {
  grind: ["这周一直在刷题，草稿纸换了两本。", "课间也没抬头，笔尖一直在响。", "把错题本从头翻了一遍。"],
  cram: ["周末在补课，回来时整个人是木的。", "连着两天上课外班，眼睛是红的。", "说不想去，但还是去了。"],
  club: ["有几天泡在社团，回教室时嗓子是哑的。", "在排练，书包上还别着道具。", "忙着拉人报名，自己反倒没怎么学。"],
  sport: ["下午都在球场，晚自习一坐下就睡。", "球鞋放在桌下，一节课都没穿。", "说打球的时候什么都不用想。"],
  slack: ["趴在桌上发呆的时间比做题多。", "卷子摊开着，笔没动。", "看了半节课的窗外。"],
  sleep: ["最近总在补觉，说是晚上睡不着。", "第二节课就趴下了，叫都叫不醒。", "眼圈很重，说没事。"],
  talk: ["这周话很多，跟你说了一件事，说完又说算了。", "课间凑过来讲了个笑话，自己先笑。", "问你周末去哪，其实是想找人一起。"],
};

function npcPlan(npc: any, rng: () => number): Plan {
  const g = npc.game;
  const def = NPC_MAP[npc.id];
  const tr = def.traits;

  // 以"六科冲刺"为基线：这是一套被验证过能打到 600+ 的安排
  const six = ["chinese", "math", "english", g.choice.first, ...g.choice.second].slice(0, 6) as SubjectId[];
  const weakestOf = (list: SubjectId[]) => {
    let best = list[0];
    let low = 999;
    for (const s of list) {
      const idxs = unitsUpTo(s, g.stage);
      let sum = 0;
      for (const i of idxs) sum += g.units[unitKey(s, i)].mastery;
      const avg = sum / Math.max(1, idxs.length);
      if (avg < low) { low = avg; best = s; }
    }
    return best;
  };

  const slots: Slot[] = [];
  for (let i = 0; i < 5; i++) slots.push({ a: "study", s: six[i % six.length] });
  slots.push({ a: "study", s: six[1] }, { a: "study", s: six[0] }, { a: "review", s: six[3] }, { a: "rest" }, { a: "study", s: six[2] }, { a: "rest" });

  // 性格只做"微调"：用几个人性化的替换，而不是换一整套模板
  const divert = Math.round(1 + (1 - tr.diligence) * 5 + tr.social * 3 + (1 - tr.ambition) * 1.5);
  const picks = ["club", "sport", "talk", "slack", "sleep"];
  const weightOf = (id: string) =>
    id === "club" || id === "talk" ? 0.2 + tr.social * 2 : id === "sport" ? 0.2 + tr.social : id === "slack" ? 0.2 + (1 - tr.diligence) * 1.6 : 0.2 + tr.anxiety * 1.4;
  const totalW = picks.reduce((x, id) => x + weightOf(id), 0);

  for (let k = 0; k < Math.min(divert, 8); k++) {
    const idx = 1 + Math.floor(rng() * 10); // 保留第一个晚自习，从后面挑
    let r = rng() * totalW;
    let pick = picks[0];
    for (const id of picks) {
      r -= weightOf(id);
      if (r <= 0) { pick = id; break; }
    }
    const map: Record<string, Slot> = {
      club: { a: "club" }, sport: { a: "sport" }, talk: { a: "social" }, slack: { a: "entertain" }, sleep: { a: "rest" },
    };
    slots[idx] = map[pick];
  }

  const focus: Slot[] = Array.from({ length: 5 }, (_, i) => {
    if (i === 2 && tr.diligence < 0.6) return { a: "free" };
    return { a: "main", s: six[i % six.length] };
  });

  return { focus, evening: slots.slice(0, 5), weekend: slots.slice(5) };
}

export function relationTrend(npc: any, week: number) {
  const pts = (npc.relTrace || []).filter((p: any) => week - p.w <= 24);
  if (pts.length < 2) return "认识不久，关系还没定型";
  const a = pts[0];
  const b = pts[pts.length - 1];
  const d = b.v - a.v;
  const span = Math.max(1, b.w - a.w);
  const dir = d >= 12 ? "一直在升温" : d >= 4 ? "缓慢靠近" : d <= -12 ? "明显在疏远" : d <= -4 ? "有点冷下来" : "基本没变";
  return "从 " + Math.round(a.v) + " 到 " + Math.round(b.v) + "（" + span + " 周内" + dir + "）";
}

const PAIR_NEWS = [
  (a: string, b: string) => a + "和" + b + "最近总凑在一起。",
  (a: string, b: string) => a + "和" + b + "因为一道题吵了两句，又一起笑了。",
  (a: string, b: string) => a + "把笔记借给了" + b + "。",
  (a: string, b: string) => a + "和" + b + "在食堂拼了桌。",
  (a: string, b: string) => a + "和" + b + "这周没怎么说话。",
];

function tickSocial(state: GameState, rng: () => number) {
  const cls = state.npcs.filter((n) => n.kind === "classmate");
  state.npcPairs = state.npcPairs || {};
  state.npcCouples = state.npcCouples || [];
  state.npcNews = state.npcNews || [];
  const coupleOf = (id: string) => state.npcCouples!.find(([x, y]) => x === id || y === id);
  const key = (a: string, b: string) => (a < b ? a + "|" + b : b + "|" + a);
  const relOf = (a: string, b: string) => {
    const k = key(a, b);
    if (state.npcPairs![k] === undefined) {
      const da = NPC_MAP[a];
      const db = NPC_MAP[b];
      let sim = 0;
      for (const kk of ["diligence", "social", "anxiety", "ambition"] as const) sim += 1 - Math.abs(da.traits[kk] - db.traits[kk]);
      sim /= 4;
      // 初始就由性格决定：两人都外向 → 起点更高
      state.npcPairs![k] = Math.round(20 + sim * 25 + (da.traits.social + db.traits.social) * 8);
    }
    return state.npcPairs![k];
  };
  const pick = <T,>(arr: T[], w: (x: T) => number) => {
    const total = arr.reduce((s, x) => s + w(x), 0);
    let r = rng() * total;
    for (const x of arr) {
      r -= w(x);
      if (r <= 0) return x;
    }
    return arr[arr.length - 1];
  };

  // 同学主动找玩家：外向的人更常来搭话；玩家不主动社交时，关系会停在一个偏低的位置
  const PLAYER_NEWS = [
    (a: string) => a + "课间过来问你一道题。",
    (a: string) => a + "把多买的一瓶水放在你桌上。",
    (a: string) => a + "路过时拍了下你的桌子。",
    (a: string) => a + "问你周末去不去打球。",
  ];
  for (const npc of cls) {
    const d = NPC_MAP[npc.id];
    if (!d) continue;
    const p = 0.04 + d.traits.social * 0.2;
    if (rng() < p) {
      const gain = (0.15 + d.traits.social * 0.45) * (1 - npc.relation / 120);
      npc.relation = clamp(npc.relation + gain, 0, 100);
      if (rng() < 0.1) {
        const fn = PLAYER_NEWS[Math.floor(rng() * PLAYER_NEWS.length)];
        state.npcNews!.push({ week: state.week, text: fn(d.name) });
      }
    }
  }

  // 每周 3 次主动社交：谁发起由外向程度决定，找谁由对方的外向程度与已有关系决定
  for (let k = 0; k < 3; k++) {
    const a = pick(cls, (n) => 0.12 + (NPC_MAP[n.id]?.traits.social ?? 0.3) * 2.2);
    const others = cls.filter((x) => x.id !== a.id);
    if (!others.length) continue;
    const b = pick(others, (n) => {
      const d = NPC_MAP[n.id];
      const base = 0.15 + (d?.traits.social ?? 0.3) * 1.6;
      const have = relOf(a.id, n.id) / 160;
      const sameRow = d?.seatPos && NPC_MAP[a.id]?.seatPos && d.seatPos.row === NPC_MAP[a.id]!.seatPos!.row ? 0.35 : 0;
      return base + have + sameRow;
    });
    const da = NPC_MAP[a.id];
    const db = NPC_MAP[b.id];
    if (!da || !db) continue;
    const k2 = key(a.id, b.id);
    const prev = relOf(a.id, b.id);
    // 外向的人推进得快，且越熟越难再涨
    const gain = (0.9 + da.traits.social * 2.4) * (1 - prev / 110) + (da.traits.anxiety < 0.5 ? 0.3 : 0);
    const next = clamp(prev + gain + (rng() - 0.5) * 1.6, 0, 100);
    state.npcPairs![k2] = next;

    const pairGenderOk = da.gender !== db.gender;
    const bothSingle = !coupleOf(a.id) && !coupleOf(b.id);
    if (next >= 72 && pairGenderOk && bothSingle && rng() < 0.12) {
      state.npcCouples!.push([a.id, b.id]);
      state.npcNews!.push({ week: state.week, text: da.name + "和" + db.name + "在一起了。" });
      continue;
    }
    const pair = state.npcCouples!.find(([x, y]) => (x === a.id && y === b.id) || (x === b.id && y === a.id));
    if (pair && next < 55 && rng() < 0.25) {
      state.npcCouples = state.npcCouples!.filter((p) => p !== pair);
      state.npcNews!.push({ week: state.week, text: da.name + "和" + db.name + "分开了，谁也没说为什么。" });
      continue;
    }
    // 外向的人更容易制造"被人看见"的场面
    if (rng() < 0.08 + da.traits.social * 0.16) {
      const fn = PAIR_NEWS[Math.floor(rng() * PAIR_NEWS.length)];
      state.npcNews!.push({ week: state.week, text: fn(da.name, db.name) });
    }
  }
  if (state.npcNews!.length > 40) state.npcNews = state.npcNews!.slice(-40);
}

function tickNpcs(state: GameState, rng: () => number, lastId?: string) {
  let notable: { id: string; text: string } | null = null;
  let bestScore = -1;
  tickSocial(state, rng);
  for (const npc of state.npcs) {
    const isSocial = npc.id === state.socialTarget || npc.id === state.socialTarget2;
    if (!isSocial) {
      const floor = npc.kind === "classmate" ? REL_FLOOR : 45;
      if (npc.relation > floor) {
        const span = (npc.relation - floor) / (100 - floor);
        const decay = (npc.kind === "classmate" ? 0.9 : 0.5) * Math.pow(span, 1.3);
        npc.relation = Math.max(floor, npc.relation - decay);
      }
    }
    if (npc.kind === "classmate") {
      if (npc.relation >= 60) {
        npc.lowFriendWeeks = 0;
        if (!npc.friend) {
          npc.friend = true;
          npc.friendSince = state.week;
          state.npcNews!.push({ week: state.week, text: NPC_MAP[npc.id].name + "现在算你朋友了。" });
        }
      } else if (npc.friend) {
        npc.lowFriendWeeks = (npc.lowFriendWeeks || 0) + 1;
        if (npc.lowFriendWeeks >= 4) {
          npc.friend = false;
          npc.lowFriendWeeks = 0;
          state.npcNews!.push({ week: state.week, text: "你和" + NPC_MAP[npc.id].name + "好像又退回普通同学了。" });
        }
      }
    }
    if (state.week % 4 === 0) {
      npc.relTrace = npc.relTrace || [];
      npc.relTrace.push({ w: state.week, v: Math.round(npc.relation) });
      if (npc.relTrace.length > 24) npc.relTrace.shift();
    }
    if (npc.kind !== "classmate" || !npc.game) {
      npc.mood = clamp((npc.mood || 0) * 0.9 + (rng() - 0.5) * 4, -50, 50);
      if (npc.mood > 12 && npc.relation < 90) npc.relation = clamp(npc.relation + 0.3, 0, 100);
      continue;
    }
    const plan = npcPlan(npc, rng);
    const res = settleWeek(npc.game, plan, { npc: true });
    npc.game = res.state;
    const def = NPC_MAP[npc.id];
    const bid = plan.evening[0] ? behaviorOf(plan.evening[0]) : "grind";
    npc.last = bid;
    const score = (npc.game.exams.length ? 3 : 1) + npc.game.stats.stress / 5 + rng() * 6 + (lastId === npc.id ? -6 : 0);
    if (score > bestScore) {
      bestScore = score;
      const variants = NPC_SIGNAL[bid] || NPC_SIGNAL.grind;
      notable = { id: npc.id, text: def.seat + def.name + variants[Math.floor(rng() * variants.length)] };
    }
  }
  return notable;
}

function behaviorOf(slot: Slot): string {
  const map: Record<string, string> = { study: "grind", club: "club", sport: "sport", entertain: "slack", rest: "sleep", social: "talk", review: "grind" };
  return map[slot.a] || "grind";
}


export function playerTraits(state: GameState) {
  const s = (state.flags.cntStudy as number) || 1;
  const so = (state.flags.cntSocial as number) || 1;
  const r = (state.flags.cntRest as number) || 1;
  const total = s + so + r;
  const last = state.exams[state.exams.length - 1];
  return {
    diligence: s / total,
    social: so / total,
    anxiety: clamp(state.stats.stress / 100, 0, 1),
    ambition: clamp(last ? last.total / 750 : 0.4, 0, 1),
  };
}

export function compatibility(state: GameState, npcId: string) {
  const def = NPC_MAP[npcId];
  if (!def) return 0;
  const a = playerTraits(state);
  const b = def.traits;
  const keys: (keyof typeof a)[] = ["diligence", "social", "anxiety", "ambition"];
  let sim = 0, comp = 0;
  for (const k of keys) {
    sim += 1 - Math.abs(a[k] - b[k]);
    comp += 1 - Math.abs(a[k] - (1 - b[k]));
  }
  return clamp((0.6 * sim + 0.4 * comp) / keys.length, 0, 1);
}

export function canConfess(state: GameState, npcId: string) {
  const def = NPC_MAP[npcId];
  const npc = state.npcs.find((n) => n.id === npcId);
  if (!def || !npc || state.romance) return false;
  if (def.kind !== "classmate") return false;
  if ((state.npcCouples || []).some(([a, b]) => a === npcId || b === npcId)) return false;
  if (state.gender && def.gender !== "x" && def.gender === state.gender) return false;
  return npc.relation >= CONFESS_MIN;
}

export function tryConfess(state: GameState, npcId: string) {
  const npc = state.npcs.find((n) => n.id === npcId);
  if (!npc || !canConfess(state, npcId)) return { ok: false, chance: 0, roll: 1, text: "" };
  const compat = compatibility(state, npcId);
  const bonus = (state.romanceBonus || [])
    .filter((b) => state.week - b.week < 4)
    .reduce((acc, b) => acc + b.amount, 0);
  let chance = clamp(0.2 + compat * 0.45 + (npc.relation - CONFESS_MIN) * 0.006 + bonus * 0.12, 0.05, 0.95);
  if (npc.relation >= 90 && bonus >= 4) chance = 1;
  const roll = Math.random();
  const ok = roll < chance;
  const def = NPC_MAP[npcId];
  if (ok) {
    state.romance = { npcId, since: state.week, chance };
    npc.relation = clamp(npc.relation + 5, 0, 100);
  } else {
    npc.relation = clamp(npc.relation - 8, 0, 100);
  }
  return {
    ok, chance, roll,
    text: ok
      ? def.name + "愣了一下，说好。你们谁都没敢再看对方。"
      : def.name + "把笔放下，说：还是算了吧。",
  };
}

export function settleWeek(prev: GameState, plan: Plan, opts?: { npc?: boolean }): { state: GameState; report: WeekReport } {
  const isNpc = Boolean(opts && opts.npc);
  const state: GameState = JSON.parse(JSON.stringify(prev));
  const rng = mulberry32(prev.seed * 7919 + prev.week * 131);
  const focusMul = rated(rng, 0.92, 1.06);
  const seatMul = prev.playerSeat ? (prev.playerSeat.row <= 2 ? 1.03 : prev.playerSeat.row >= 5 ? 0.97 : 1) : 1;

  const gained: { subject: SubjectId; unit: string; amount: number }[] = [];
  const primedSet = new Set<string>();
  const clashedSet = new Set<string>();
  let minEnergy = state.stats.energy;
  let studyCount = 0;
  let restCount = 0;

  const runSlot = (slot: Slot, absorb: number, bonusSubject?: SubjectId) => {
    const act = ACTION_MAP[slot.a];
    if (!act) return;
    state.stats.energy = clamp(state.stats.energy - act.energy, -20, 100);
    state.stats.stress = clamp(state.stats.stress + act.stress, 0, 100);
    state.stats.mood = clamp(state.stats.mood + act.mood, -50, 50);
    state.stats.health = clamp(state.stats.health + act.health, 0, 100);
    const subject0 = (slot.s || "math") as SubjectId;
    const holidayBoost = isHoliday(state) && (act.topic === "social" || act.topic === "art" || act.topic === "labor" || act.topic === "sport") ? 1.5 : 1;
    if (act.relation) {
      state.relations.deskmate = clamp(state.relations.deskmate + act.relation * holidayBoost, 0, 100);
      state.relations.teacher = clamp(state.relations.teacher + (act.id === "club" || act.id === "volunteer" ? 1 : 0), 0, 100);
    }
    if (act.id === "preview") {
      const subject = subject0;
      const acad = academicOf(state);
      const nextStage = acad + 1;
      const meta = SUBJECT_MAP[subject];
      const idxs: number[] = [];
      meta.units.forEach((u, i) => { if (u.stage === nextStage) idxs.push(i); });
      if (idxs.length) {
        studyCount++;
        let best = idxs[0];
        let low = 999;
        for (const i of idxs) {
          const m = state.units[unitKey(subject, i)].mastery;
          if (m < low) { low = m; best = i; }
        }
        const key = unitKey(subject, best);
        const u = state.units[key];
        const gain = act.base * effOf(state.stats, focusMul) * state.aptitude[subject] * Math.pow(1 - u.mastery / 100, 0.6);
        u.mastery = clamp(u.mastery + gain, 0, 20);
        u.lastStudied = state.week;
        const prevGain = gained.find((g) => g.unit === key);
        if (prevGain) prevGain.amount += gain;
        else gained.push({ subject, unit: key, amount: gain });
      }
    } else if (act.id === "study" || act.id === "review") {
      studyCount++;
      const subject = (slot.s || "math") as SubjectId;

      const train = (key: string, scale: number) => {
        const u = state.units[key];
        const info = transferInfo(state, key);
        let mul = info.mul;
        if (bonusSubject && bonusSubject === subject) mul *= 1.1;
        const dim = Math.pow(1 - u.mastery / 100, 0.6);
        const teacher = state.npcs.find((x) => {
          const d = NPC_MAP[x.id];
          return d && d.subject === subject && x.relation >= 60;
        });
        const teacherBonus = teacher ? 1.05 : 1;
        const selfBase = act.base * 0.55;
        const fromClass = (classBonus[subject] || 0) * 0.9;
        const gain = (selfBase + fromClass) * effOf(state.stats, focusMul) * mul * state.aptitude[subject] * dim * absorb * scale * teacherBonus * seatMul;
        u.mastery = clamp(u.mastery + gain, 0, 100);
        u.lastStudied = state.week;
        const prevGain = gained.find((g) => g.unit === key);
        if (prevGain) prevGain.amount += gain;
        else gained.push({ subject, unit: key, amount: gain });
        for (const e of EDGES) {
          if (e.a !== key && e.b !== key) continue;
          const k = other(e, key);
          state.units[k].primed = true;
          primedSet.add(unitLabel(key) + "→" + unitLabel(k));
        }
        if (info.clash) {
          u.confusion = clamp(u.confusion + 6, 0, 100);
          state.units[info.clash.key].confusion = clamp(state.units[info.clash.key].confusion + 6, 0, 100);
          clashedSet.add(unitLabel(key) + " × " + unitLabel(info.clash.key));
        }
      };

      if (academicOf(state) >= 5) {
        // 高三：一次复习一整册，每个单元只拿 0.7 的收益
        for (const i of pickGroup(state, subject)) train(unitKey(subject, i), REVIEW_FACTOR);
      } else {
        const scale = isHoliday(state) && act.id === "study" ? 0.3 : 1;
        train(pickUnit(state, subject).key, scale);
      }
    } else if (act.topic === "rest") {
      restCount++;
      state.flags.cntRest = (state.flags.cntRest || 0) + 1;
    }
    if (act.topic === "social" || act.id === "social") {
      state.flags.cntSocial = (state.flags.cntSocial || 0) + 1;
      const adj = adjacentIds(state);
      const p1 = state.npcs.find((n) => n.id === state.socialTarget);
      const p2 = state.npcs.find((n) => n.id === state.socialTarget2);
      const dim = (r: number) => Math.max(0.15, 1 - r / 120);
      if (p1) p1.relation = clamp(p1.relation + (adj.indexOf(p1.id) >= 0 ? 3 : 1.5) * dim(p1.relation), 0, 100);
      if (p2 && p2 !== p1) p2.relation = clamp(p2.relation + (adj.indexOf(p2.id) >= 0 ? 1.5 : 0.8) * dim(p2.relation), 0, 100);
    }
    // 只有艺术 / 劳动留下"记录"；运动、休息只改状态，由状态间接影响综评
    if (act.topic === "art" || act.topic === "labor") {
      state.evidence.push({
        id: "ev-" + String(state.evidence.length + 1),
        dim: act.topic === "art" ? "art" : "labor",
        label: act.name + "（" + stageDef(state.stage).name + "第 " + String(state.weekInStage) + " 周）",
        value: (act.topic === "labor" ? 2 : 1) * (isHoliday(state) ? 2 : 1),
        week: state.week,
        documented: true,
      });
    }
    minEnergy = Math.min(minEnergy, state.stats.energy);
  };

  // 课堂：五天里每科被"上到"的程度（主攻科 +30%，趴桌 -30%，摸鱼 -25%…）
  const classAbsorb: Record<string, number> = {};
  for (const s of ALL_SUBJECTS) classAbsorb[s] = 0;
  for (let d = 0; d < 5; d++) {
    const f = plan.focus[d] || { a: "free" };
    const fm = DAY_FOCUS_MAP[f.a] || DAY_FOCUS_MAP.free;
    for (const s of ALL_SUBJECTS) {
      classAbsorb[s] += f.a === "main" ? (f.s === s ? 1.3 : 1.0) : fm.absorb;
    }
  }
  for (const s of ALL_SUBJECTS) classAbsorb[s] /= 5;

  const classBonus: Record<string, number> = {};
  if (!isHoliday(state)) {
    const acad = academicOf(state);
    for (const s of ALL_SUBJECTS) {
      const meta = SUBJECT_MAP[s];
      const idxs: number[] = [];
      for (let i = 0; i < meta.units.length; i++) if (meta.units[i].stage === acad) idxs.push(i);
      if (!idxs.length) { classBonus[s] = 0; continue; }
      let best = idxs[0];
      let low = 999;
      for (const i of idxs) {
        const m = state.units[unitKey(s, i)].mastery;
        if (m < low) { low = m; best = i; }
      }
      const gain = 4 * classAbsorb[s];
      const k = unitKey(s, best);
      state.units[k].mastery = clamp(state.units[k].mastery + gain, 0, 100);
      classBonus[s] = gain;
    }
  } else {
    for (const s of ALL_SUBJECTS) classBonus[s] = 0;
  }

  const today = state.stats;
  for (let d = 0; d < 5; d++) {
    const f = plan.focus[d] || { a: "free" };
    const meta = DAY_FOCUS_MAP[f.a] || DAY_FOCUS_MAP.free;
    if (f.a === "listen") { today.energy = clamp(today.energy - 8, 0, 100); today.stress = clamp(today.stress + 2, 0, 100); }
    if (f.a === "nap") {
      today.energy = clamp(today.energy + 12, 0, 100);
      if (rng() < 0.15) state.relations.teacher = clamp(state.relations.teacher - 3, 0, 100);
    }
    if (f.a === "slack") {
      today.energy = clamp(today.energy + 6, 0, 100);
      today.mood = clamp(today.mood + 6, -50, 50);
      if (rng() < 0.1) state.relations.teacher = clamp(state.relations.teacher - 2, 0, 100);
    }
    if (f.a === "social") state.relations.deskmate = clamp(state.relations.deskmate + 1, 0, 100);
    if (f.a === "duty") today.energy = clamp(today.energy - 6, 0, 100);
    if (f.a === "homework") state.flags.homework = (state.flags.homework || 0) + 1;
    const even = plan.evening[d];
    if (even) runSlot(even, meta.absorb, f.a === "main" ? f.s : undefined);
    today.energy = clamp(today.energy + 34, 0, 100);
    minEnergy = Math.min(minEnergy, today.energy);
  }
  for (const slot of plan.weekend) runSlot(slot, 1);

  state.stats.stress = clamp(state.stats.stress + 1 - Math.max(0, restCount - 2) * 1.4, 0, 100);
  state.stats.mood = clamp(state.stats.mood - Math.round((state.stats.stress - 55) / 35), -50, 50);
  state.stats.health = clamp(state.stats.health + (state.stats.stress > 70 ? -2 : 0.5), 0, 100);
  state.focus = clamp(0.7 + state.stats.health / 400 + (state.stats.energy > 60 ? 0.1 : 0), 0.6, 1.1);

  // 自然衰减：越熟练掉得越快；刚学过的单元当周不衰减
  const k = DECAY_K[state.difficulty] || DECAY_K.normal;
  const lockedNow = Boolean(state.choiceLocked);
  const frozen = (key: string) => {
    if (!lockedNow) return false;
    const sub = key.split(":")[0] as SubjectId;
    return !(sub === state.choice.first || state.choice.second.includes(sub) || sub === "chinese" || sub === "math" || sub === "english");
  };
  for (const key of Object.keys(state.units)) {
    if (frozen(key)) continue;
    const u = state.units[key];
    if (u.mastery <= 0) continue;
    const since = state.week - u.lastStudied;
    if (since <= 1) continue;
    const drop = k * Math.pow(u.mastery / 100, 1.4) * Math.min(3, since - 1) * 0.72;
    u.mastery = clamp(u.mastery - drop, 0, 100);
  }

  if (state.romance) {
    const partner = state.npcs.find((n) => n.id === state.romance!.npcId);
    if (partner) {
      const together = partner.id === state.socialTarget || partner.id === state.socialTarget2;
      partner.relation = clamp(partner.relation + (together ? 1.5 : -1), 0, 100);
      state.flags.lowRelWeeks = partner.relation < 70 ? ((state.flags.lowRelWeeks as number) || 0) + 1 : 0;
    }
  }

  if (state.romanceBonus && state.romanceBonus.length) {
    state.romanceBonus = state.romanceBonus.filter((b) => state.week - b.week < 4);
  }
  state.lastPlan = plan;
  for (const key of Object.keys(state.units)) if (state.units[key].primed) state.units[key].primed = false;

  const report: WeekReport = {
    week: state.week,
    facts: [],
    lines: [],
    study: studyCount,
    rest: restCount,
    minEnergy: Math.round(minEnergy),
    gained: gained.sort((a, b) => b.amount - a.amount),
    primed: Array.from(primedSet).slice(0, 3),
    clashed: Array.from(clashedSet),
  };

  const npcRng = mulberry32(prev.seed * 7919 + prev.week * 977 + 13);
  const npcNote = isNpc ? null : tickNpcs(state, npcRng, (state.flags["lastNpc"] as string) || undefined);
  if (npcNote) state.flags["lastNpc"] = npcNote.id;
  if (npcNote) report.npc = npcNote;

  const def = stageDef(state.stage);
  report.label = def.name + "第 " + String(state.weekInStage) + " 周";
  const examKind = def.exams[state.weekInStage];
  if (examKind) {
    const rec = runExam(state, examKind, rng);
    state.exams.push(rec);
    report.exam = rec;
  }

  // 高一下第 12 周：非选考科目的合格考，用高一上冻结下来的掌握度判定
  if (!isNpc && def.id === 3 && state.weekInStage === 12 && state.choiceLocked) {
    const chosen = testedSubjects(state);
    const list: { subject: string; pass: boolean }[] = [];
    for (const sub of ALL_SUBJECTS) {
      if (chosen.indexOf(sub) >= 0) continue;
      const meta = SUBJECT_MAP[sub];
      let sum = 0, cnt = 0;
      for (let i = 0; i < meta.units.length; i++) {
        if (meta.units[i].stage !== 1) continue;
        sum += state.units[unitKey(sub, i)].mastery;
        cnt++;
      }
      list.push({ subject: meta.name, pass: cnt > 0 && sum / cnt >= 30 });
    }
    report.qualify = list;
  }

  // 学期 + 假期结束时的综合评价（从「高一下 + 暑假」开始结算）
  const endingPeriod = state.weekInStage >= def.weeks;
  const evalPeriod = (def.kind === "holiday" && [4, 6, 8].indexOf(def.id) >= 0) || def.id === 9;
  if (!isNpc && endingPeriod && evalPeriod) {
    const ev = evaluateTerm(state, def);
    state.evaluations.push(ev);
    report.evaluation = ev;
    if (!ev.passed) {
      state.failed = true;
      state.ended = true;
      return { state, report };
    }
  }

  state.weekInStage += 1;
  state.week += 1;
  if (state.weekInStage > def.weeks) {
    const idx = STAGES.findIndex((x) => x.id === state.stage);
    if (idx >= 0 && idx < STAGES.length - 1) {
      report.stageChanged = { from: state.stage, to: STAGES[idx + 1].id };
      state.stage = STAGES[idx + 1].id;
      state.weekInStage = 1;
    } else {
      state.ended = true;
    }
  }
  return { state, report };
}

function z(p: number): number {
  if (p <= 0.0001) return -3.72;
  if (p >= 0.9999) return 3.72;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let q, r;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pl) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  q = p - 0.5;
  r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

export function phi(x: number) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function erf(x: number) {
  const s = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
  return s * y;
}

export function gradeOf(raw: number, mu: number, sigma: number) {
  const p = clamp(phi((raw - mu) / sigma), 0.0001, 0.9999);
  let name = "E", t1 = 30, t2 = 40, lo = 0, hi = 0.02;
  if (p >= 0.85) { name = "A"; t1 = 86; t2 = 100; lo = 0.85; hi = 0.9999; }
  else if (p >= 0.5) { name = "B"; t1 = 71; t2 = 85; lo = 0.5; hi = 0.85; }
  else if (p >= 0.15) { name = "C"; t1 = 56; t2 = 70; lo = 0.15; hi = 0.5; }
  else if (p >= 0.02) { name = "D"; t1 = 41; t2 = 55; lo = 0.02; hi = 0.15; }
  let y1 = clamp(mu + sigma * z(lo), 0, 100);
  let y2 = clamp(mu + sigma * z(hi), 0, 100);
  if (hi >= 0.9999) y2 = 100;
  if (y2 - y1 < 0.5) y2 = Math.min(100, y1 + 0.5);
  const x = ((raw - y1) / (y2 - y1)) * (t2 - t1) + t1;
  return { name, value: clamp(Math.round(x), 30, 100), p };
}

export function runExam(state: GameState, kind: string, rng: () => number) {
  const scores = [] as { subject: SubjectId; raw: number; final: number; graded?: number; grade?: string }[];
  const weakAll: { key: string; label: string; rate: number }[] = [];
  const subjects = testedSubjects(state);
  const diffs = [-1.2, 0, 1.2];
  const acad = academicOf(state);
  let form = 1;

  for (const s of subjects) {
    const meta = SUBJECT_MAP[s];
    // 只考“已经教过一阵”的单元（留两周消化）；旧学期的单元不硬切，按时间逐渐淡化
    const entered = enteredUnits(state, s);
    let pool = entered.filter((i) => {
      const st = meta.units[i].stage;
      if (st !== acad || acad >= 5) return true;
      return unitEnterWeek(s, i) <= state.weekInStage - 2;
    });
    if (!pool.length) pool = entered;
    const weights = pool.map((i) => {
      const st = meta.units[i].stage;
      if (acad >= 5) return st === 5 ? 2 : st === 4 ? 1.6 : 1;
      if (st === acad) return 1.4;
      const weeksSince = (acad - st - 1) * 18 + state.weekInStage;
      return Math.max(0.15, 0.6 - 0.02 * weeksSince);
    });
    const totalW = weights.reduce((x, y) => x + y, 0);
    const unitHit: Record<string, { hit: number; total: number }> = {};
    let hit = 0;
    let total = 0;
    for (let k = 0; k < 12; k++) {
      let r = rng() * totalW;
      let pick = 0;
      for (let i = 0; i < pool.length; i++) {
        r -= weights[i];
        if (r <= 0) { pick = i; break; }
      }
      const key = unitKey(s, pool[pick]);
      const theta = (state.units[key].mastery - 35) / 20;
      const b = diffs[k % 3];
      total++;
      const pCorrect = 1 / (1 + Math.exp(-1.7 * (theta - b)));
      const ok = rng() < pCorrect;
      if (ok) hit++;
      const rec = unitHit[key] || { hit: 0, total: 0 };
      rec.total++;
      if (ok) rec.hit++;
      unitHit[key] = rec;
    }
    for (const key of Object.keys(unitHit)) {
      weakAll.push({ key, label: unitLabel(key), rate: Math.round((unitHit[key].hit / unitHit[key].total) * 100) });
    }
    const noise = (rng() - 0.5) * 6;
    form = clamp(
      1 + (state.stats.energy - 55) * 0.0008 + state.stats.mood * 0.0006 - Math.max(0, state.stats.stress - 55) * 0.0008,
      0.95,
      1.05
    );
    let raw = clamp(((hit / total) * 100 + 5) * form + noise, 0, 100);
    if (s === "chinese" || s === "english") {
      const idxs = unitsUpTo(s, state.stage);
      const lastIdx = idxs.length ? idxs[idxs.length - 1] : 0;
      raw = clamp(raw + (state.units[unitKey(s, lastIdx)].mastery - 40) * 0.12, 0, 100);
    }
    const final = meta.full === 150 ? Math.round(raw * 1.5) : Math.round(raw);
    const row: any = { subject: s, raw: Math.round(raw), final };
    if (meta.graded) {
      const g = gradeOf(raw, meta.mu, meta.sigma);
      row.graded = g.value;
      row.grade = g.name;
      row.final = g.value;
    }
    scores.push(row);
  }
  const locked = Boolean(state.choiceLocked);
  const total = scores.reduce((acc, r) => {
    if (locked) {
      if (r.subject === "chinese" || r.subject === "math" || r.subject === "english") return acc + r.final;
      if (r.subject === state.choice.first || state.choice.second.includes(r.subject)) return acc + r.final;
      return acc;
    }
    return acc + r.final;
  }, 0);
  const max = locked ? 750 : 1050;
  const p = clamp(phi((total - 480) / 75), 0.01, 0.99);
  const weak = weakAll.sort((a, b) => a.rate - b.rate).slice(0, 3);
  return {
    week: state.week, kind, scores, total,
    percentile: Math.round(p * 100),
    classRank: clamp(Math.ceil((1 - p) * 48), 1, 48),
    weak,
    max,
    factor: Math.round(form * 1000) / 1000,
  };
}

export function fiveEdu(state: GameState) {
  const byDim = { moral: 0, academic: 0, health: 0, art: 0, labor: 0 } as Record<string, number>;
  for (const e of state.evidence) {
    const age = state.week - e.week;
    byDim[e.dim] += e.value * (e.documented ? 1 : 0.6) * Math.pow(0.98, age);
  }
  const academicFromExams = state.exams.length ? state.exams[state.exams.length - 1].total / 7.5 : 40;
  const academic = clamp(academicFromExams, 0, 100);
  const health = clamp(state.stats.health * 0.6 + (100 - state.stats.stress) * 0.4, 0, 100);
  const moral = clamp(55 + byDim.moral * 0.5 + (state.relations.deskmate - 50) * 0.2, 0, 100);
  const art = clamp(45 + byDim.art * 2.2, 0, 100);
  const labor = clamp(45 + byDim.labor * 2.4, 0, 100);
  return { moral, academic, health, art, labor };
}

export function buildReport(report: WeekReport, state: GameState): WeekReport {
  const facts: Fact[] = [];
  const push = (id: string, label: string) => facts.push({ id, label });
  push("week", report.label || stageDef(state.stage).name + " 第 " + String(state.weekInStage) + " 周");
  push("study", "本周学习 " + String(report.study) + " 段");
  push("rest", "休息 " + String(report.rest) + " 段");
  push("energy", "最低精力 " + String(report.minEnergy));
  push("stress", "周末压力 " + String(Math.round(state.stats.stress)));
  if (report.gained.length) {
    const top = report.gained[0];
    push("top", SUBJECT_MAP[top.subject].name + "·" + unitLabel(top.unit).split("·")[1] + " 涨了 " + String(Math.round(top.amount * 10) / 10));
  }
  if (report.primed.length) push("primed", report.primed[0]);
  if (report.clashed.length) push("clash", report.clashed[0]);
  if (report.npc) push("npc", report.npc.text);
  if (report.exam) {
    push("exam", examName(report.exam.kind) + " " + String(report.exam.total) + " 分，班级第 " + String(report.exam.classRank) + " 名");
  }
  const withFacts = { ...report, facts };
  return { ...withFacts, lines: templateNarrative(withFacts, state) };
}

export function examName(kind: string) {
  const map: Record<string, string> = { mid: "期中", final: "期末", mock1: "一模", mock2: "二模", mock3: "三模", gaokao: "高考" };
  return map[kind] || "考试";
}

export function templateNarrative(report: WeekReport, state: GameState): NarrativeLine[] {
  const lines: NarrativeLine[] = [];
  const weekLabel = report.label || stageDef(state.stage).name + "第 " + String(state.weekInStage) + " 周";
  lines.push({ text: weekLabel + "结束了。", cites: ["week"] });
  if (report.study >= 9) {
    lines.push({ text: "你把这周塞得很满：" + String(report.study) + " 段学习，最难熬的那天精力掉到 " + String(report.minEnergy) + "。", cites: ["study", "energy"] });
  } else if (report.study >= 5) {
    lines.push({ text: "这周不算拼，" + String(report.study) + " 段学习，进度勉强跟得上。", cites: ["study"] });
  } else {
    lines.push({ text: "这周你没怎么碰书，全周只有 " + String(report.study) + " 段学习。", cites: ["study"] });
  }
  if (report.gained.length) {
    const top = report.gained[0];
    lines.push({
      text: SUBJECT_MAP[top.subject].name + "那边动得最多：" + unitLabel(top.unit).split("·")[1] + "往前挪了 " + String(Math.round(top.amount * 10) / 10) + "。",
      cites: ["top"],
    });
  }
  if (report.primed.length) {
    lines.push({ text: "有些东西是连着的——你在这一科上花的时间，让另一科听起来没那么陌生了。", cites: ["primed"] });
  }
  if (report.clashed.length) {
    lines.push({ text: "也有麻烦：" + report.clashed[0] + " 开始互相干扰，你越学越觉得它们像，又越像越容易错。", cites: ["clash"] });
  }
  if (report.exam) {
    lines.push({
      text: examName(report.exam.kind) + "成绩下来：" + String(report.exam.total) + " 分，班级第 " + String(report.exam.classRank) + " 名。",
      cites: ["exam"],
    });
  }
  if (report.npc) {
    lines.push({ text: report.npc.text, cites: ["npc"] });
  }
  if (state.stats.stress > 70) {
    lines.push({ text: "晚上躺下的时候，脑子里还在过白天的题。", cites: ["stress"] });
  } else if (report.rest >= 4) {
    lines.push({ text: "你居然真的歇了 " + String(report.rest) + " 段，这在你身上不太常见。", cites: ["rest"] });
  }
  return lines;
}

export function planWeekEvents(state: GameState, weekInStage: number, rng: () => number, plan?: Plan) {
  const keyOf = (e: any) => "seen:" + e.id + (e.perStage ? "@" + state.stage : "");
  const seenAt = (e: any) => state.flags[keyOf(e)] as number | undefined;
  const inWindow = (e: any) => {
    if (e.stage && e.stage !== state.stage) return false;
    if (e.stages && e.stages.indexOf(state.stage) < 0) return false;
    return !e.weeks || (weekInStage >= e.weeks[0] && weekInStage <= e.weeks[1]);
  };

  const actions = new Set<string>();
  const focus = new Set<string>();
  if (plan) {
    for (const s of [...plan.evening, ...plan.weekend]) if (s && s.a) actions.add(s.a);
    for (const f of plan.focus) if (f && f.a) focus.add(f.a);
  }

  const socialNpc = state.npcs.find((n) => n.id === state.socialTarget);
  const fitsPlan = (e: any) => {
    const r = e.requires;
    if (!r) return true;
    if (r.romance && !state.romance) return false;
    if (r.noRomance && state.romance) return false;
    if (typeof r.minRelation === "number" && (!socialNpc || socialNpc.relation < r.minRelation)) return false;
    if (typeof r.bonusCount === "number") {
      const n = (state.romanceBonus || []).filter((b) => state.week - b.week < 4 && b.amount > 0).length;
      if (n < r.bonusCount) return false;
    }
    if (r.friend && !(socialNpc && socialNpc.friend)) return false;
    if (typeof r.lowRelWeeks === "number" && (((state.flags.lowRelWeeks as number) || 0) < r.lowRelWeeks)) return false;
    if (r.actions && r.actions.length && !r.actions.some((x: string) => actions.has(x))) return false;
    if (r.focus && r.focus.length && !r.focus.some((x: string) => focus.has(x))) return false;
    if (typeof r.minStress === "number" && state.stats.stress < r.minStress) return false;
    if (typeof r.maxStress === "number" && state.stats.stress > r.maxStress) return false;
    if (r.masteryBelow) {
      const meta = SUBJECT_MAP[r.masteryBelow.subject as SubjectId];
      if (!meta) return false;
      const idxs = unitsUpTo(r.masteryBelow.subject, state.stage);
      let sum = 0;
      for (const i of idxs) sum += state.units[unitKey(r.masteryBelow.subject, i)].mastery;
      if (sum / Math.max(1, idxs.length) >= r.masteryBelow.value) return false;
    }
    return true;
  };

  const fixed = EVENTS.filter((e) => e.kind === "main" && inWindow(e) && seenAt(e) === undefined && fitsPlan(e));
  const pool = EVENTS.filter((e) => {
    if (e.kind === "main" || !inWindow(e) || !fitsPlan(e)) return false;
    const at = seenAt(e);
    if (at === undefined) return true;
    if (e.once) return false;
    return state.week - at >= (e.cooldown || 2);
  });

  const target = Math.min(5, Math.max(3, 3 + (rng() < 0.55 ? 1 : 0) + (rng() < 0.25 ? 1 : 0)));
  const need = Math.max(0, target - fixed.length);
  const picks: any[] = [];
  const bag = pool.slice();
  const draw = (arr: any[]) => {
    const total = arr.reduce((acc, x) => acc + (x.weight || 1), 0);
    let r = rng() * total;
    let idx = 0;
    for (let i = 0; i < arr.length; i++) {
      r -= arr[i].weight || 1;
      if (r <= 0) { idx = i; break; }
    }
    return arr.splice(idx, 1)[0];
  };
  while (picks.length < need && bag.length) picks.push(draw(bag));
  if (picks.length < need) {
    const fallback = EVENTS.filter(
      (x) => x.kind !== "main" && inWindow(x) && fitsPlan(x) && picks.indexOf(x) < 0 && !(x.once && seenAt(x) !== undefined)
    );
    while (picks.length < need && fallback.length) picks.push(draw(fallback));
  }
  return [...picks, ...fixed];
}

export function applyEventChoice(prev: GameState, ev: any, choice: any): GameState {
  const s: GameState = JSON.parse(JSON.stringify(prev));
  s.flags["seen:" + ev.id + (ev.perStage ? "@" + s.stage : "")] = s.week;
  if (ev.kind === "npc") {
    const target = s.npcs.find((n) => n.id === (s.socialTarget || ""));
    if (target) {
      target.history.push("第 " + s.week + " 周「" + ev.title + "」：" + (choice.text || "") + " —— " + (choice.result || ""));
      if (target.history.length > 40) target.history.shift();
    }
  }
  const e = choice.effects || {};
  if (e.stats) {
    if (typeof e.stats.energy === "number") s.stats.energy = clamp(s.stats.energy + e.stats.energy, 0, 100);
    if (typeof e.stats.stress === "number") s.stats.stress = clamp(s.stats.stress + e.stats.stress, 0, 100);
    if (typeof e.stats.mood === "number") s.stats.mood = clamp(s.stats.mood + e.stats.mood, -50, 50);
    if (typeof e.stats.health === "number") s.stats.health = clamp(s.stats.health + e.stats.health, 0, 100);
  }
  if (e.mastery) {
    for (const m of e.mastery) {
      const meta = SUBJECT_MAP[m.subject as SubjectId];
      if (!meta) continue;
      for (const i of unitsUpTo(m.subject, academicOf(s))) {
        const k = unitKey(m.subject, i);
        s.units[k].mastery = clamp(s.units[k].mastery + m.amount, 0, 100);
      }
    }
  }
  if (e.relation) {
    for (const r of e.relation) {
      s.relations[r.who] = clamp(s.relations[r.who] + r.amount, 0, 100);
      const mapped =
        r.who === "mother" ? "mother" : r.who === "teacher" ? "teacher_chen"
        : ev.romance ? s.romance && s.romance.npcId : s.socialTarget;
      const npc = s.npcs.find((n) => n.id === mapped);
      if (npc) npc.relation = clamp(npc.relation + r.amount, 0, 100);
      if (ev.preRomance) {
        s.romanceBonus = s.romanceBonus || [];
        s.romanceBonus.push({ amount: r.amount * 0.5, week: s.week });
      }
    }
  }
  if (e.evidence) {
    s.evidence.push({
      id: "ev-" + String(s.evidence.length + 1),
      dim: e.evidence.dim,      label: e.evidence.label,
      value: typeof e.evidence.value === "number" ? e.evidence.value : 1,
      week: s.week,
      documented: true,
    });
  }
  if (e.romance && !s.romance && s.socialTarget) {
    const npc = s.npcs.find((n) => n.id === s.socialTarget);
    if (npc) {
      s.romance = { npcId: npc.id, since: s.week, chance: 1 };
      npc.relation = clamp(npc.relation + 5, 0, 100);
    }
  }
  if (e.breakup && s.romance) {
    const partner = s.npcs.find((n) => n.id === (s.romance as any).npcId);
    if (partner) {
      partner.relation = Math.min(partner.relation, 18);
      s.flags.exPartner = partner.id;
    }
    delete s.romance;
    s.flags.lowRelWeeks = 0;
  }
  if (e.choice) {
    s.choice = { first: e.choice.first, second: e.choice.second.slice(0, 2) };
    if (e.penalty) {
      for (const sub of e.penalty) {
        const meta = SUBJECT_MAP[sub as SubjectId];
        if (!meta) continue;
        for (let i = 0; i < meta.units.length; i++) {
          const k = unitKey(sub, i);
          s.units[k].mastery = clamp(s.units[k].mastery * 0.7, 0, 100);
        }
      }
    }
  }
  return s;
}
