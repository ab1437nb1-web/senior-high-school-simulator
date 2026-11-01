// 验证：所有「主线」事件按条件固定触发——每个目标学段的窗口首周必定出现，且每个学段只出现一次。
// 先跑 node scripts/install-events.mjs 生成 .tmp/engine.mjs，再运行本脚本。
import { execFileSync } from "node:child_process";

execFileSync("npx", ["esbuild", "scripts/entry.ts", "--bundle", "--format=esm", "--platform=node", "--outfile=.tmp/engine.mjs"], { stdio: "inherit", shell: true });
const mod = await import("../.tmp/engine.mjs?" + Date.now());
const { EVENTS, STAGES, planWeekEvents, mulberry32 } = mod;

const mains = EVENTS.filter((e) => e.kind === "main");
console.log("主线事件数：" + mains.length);

// 期望触发表：id -> Set("stage:week")
// perStage 事件在每个目标学段触发一次；否则只在第一个目标学段触发一次（seen 标记全局）。
const expect = new Map();
for (const ev of mains) {
  const stages = ev.stage ? [ev.stage] : ev.stages ? ev.stages : STAGES.map((s) => s.id);
  const targets = ev.perStage ? stages : stages.slice(0, 1);
  const set = new Set();
  for (const st of targets) set.add(st + ":" + ev.weeks[0]);
  expect.set(ev.id, set);
}

const SEEDS = [1, 7, 42, 2026];
let fail = 0;

// 已知的历史遗留问题（非本轮新增）：列出后不阻断验证，但必须显式登记
// 2026-11-02：final-choice 与 briefing 已修复（移到高一上 15 周 / 12 周），登记清空。
const KNOWN = {};

for (const seed of SEEDS) {
  const rng = mulberry32(seed);
  const fired = new Map(); // id -> ["stage:weekInStage"]
  const state = {
    flags: {},
    stage: 0,
    week: 0,
    stats: { energy: 80, stress: 30, mood: 0, health: 80 },
    npcs: [],
    units: new Proxy({}, { get: () => ({ mastery: 50 }) }),
    romance: undefined,
    romanceBonus: [],
  };
  for (const st of STAGES) {
    state.stage = st.id;
    for (let w = 1; w <= st.weeks; w++) {
      state.week++;
      // 让带触发条件的主线也能命中：暧昧条件（confess-them）与恋爱低关系条件（love-drift）各给一个满足态
      state.romanceBonus = [{ week: state.week, amount: 2 }, { week: state.week, amount: 1 }];
      state.flags.lowRelWeeks = 5;
      state.npcs = [
        { id: "crush-x", relation: 95, friend: true },   // 满足 noRomance + 关系≥90 的主线
        { id: "lover-x", relation: 50, friend: true },   // 满足 romance + 低关系的主线
      ];
      state.socialTarget = "crush-x";
      state.romance = undefined;
      let evs = planWeekEvents(state, w, rng);
      // 第二轮：恋爱态（love-drift 类）
      state.romance = { npcId: "lover-x", since: 1, chance: 1 };
      state.socialTarget = "lover-x";
      state.flags = { ...state.flags };
      const evs2 = planWeekEvents(state, w, rng);
      state.romance = undefined;
      state.socialTarget = "crush-x";
      evs = evs.concat(evs2.filter((e) => e.kind === "main" && evs.indexOf(e) < 0));
      for (const ev of evs) {
        // 与 applyEventChoice 相同的已见标记
        state.flags["seen:" + ev.id + (ev.perStage ? "@" + state.stage : "")] = state.week;
        if (ev.kind === "main") {
          if (!fired.has(ev.id)) fired.set(ev.id, []);
          fired.get(ev.id).push(state.stage + ":" + w);
        }
      }
    }
  }
  for (const ev of mains) {
    const got = fired.get(ev.id) || [];
    const want = [...expect.get(ev.id)];
    const missing = want.filter((x) => !got.includes(x));
    const extra = got.filter((x) => !want.includes(x));
    if (missing.length || extra.length) {
      if (KNOWN[ev.id]) { console.log("种子 " + seed + " ⚠ 已知问题 " + ev.id + "「" + ev.title + "」：" + KNOWN[ev.id]); continue; }
      fail++;
      console.log("种子 " + seed + " ✗ " + ev.id + "「" + ev.title + "」 期望 [" + want.join(" ") + "] 实际 [" + got.join(" ") + "]");
    }
  }
}

// 主线不应出现在随机池：抽查若干周，确认返回结果里 kind=main 的数量只等于固定数
console.log(fail === 0 ? "全部主线事件在 4 个种子下均按固定周次触发，且无重复、无缺席。" : "存在 " + fail + " 处偏差。");

// 顺带打印主线时间轴
for (const st of STAGES) {
  const list = mains.filter((e) => (e.stage ? e.stage === st.id : !e.stages || e.stages.includes(st.id))).map((e) => e.weeks[0] + "周「" + e.title + "」");
  if (list.length) console.log("学段" + st.id + "（" + st.name + "）：" + list.join("、"));
}
process.exit(fail === 0 ? 0 : 1);
