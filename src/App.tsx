import { useEffect, useState } from "react";
import Setup from "./ui/Setup";
import WeekBoard from "./ui/WeekBoard";
import { Archive, ChoiceWizard, ConfessSheet, EventSheet, ExamView, NpcPanel, Report, SeatMap, Settings, StarMap } from "./ui/panels";
import { applyEventChoice, buildReport, examName, isHoliday, lockChoice, mulberry32, newGame, planWeekEvents, playerCompetitionAward, qiangjiScore, relationTrend, reshuffleAfterPlayer, reshuffleBeforePlayer, romanceScene, settleWeek, stageDef, tryConfess } from "./sim/engine";
import { PRESETS } from "./sim/data";
import { defaultAi, loadAi, proxyHealth, renderEventScene, rewriteReport, saveAi } from "./ai";
import { buildEventPrompt } from "./sim/events";
import type { AiConfig } from "./ai";
import { NPC_MAP, NPC_PROFILE, relativeSeat, traitsText } from "./sim/npcs";
import { clearSlot, listSlots, loadSlot, saveSlot } from "./save";
import type { SlotMeta } from "./save";
import type { Choice, GameState, Plan, Slot, WeekReport } from "./sim/types";

const SAVE = "hs-life-sim.save.v2";

function pad<T>(arr: T[], n: number, fill: T): T[] {
  const out = arr.slice(0, n);
  while (out.length < n) out.push(fill);
  return out;
}

function fillPlan(p: any): Plan {
  return {
    focus: pad<Slot>(p.focus || [], 5, { a: "free" }),
    evening: pad<Slot>(p.evening || [], 5, { a: "study", s: "math" }),
    weekend: pad<Slot>(p.weekend || [], 6, { a: "rest" }),
  };
}

function buildPlan(id: string, choice: Choice): Plan {
  const preset = PRESETS.find((p) => p.id === id) || PRESETS[0];
  return fillPlan(preset.build(choice));
}

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [presetId, setPresetId] = useState("balanced");
  const [view, setView] = useState<"week" | "map" | "exam" | "archive" | "npc">("week");
  const [report, setReport] = useState<WeekReport | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [ai, setAi] = useState<AiConfig>(defaultAi());
  const [aiReady, setAiReady] = useState(false);
  const [ended, setEnded] = useState(false);
  const [slots, setSlots] = useState<SlotMeta[]>([]);
  const [confession, setConfession] = useState<null | { text: string; ok: boolean; chance: number }>(null);
  const [confessScene, setConfessScene] = useState<null | { npcId: string; title: string; text: string }>(null);
  const [interview, setInterview] = useState<null | { sessions: number }>(null);
  const [resitOpen, setResitOpen] = useState(false);
  const [scene, setScene] = useState<null | { key: string; text: string; ai: boolean }>(null);
  const [pending, setPending] = useState<{ events: any[]; index: number; chosen: any } | null>(null);
  const [working, setWorking] = useState<GameState | null>(null);

  useEffect(() => {
    setSlots(listSlots());
    setAi(loadAi());
    const raw = localStorage.getItem(SAVE);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.game) {
        setGame(data.game);
        setPlan(fillPlan(data.plan || buildPlan("balanced", data.game.choice)));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (game && plan) localStorage.setItem(SAVE, JSON.stringify({ game, plan }));
  }, [game, plan]);

  useEffect(() => {
    let alive = true;
    if (ai.source === "proxy") {
      proxyHealth(ai.baseUrl).then((h) => { if (alive) setAiReady(Boolean(h && h.hasKey)); });
    } else {
      setAiReady(Boolean(ai.apiKey));
    }
    return () => { alive = false; };
  }, [ai]);

  const start = (choice: Choice, difficulty: any, gender: "m" | "f" = "f", name = "", seat?: { col: number; row: number }, realMode = true) => {
    const seed = (Date.now() % 100000000) + 1;
    const g = newGame(choice, seed, difficulty, true, gender, name, seat, realMode);
    setGame(g);
    setPlan(buildPlan("balanced", choice));
    setPresetId("balanced");
    setView("week");
    setEnded(false);
  };

  const finishWeek = (base: GameState) => {
    if (!plan) return;
    const res = settleWeek(base, plan);
    const rep = buildReport(res.report, res.state);
    setGame(res.state);
    setReport(rep);
    setPlan(fillPlan(res.state.lastPlan));
    if (res.state.ended) setEnded(true);
  };

  const commit = () => {
    if (!game || !plan) return;
    const evs = planWeekEvents(game, game.weekInStage, mulberry32(game.seed * 31 + game.week * 17), plan);
    if (evs.length) {
      setWorking(game);
      setPending({ events: evs, index: 0, chosen: null });
      return;
    }
    finishWeek(game);
  };

  useEffect(() => {
    if (!pending || !aiReady || !game) return;
    const ev: any = pending.events[pending.index];
    // 恋爱专属链是长文本，交给 AI 会被压成两句，直接跳过
    if (!ev || !ev.social || ev.chainNpc) return;
    const key = ev.id + "@" + pending.index + "@" + game.week;
    if (scene && scene.key === key) return;
    const def = game.socialTarget ? NPC_MAP[game.socialTarget] : null;
    const npc = game.npcs.find((n) => n.id === game.socialTarget);
    let alive = true;
    renderEventScene(ai, buildEventPrompt(ev, {
      name: def ? def.name : "同桌",
      persona: def ? NPC_PROFILE[def.id] || def.line : "",
      traits: def ? traitsText(def.traits) : "",
      relation: npc ? npc.relation : undefined,
      trend: npc ? relationTrend(npc, game.week) : "",
      history: npc ? npc.history : [],
      recent: npc && npc.history.length ? npc.history.slice(-3) : [],
    })).then((text) => {
      if (alive && text) setScene({ key, text, ai: true });
    });
    return () => { alive = false; };
  }, [pending && pending.index, game && game.socialTarget, aiReady]);

  const chooseEvent = (choice: any) => {
    if (!pending) return;
    const ev = pending.events[pending.index];
    const next = applyEventChoice(working || (game as GameState), ev, choice);
    setWorking(next);
    setPending({ ...pending, chosen: choice });
  };

  const nextEvent = () => {
    if (!pending) return;
    if (pending.chosen && pending.chosen.effects && pending.chosen.effects.resit && !resitOpen) {
      const base = working || (game as GameState);
      const g = reshuffleBeforePlayer(JSON.parse(JSON.stringify(base)), mulberry32(base.week * 13 + 7));
      setGame(g);
      setWorking(g);
      setResitOpen(true);
      return;
    }
    if (pending.index + 1 < pending.events.length) {
      setPending({ ...pending, index: pending.index + 1, chosen: null });
      return;
    }
    const base = working || (game as GameState);
    setPending(null);
    setWorking(null);
    finishWeek(base);
  };

  const closeReport = () => {
    setReport(null);
  };

  const restart = () => {
    localStorage.removeItem(SAVE);
    setGame(null);
    setPlan(null);
    setReport(null);
    setEnded(false);
    setView("week");
  };

  const saveTo = (i: number) => {
    if (!game || !plan) return;
    saveSlot(i, game, plan);
    setSlots(listSlots());
  };

  const loadFrom = (i: number) => {
    const data = loadSlot(i);
    if (!data) return;
    setGame(data.game);
    setPlan(fillPlan(data.plan));
    setReport(null);
    setEnded(false);
    setView("week");
  };

  const removeSlot = (i: number) => {
    clearSlot(i);
    setSlots(listSlots());
  };

  const actions = { slots, onSave: saveTo, onLoad: loadFrom, onDelete: removeSlot, onRestart: restart };

  const saveConfig = (c: AiConfig) => {
    setAi({ ...c });
    saveAi(c);
  };

  if (!game || !plan) {
    return (
      <div className="app">
        <Setup onStart={start} slots={slots} onLoad={loadFrom} />
      </div>
    );
  }

  if (ended && !report) {
    if (game.failed) {
      const ev = game.evaluations[game.evaluations.length - 1];
      return (
        <div className="app">
          <main>
            <h2 className="section">综合评价 · 不合格</h2>
            <div className="card" style={{ borderColor: "#a8452c" }}>
              <div className="serif" style={{ fontSize: 22 }}>{ev ? ev.stageName : ""} 综合评价不合格</div>
              <p className="narr" style={{ marginTop: 10 }}>
                {ev ? ev.score + " 分，低于合格线 55。" : ""}
                学籍没保住。你甚至没走到高三。
              </p>
              <p className="small muted">
                五育不是五个装饰条：思想品德、学业、健康、艺术、劳动实践，任何一块长期空缺都会被记下来。
              </p>
            </div>
            <Archive state={game} actions={actions} />
            <button className="btn" style={{ marginTop: 16 }} onClick={restart}>再来一局</button>
          </main>
        </div>
      );
    }

    const comp = playerCompetitionAward(game);
    if (comp && (comp.level === "决赛金牌" || comp.level === "国集")) {
      return (
        <div className="app">
          <main>
            <h2 className="section">竞赛 · 结束</h2>
            <div className="card">
              <div className="serif" style={{ fontSize: 22 }}>提前结束的高三</div>
              <p className="narr">
                {comp.level === "国集" ? "国家集训队名单出来那天，班主任在班上念了你的名字。" : "决赛的金牌挂在脖子上，比想象中轻。"}
                从那天起，你的高三就提前结束了：不用再刷那套永远刷不完的卷子，不用再盯着排名表。
              </p>
              <p className="small">
                保送的录取通知书来得比高考早三个月。同学们还在教室里做题，你偶尔回去，坐在最后一排，听一节课。
              </p>
              <p className="small muted">
                你后来才明白，这条路不是捷径，只是把三年的力气提前用完了。空下来的那些下午，比考试更难过。
              </p>
            </div>
            <Archive state={game} actions={actions} />
            <button className="btn" style={{ marginTop: 16 }} onClick={restart}>再来一局</button>
          </main>
        </div>
      );
    }

    if (game.qiangji) {
      const lastExam = game.exams[game.exams.length - 1];
      const gaokao = lastExam ? lastExam.total : 0;
      const best = (game.competition && game.competition.history || []).reduce((acc: string, h: any) => {
        const order = ["省三", "省二", "省一", "省队", "决赛银牌"];
        return order.indexOf(h.level) > order.indexOf(acc) ? h.level : acc;
      }, "");
      if (!interview) {
        return (
          <div className="app">
            <main>
              <h2 className="section">强基 · 校测准备</h2>
              <div className="card">
                <p className="narr">高考结束了，强基的校测还有两周。你可以把这两周全部用来准备，也可以留一点给自己。</p>
                <p className="small muted">高考 {gaokao} 分，按 75% 折算；校测满分 25 分，训练越多越高，竞赛奖项另加。</p>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <button className="btn" onClick={() => setInterview({ sessions: 12 })}>两周全部训练（12 次）</button>
                <button className="chip" onClick={() => setInterview({ sessions: 6 })}>训练一半（6 次）</button>
                <button className="chip" onClick={() => setInterview({ sessions: 0 })}>不训练，休息</button>
              </div>
            </main>
          </div>
        );
      }
      const sc = qiangjiScore(gaokao, interview.sessions, best);
      const admitted = sc.composite >= 60;
      return (
        <div className="app">
          <main>
            <h2 className="section">强基计划 · 结束</h2>
            <div className="card">
              <div className="serif" style={{ fontSize: 22 }}>{admitted ? "基础学科的那间教室" : "差了一点"}</div>
              <p className="narr">
                高考 {gaokao} 分 → 折算 {sc.gaokaoPart.toFixed(1)} / 75；
                校测 {sc.interview.toFixed(1)} / 25（训练 {interview.sessions} 次，竞赛加成 {best || "无"}）。
                综合 {sc.composite.toFixed(1)} 分。
              </p>
              <p className="small">
                {admitted
                  ? "录取通知书上写着基础学科的名字。你会在那里读很多年书，比高三还长。"
                  : "综合分没到 60。你回到了高考的录取流程，强基这一段就此收尾。"}
              </p>
              <p className="small muted">
                {admitted ? "面试时老师问你为什么选这个方向，你说因为喜欢，不是因为好就业。他笑了。" : "强基没成，但那两周的准备并没有白费。"}
              </p>
            </div>
            <Archive state={game} actions={actions} />
            <button className="btn" style={{ marginTop: 16 }} onClick={restart}>再来一局</button>
          </main>
        </div>
      );
    }

    const last = game.exams[game.exams.length - 1];
    const total = last ? last.total : 0;
    const lastEval = game.evaluations[game.evaluations.length - 1];
    const zongping = lastEval && lastEval.score >= 80;
    const composite = zongping ? Math.round(total * 0.6 + (lastEval.score / 100) * 750 * 0.4) : total;
    const score = zongping ? composite : total;
    const tier = score >= 660 ? "清北 / C9" : score >= 620 ? "985" : score >= 575 ? "211" : score >= 520 ? "一本" : score >= 450 ? "二本" : "专科";
    return (
      <div className="app">
        <main>
          <h2 className="section">高考 · 结束</h2>
          <div className="card">
            <div className="serif" style={{ fontSize: 22 }}>{zongping ? "综合评价招生" : "高考结束"}</div>
            <p className="narr">
              {last ? examName(last.kind) + " " + total + " 分，班级第 " + last.classRank + " 名。" : "三年结束了。"}
              {zongping ? " 你走了综合评价：" + lastEval.score + " 分的综评折算后，综合分 " + composite + "。" : ""}
            </p>
            <p className="small">
              按这个分数，大致在 <b>{tier}</b> 这一档。
            </p>
            <p className="small muted">
              你会在很久以后才发现，记得最清楚的不是分数，是某个下午的走廊。
            </p>
          </div>
          <Archive state={game} actions={actions} />
          <button className="btn" style={{ marginTop: 16 }} onClick={restart}>再来一局</button>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="top">
        <div className="topline">
          <div className="week">
            {stageDef(game.stage).name}<small>第 {game.weekInStage} / {stageDef(game.stage).weeks} 周</small>
          </div>
          <button className="chip" onClick={() => setShowSettings(!showSettings)}>设置</button>
        </div>
        <div className="stats">
          <div className="stat">精力
            <span className={"bar" + (game.stats.energy < 25 ? " low" : "")}><i style={{ width: Math.max(0, game.stats.energy) + "%" }} /></span>
            <span className="mono">{Math.round(game.stats.energy)}</span>
          </div>
          <div className="stat">压力
            <span className={"bar" + (game.stats.stress > 78 ? " low" : "")}><i style={{ width: game.stats.stress + "%" }} /></span>
            <span className="mono">{Math.round(game.stats.stress)}</span>
          </div>
          <div className="stat">心情 <span className="mono">{Math.round(game.stats.mood)}</span></div>
        </div>
      </header>

      <main>
        {showSettings ? <Settings config={ai} onSave={saveConfig} onClose={() => setShowSettings(false)} /> : null}
        {view === "week" && !showSettings ? (
          <WeekBoard
            plan={plan}
            choice={game.choice}
            presetId={presetId}
            canCopy={!!game.lastPlan}
            npcs={game.npcs
              .filter((n) => n.kind === "classmate")
              .map((n) => ({
                id: n.id,
                name: NPC_MAP[n.id]?.name || n.id,
                seat: NPC_MAP[n.id] ? relativeSeat(game.playerSeat, NPC_MAP[n.id]) : "",
              }))}
            socialTarget={game.socialTarget}
            socialTarget2={game.socialTarget2}
            onTarget={(id) => setGame({ ...game, socialTarget: id })}
            onTarget2={(id) => setGame({ ...game, socialTarget2: id })}
            holiday={isHoliday(game)}
            allowPreview={stageDef(game.stage).allowPreview !== false}
            onChange={setPlan}
            onCopy={() => { if (game.lastPlan) setPlan(fillPlan(game.lastPlan)); }}
            onPreset={(id) => { setPresetId(id); setPlan(buildPlan(id, game.choice)); }}
          />
        ) : null}
        {view === "map" && !showSettings ? <StarMap state={game} /> : null}
        {view === "exam" && !showSettings ? <ExamView state={game} /> : null}
        {view === "archive" && !showSettings ? <Archive state={game} actions={actions} /> : null}
        {view === "npc" && !showSettings ? (
          <NpcPanel
            state={game}
            onConfess={(id: string) => {
              const scene = romanceScene(game, id, "b");
              if (scene) {
                setConfessScene({ npcId: id, title: scene.title, text: scene.text });
                return;
              }
              const next: any = JSON.parse(JSON.stringify(game));
              const r = tryConfess(next, id);
              setGame(next);
              setConfession({ text: r.text, ok: r.ok, chance: r.chance });
            }}
          />
        ) : null}
      </main>

      {view === "week" && !showSettings ? (
        <div className="footer-bar" style={{ bottom: 54 }}>
          <button className="btn" onClick={commit}>过完这一周 →</button>
        </div>
      ) : null}

      <nav className="tabs">
        {([["week", "本周"], ["map", "星图"], ["exam", "成绩"], ["npc", "同学"], ["archive", "档案"]] as const).map(([k, label]) => (
          <button key={k} className={"tab" + (view === k ? " on" : "")} onClick={() => { setView(k as any); setShowSettings(false); }}>
            {label}
          </button>
        ))}
      </nav>

      {pending ? (
        <EventSheet
          text={scene && pending && scene.key === pending.events[pending.index].id + "@" + pending.index + "@" + game.week ? scene.text : undefined}
          aiText={Boolean(scene && pending && scene.key === pending.events[pending.index].id + "@" + pending.index + "@" + game.week)}
          event={(() => {
            const ev = pending.events[pending.index];
            if (!ev) return ev;
            const target = game.socialTarget ? NPC_MAP[game.socialTarget] : null;
            const partner = game.romance ? NPC_MAP[game.romance.npcId] : null;
            const byKind =
              ev.npcKind === "parent" ? "母亲"
              : ev.npcKind === "teacher" ? "陈老师"
              : ev.romance && partner ? partner.name
              : target ? target.name : "同桌";
            const text = ev.text.split("{npc}").join(byKind).split("同桌").join(byKind);
            return { ...ev, text };
          })()}
          chosen={pending.chosen}
          index={pending.index}
          total={pending.events.length}
          onChoose={chooseEvent}
          onNext={nextEvent}
        />
      ) : null}

      {game.stage >= 2 && !game.choiceLocked ? (
        <ChoiceWizard name={game.playerName} onConfirm={(c) => setGame(lockChoice(game, c as any))} />
      ) : null}

      {resitOpen ? (
        <div className="overlay">
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2 className="section" style={{ margin: 0 }}>换到哪去</h2>
            <p className="small muted" style={{ marginTop: 6 }}>点一个空位。换过去之后，够得着的人就变了。</p>
            <SeatMap
              npcs={game.npcs as any[]}
              playerSeat={game.playerSeat}
              seats={game.seats}
              onPick={(s) => {
                const base = { ...(working || game), playerSeat: s } as GameState;
                const g = reshuffleAfterPlayer(base, mulberry32(base.week * 29 + 11));
                setGame(g);
                setWorking(g);
                setResitOpen(false);
                setPending(pending ? { ...pending, chosen: { ...pending.chosen, effects: { ...pending.chosen.effects, resit: false } } } : null);
              }}
            />
          </div>
        </div>
      ) : null}

      {confessScene ? (
        <ConfessSheet
          title={confessScene.title}
          text={confessScene.text}
          onCancel={() => setConfessScene(null)}
          onConfirm={() => {
            const next: any = JSON.parse(JSON.stringify(game));
            const r = tryConfess(next, confessScene.npcId);
            if (r.ok) next.chains = { ...(next.chains || {}), [confessScene.npcId]: 8 };
            setGame(next);
            setConfessScene(null);
            setConfession({ text: r.text, ok: r.ok, chance: r.chance });
          }}
        />
      ) : null}

      {confession ? (
        <div className="overlay" onClick={() => setConfession(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2 className="section" style={{ margin: 0 }}>{confession.ok ? "她说好" : "她说算了"}</h2>
            <p className="narr" style={{ marginTop: 10 }}>{confession.text}</p>
            <p className="small muted">当时的把握：{Math.round(confession.chance * 100)}%</p>
            <button className="btn" onClick={() => setConfession(null)}>知道了</button>
          </div>
        </div>
      ) : null}

      {report ? <Report report={report} state={game} onClose={closeReport} onAI={aiReady ? () => rewriteReport(ai, report) : undefined} /> : null}
    </div>
  );
}