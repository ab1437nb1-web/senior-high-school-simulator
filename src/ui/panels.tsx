import { useEffect, useMemo, useRef, useState } from "react";
import { EDGES, STAGES, SUBJECTS, SUBJECT_MAP, unitKey, unitLabel, unitsUpTo, type Edge } from "../sim/data";
import { canConfess, CRUSH_MIN, examName, fiveEdu, PASS_LINE, transferInfo } from "../sim/engine";
import { activateProfile, deleteProfile, listModels, listProfiles, proxyHealth, saveProfile, switchSource, testConnection } from "../ai";
import type { AiConfig, ProxyHealth } from "../ai";
import type { SlotMeta } from "../save";
import type { StoryEvent } from "../sim/types";
import { NPC_MAP, relativeSeat } from "../sim/npcs";
import { EVENTS } from "../sim/events";
import type { GameState, SubjectId, WeekReport } from "../sim/types";

function num(n: number) {
  return Math.round(n * 10) / 10;
}

export function Report(props: {
  report: WeekReport;
  state: GameState;
  onClose: () => void;
  onAI?: () => Promise<string[] | null>;
}) {
  const { report, state, onClose, onAI } = props;
  const [open, setOpen] = useState<string | null>(null);
  const [ai, setAi] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);
  const factMap: Record<string, string> = {};
  for (const f of report.facts) factMap[f.id] = f.label;

  const runAI = async () => {
    if (!onAI) return;
    setBusy(true);
    setFailed(false);
    const lines = await onAI();
    setBusy(false);
    if (lines && lines.length) setAi(lines);
    else setFailed(true);
  };

  useEffect(() => {
    if (!onAI || started.current) return;
    started.current = true;
    runAI();
  }, [onAI]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 className="section" style={{ margin: 0 }}>
            第 {report.week} 周 · 周报
          </h2>
          <button className="btn ghost" style={{ width: "auto", padding: "4px 10px" }} onClick={onClose}>
            收起
          </button>
        </div>

        <div className="narr" style={{ marginTop: 14 }}>
          {ai
            ? ai.map((line, i) => (
                <p key={i}>
                  {line}
                  <span className="cite" onClick={() => setOpen(open === "ai" ? null : "ai")}>
                    依据
                  </span>
                  {open === "ai" ? (
                    <span className="facts">
                      {report.facts.map((f) => (
                        <div key={f.id}>· {f.label}</div>
                      ))}
                    </span>
                  ) : null}
                </p>
              ))
            : report.lines.map((l, i) => (
                <p key={i}>
                  {l.text}
                  <span className="cite" onClick={() => setOpen(open === String(i) ? null : String(i))}>
                    依据
                  </span>
                  {open === String(i) ? (
                    <span className="facts">
                      {l.cites.map((c) => (
                        <div key={c}>· {factMap[c] || c}</div>
                      ))}
                    </span>
                  ) : null}
                </p>
              ))}
        </div>

        <div className="row" style={{ marginTop: 4, flexWrap: "wrap", gap: 8 }}>
          {onAI ? (
            <>
              <button className="btn ghost" style={{ width: "auto", fontSize: 12, padding: "7px 12px" }} disabled={busy} onClick={runAI}>
                {busy ? "AI 正在写…" : ai ? "重新生成" : "让 AI 写"}
              </button>
              {ai ? (
                <button className="btn ghost" style={{ width: "auto", fontSize: 12, padding: "7px 12px" }} onClick={() => setAi(null)}>
                  改用模板
                </button>
              ) : null}
            </>
          ) : null}
          {failed ? <span className="small muted">AI 没返回可用内容，显示的是模板</span> : null}
        </div>

        {report.qualify ? (
          <div className="card" style={{ marginTop: 16 }}>
            <strong>合格考</strong>
            <div className="small muted" style={{ marginTop: 4 }}>
              {report.qualify.map((q) => q.subject + (q.pass ? " 合格" : " 不合格")).join(" · ")}
            </div>
          </div>
        ) : null}

        {report.evaluation ? (
          <div className="card" style={{ marginTop: 16, borderColor: report.evaluation.passed ? "#3f6b4f" : "#a8452c" }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>综合评价 · {report.evaluation.stageName}</strong>
              <span className="mono">{report.evaluation.score}</span>
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>
              合格线 {PASS_LINE} · {report.evaluation.passed ? "通过" : "不合格，学籍终止"}
            </div>
          </div>
        ) : null}

        {report.stageChanged ? (
          <div className="card" style={{ marginTop: 16, borderColor: "#1c1b18" }}>
            <div className="serif" style={{ fontSize: 18 }}>学期结束</div>
            <div className="small muted" style={{ marginTop: 4 }}>
              下一站：{STAGES.find((x) => x.id === report.stageChanged!.to)?.name}
            </div>
          </div>
        ) : null}

        {report.exam ? (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{examName(report.exam.kind)}成绩</strong>
              <span className="mono">{report.exam.total} / {report.exam.max || 750}</span>
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>
              班级第 {report.exam.classRank} 名 · 全省预估前 {100 - report.exam.percentile}%
            </div>
          </div>
        ) : null}

        <button className="btn" style={{ marginTop: 18 }} onClick={onClose}>
          进入下一周
        </button>
        <p className="small muted center" style={{ marginTop: 10 }}>
          每句话的「依据」可以展开，看到它引用了哪几条事实。共 {report.facts.length} 条。
        </p>
      </div>
    </div>
  );
}

export function EventSheet(props: {
  event: StoryEvent;
  chosen: any;
  index: number;
  total: number;
  text?: string;
  aiText?: boolean;
  onChoose: (choice: any) => void;
  onNext: () => void;
}) {
  const { event, chosen, index, total, onChoose, onNext } = props;
  const label = event.kind === "main" ? "主线" : event.kind === "npc" ? "身边" : "日常";
  return (
    <div className="overlay">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="ev-kind">{label} · {index + 1}/{total}</span>
        </div>
        <h2 className="serif" style={{ fontSize: 20, margin: "8px 0 0" }}>{event.title}</h2>
        <p className="ev-text">{props.text || event.text}</p>
        {props.aiText ? <div className="small muted" style={{ marginTop: -6 }}>AI 即时生成 · 不满意可换下一次</div> : null}

        {!chosen
          ? event.choices.map((c, i) => (
              <button key={i} className="choice-btn" onClick={() => onChoose(c)}>
                {c.text}
              </button>
            ))
          : (
            <>
              <p className="ev-result">{chosen.result}</p>
              <button className="btn" onClick={onNext}>
                {index + 1 < total ? "下一件" : "开始这一周"}
              </button>
            </>
          )}
      </div>
    </div>
  );
}

export function SeatMap(props: {
  playerSeat?: { col: number; row: number };
  npcs: any[];
  seats?: Record<string, { col: number; row: number }>;
  onPick?: (s: { col: number; row: number }) => void;
}) {
  const occupied = new Map<string, string>();
  for (const n of props.npcs) {
    const def = NPC_MAP[n.id] || n;
    // 传了 seats 就以它为准：空的表示这个人还没选座，不能回退到静态座位
    const pos = props.seats ? props.seats[n.id] : def && def.seatPos;
    if (pos) occupied.set(pos.col + "-" + pos.row, def.name);
  }
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
  const cols = [1, 2, 3, 4, 5, 6];
  return (
    <div className="card" style={{ padding: 8 }}>
      <div className="small muted" style={{ textAlign: "center", marginBottom: 6, letterSpacing: 4 }}>讲　台</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
        {rows.map((r) =>
          cols.map((c) => {
            const key = c + "-" + r;
            const who = occupied.get(key);
            const isMe = props.playerSeat && props.playerSeat.col === c && props.playerSeat.row === r;
            const empty = !who;
            return (
              <button
                key={key}
                disabled={(!empty && !isMe) || !props.onPick}
                onClick={() => props.onPick && props.onPick({ col: c, row: r })}
                style={{
                  height: 38,
                  fontSize: 11,
                  borderRadius: 3,
                  border: "1px solid " + (isMe ? "#1c1b18" : "#d8cfbc"),
                  background: isMe ? "#f2e14a" : who ? "#efe8d8" : "#fffdf7",
                  color: isMe ? "#1c1b18" : "#6f685b",
                  cursor: (empty || isMe) && props.onPick ? "pointer" : "default",
                  padding: 0,
                }}
              >
                {isMe ? "你" : who || ""}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ChoiceWizard(props: { name?: string; onConfirm: (c: { first: "physics" | "history"; second: any[] }) => void }) {
  const [first, setFirst] = useState<"physics" | "history">("physics");
  const [second, setSecond] = useState<string[]>(["chemistry", "geography"]);
  const toggle = (id: string) => {
    if (second.includes(id)) setSecond(second.filter((s) => s !== id));
    else if (second.length >= 2) setSecond([second[1], id]);
    else setSecond([...second, id]);
  };
  const coverage = first === "physics" && second.includes("chemistry") ? 96 : first === "physics" ? 52 : 34;
  return (
    <div className="overlay">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <span className="ev-kind">高一上 · 期末后</span>
        <h2 className="serif" style={{ fontSize: 20, margin: "8px 0 0" }}>选科表发下来了</h2>
        <p className="ev-text">
          一学期下来，你大概知道自己哪科跟得上、哪科是硬撑。{props.name ? props.name + "，" : ""}这一栏填完，后面两年就按它走了。
        </p>

        <div className="field">
          <label>首选（二选一）</label>
          <div className="chips">
            {[["physics", "物理"], ["history", "历史"]].map(([id, label]) => (
              <button key={id} className={"chip" + (first === id ? " on" : "")} onClick={() => setFirst(id as any)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>再选（四选二）</label>
          <div className="chips">
            {[["chemistry", "化学"], ["biology", "生物"], ["politics", "政治"], ["geography", "地理"]].map(([id, label]) => (
              <button key={id} className={"chip" + (second.includes(id) ? " on" : "")} onClick={() => toggle(id)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="small muted">可报专业覆盖（本校口径）：{coverage}%</div>
        <button className="btn" style={{ marginTop: 16 }} disabled={second.length !== 2} onClick={() => props.onConfirm({ first, second })}>
          {second.length === 2 ? "交表" : "再选科目要选满两门"}
        </button>
      </div>
    </div>
  );
}

export function NpcPanel(props: { state: GameState; onConfess?: (id: string) => void }) {
  const { state } = props;
  const adj = new Set<string>(
    (() => {
      const seat = state.playerSeat;
      if (!seat) return [] as string[];
      return state.npcs
        .filter((n) => {
          const pos = NPC_MAP[n.id] && NPC_MAP[n.id].seatPos;
          if (!pos) return false;
          const dc = Math.abs(pos.col - seat.col);
          const dr = Math.abs(pos.row - seat.row);
          return (dr === 0 && dc === 1) || (dc === 0 && dr === 1) || (dr === 1 && dc === 1);
        })
        .map((n) => n.id);
    })()
  );
  const groups: { kind: "classmate" | "teacher" | "parent"; label: string }[] = [
    { kind: "classmate", label: "同学" },
    { kind: "teacher", label: "老师" },
    { kind: "parent", label: "家人" },
  ];
  return (
    <div>
      {(state.npcNews || []).length ? (
        <>
          <h2 className="section">同学圈</h2>
          <div className="card">
            {state.npcNews!.slice(-6).reverse().map((n, i) => (
              <div key={i} className="small" style={{ marginTop: i === 0 ? 0 : 6 }}>
                <span className="muted mono" style={{ marginRight: 8 }}>第 {n.week} 周</span>
                {n.text}
              </div>
            ))}
          </div>
        </>
      ) : null}

      <h2 className="section">教室</h2>
      <SeatMap playerSeat={state.playerSeat} npcs={state.npcs as any[]} seats={state.seats} />

      {groups.map((grp) => {
        const list = state.npcs.filter((n) => n.kind === grp.kind);
        if (!list.length) return null;
        return (
          <div key={grp.kind}>
            <h2 className="section">{grp.label}</h2>
            {list.map((n) => {
              const def = NPC_MAP[n.id];
              if (!def) return null;
              const g = n.game;
              const lastExam = g && g.exams.length ? g.exams[g.exams.length - 1] : null;
              const isP = state.socialTarget === n.id;
              const isS = state.socialTarget2 === n.id;
              return (
                <div className="card" key={n.id}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <strong>
                      {def.name} <span className="small muted">{relativeSeat(state.playerSeat, def, state.seats && state.seats[n.id])}</span>
                      {isP ? <span className="pill hot" style={{ marginLeft: 6 }}>主要</span> : null}
                      {isS ? <span className="pill" style={{ marginLeft: 6 }}>次要</span> : null}
                      {adj.has(n.id) ? <span className="pill cool" style={{ marginLeft: 6 }}>够得着</span> : null}
                      {n.friend ? <span className="pill" style={{ marginLeft: 6, borderColor: "#3f6b4f", color: "#3f6b4f" }}>朋友</span> : null}
                    </strong>
                    <span className="mono small">{lastExam ? lastExam.total + " 分" : ""}</span>
                  </div>
                  <div className="small muted" style={{ marginTop: 4 }}>{def.line}</div>
                  {(() => {
                    const pairs = state.npcPairs || {};
                    const ties = Object.entries(pairs)
                      .map(([k, v]) => {
                        const [x, y] = k.split("|");
                        if (x !== n.id && y !== n.id) return null;
                        const other = x === n.id ? y : x;
                        return { id: other, v };
                      })
                      .filter(Boolean) as { id: string; v: number }[];
                    if (!ties.length) return null;
                    const top = ties.sort((a, b) => b.v - a.v).slice(0, 2);
                    return (
                      <div className="small muted" style={{ marginTop: 4 }}>
                        走得近：{top.map((x) => (NPC_MAP[x.id]?.name || x.id) + " " + Math.round(x.v)).join(" · ")}
                      </div>
                    );
                  })()}
                  {state.romance && state.romance.npcId === n.id ? (
                    <div className="small" style={{ color: "#a8452c", marginTop: 6 }}>恋爱中 · 第 {state.romance.since} 周起</div>
                  ) : null}
                  {!state.romance && n.relation > 60 && def.kind === "classmate" ? (
                    <div className="small" style={{ color: "#8a5a2c", marginTop: 6 }}>
                      跨越朋友 {Math.round((state.beyond && state.beyond[n.id]) || 0)}/100
                      {((state.beyond && state.beyond[n.id]) || 0) < 100 ? " · 关系暂时到 75 为止" : " · 可以表白了"}
                    </div>
                  ) : null}
                  {state.romance && state.romance.npcId === n.id ? null : canConfess(state, n.id) && props.onConfess ? (
                    <button className="chip" style={{ marginTop: 8 }} onClick={() => props.onConfess!(n.id)}>表白</button>
                  ) : null}
                  <div className="row small" style={{ marginTop: 10, gap: 14, flexWrap: "wrap" }}>
                    <span className="muted">关系 <b className="mono" style={{ color: "var(--ink)" }}>{Math.round(n.relation)}</b></span>
                    {g ? (
                      <>
                        <span className="muted">精力 <b className="mono" style={{ color: "var(--ink)" }}>{Math.round(g.stats.energy)}</b></span>
                        <span className="muted">压力 <b className="mono" style={{ color: "var(--ink)" }}>{Math.round(g.stats.stress)}</b></span>
                        <span className="muted">心情 <b className="mono" style={{ color: "var(--ink)" }}>{Math.round(g.stats.mood)}</b></span>
                      </>
                    ) : (
                      <span className="muted">心情 <b className="mono" style={{ color: "var(--ink)" }}>{Math.round(n.mood || 0)}</b></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      <p className="small muted">
        同学各自持有一份完整存档，用着和你一样的精力、衰减与考试。老师与家人只记录关系与心情。
      </p>
    </div>
  );
}


type Node = { x: number; y: number; s: number; o: number };

export const smSubjectOf = (key: string) => key.split(":")[0];
export const smUnitName = (key: string) => {
  const parts = key.split(":");
  const meta = SUBJECT_MAP[parts[0] as SubjectId];
  const u = meta && meta.units[Number(parts[1])];
  return u ? u.name : key;
};

export const SM_NEIGHBORS: Record<string, { key: string; kind: string; w: number }[]> = (() => {
  const map: Record<string, { key: string; kind: string; w: number }[]> = {};
  for (const e of EDGES) {
    (map[e.a] = map[e.a] || []).push({ key: e.b, kind: e.kind, w: e.w });
    (map[e.b] = map[e.b] || []).push({ key: e.a, kind: e.kind, w: e.w });
  }
  return map;
})();

const STAR_C = 360;
const TWO_PI = Math.PI * 2;

export function starLayout(state: GameState, focus: string | null, sel: string | null): Record<string, Node> {
  const out: Record<string, Node> = {};
  const sat = sel ? SM_NEIGHBORS[sel] || [] : [];
  const neighbor = new Set(sat.map((x) => x.key));

  SUBJECTS.forEach((sub, i) => {
    const angle = (i / SUBJECTS.length) * TWO_PI - Math.PI / 2;
    const isFocus = focus === sub.id;
    const hubR = focus ? (isFocus ? 0 : 292) : 252;
    const hub = {
      x: STAR_C + Math.cos(angle) * hubR,
      y: STAR_C + Math.sin(angle) * hubR,
    };
    out["s:" + sub.id] = {
      x: hub.x,
      y: hub.y,
      s: isFocus ? 1.2 : focus ? 0.55 : 1,
      o: isFocus || !focus ? 1 : 0.22,
    };

    const ringR = isFocus ? 148 : focus ? 30 : 58;
    sub.units.forEach((_, j) => {
      const k = unitKey(sub.id, j);
      const a = angle + (j - (sub.units.length - 1) / 2) * (isFocus ? 0.42 : 0.5);
      const inView = !focus || isFocus;
      const lit = !sel || k === sel || neighbor.has(k);
      out[k] = {
        x: hub.x + Math.cos(a) * ringR,
        y: hub.y + Math.sin(a) * ringR,
        s: isFocus ? 1.25 : focus ? 0.5 : 1,
        o: inView ? (lit ? 1 : 0.18) : 0.1,
      };
    });
  });
  return out;
}

export function useStarTween(target: Record<string, Node>, key: string) {
  const [lay, setLay] = useState<Record<string, Node>>(target);
  const layRef = useRef(lay);
  layRef.current = lay;
  useEffect(() => {
    const from = layRef.current;
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();
    const dur = 480;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const next: Record<string, Node> = {};
      for (const id of Object.keys(target)) {
        const a = from[id];
        const b = target[id];
        next[id] = a
          ? { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, s: a.s + (b.s - a.s) * e, o: a.o + (b.o - a.o) * e }
          : b;
      }
      setLay(next);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key]);
  return lay;
}

export function StarMap(props: { state: GameState }) {
  const { state } = props;
  const [focus, setFocus] = useState<SubjectId | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  const target = useMemo(() => starLayout(state, focus, sel), [state, focus, sel]);
  const lay = useStarTween(target, (focus || "-") + "|" + (sel || "-"));
  const neighbors = sel ? SM_NEIGHBORS[sel] || [] : [];

  const unlockedMap: Record<string, Set<number>> = {};
  SUBJECTS.forEach((s) => {
    unlockedMap[s.id] = new Set(unitsUpTo(s.id, state.stage));
  });

  const detail = sel
    ? (() => {
        const u = state.units[sel];
        const info = transferInfo(state, sel);
        return { mastery: u.mastery, confusion: u.confusion, info };
      })()
    : null;

  const clickSubject = (sid: SubjectId) => {
    if (!focus) setFocus(sid);
    else if (sid === focus) {
      if (sel) setSel(null);
      else setFocus(null);
    } else {
      setSel(null);
      setFocus(sid);
    }
  };
  const clickUnit = (key: string) => {
    if (sel === key) setSel(null);
    else {
      setSel(key);
      setFocus(smSubjectOf(key));
    }
  };

  const edgeView = (e: Edge) => {
    const base = 1 + e.w * 1.8;
    const touch = !!sel && (e.a === sel || e.b === sel);
    if (sel) return { o: touch ? 0.95 : 0.03, w: touch ? base * 1.5 : base };
    if (!focus) return { o: 0.09, w: 1 + e.w * 1.2 };
    const aIn = smSubjectOf(e.a) === focus;
    const bIn = smSubjectOf(e.b) === focus;
    if (aIn && bIn) return { o: 0.5, w: base };
    if (aIn || bIn) return { o: 0.26, w: 1 + e.w * 1.4 };
    return { o: 0.015, w: 1 };
  };

  return (
    <div>
      <h2 className="section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          知识星图
          {focus ? " · " + SUBJECT_MAP[focus].name : ""}
          {sel ? " · " + smUnitName(sel) : ""}
        </span>
        <span style={{ letterSpacing: 0, display: "flex", gap: 6 }}>
          {sel ? (
            <button className="chip" onClick={() => setSel(null)}>返回本科</button>
          ) : null}
          {focus ? (
            <button className="chip" onClick={() => { setSel(null); setFocus(null); }}>返回全图</button>
          ) : (
            <span className="small muted">点学科展开</span>
          )}
        </span>
      </h2>
      <div className="card" style={{ padding: 4, overflow: "hidden" }}>
        <svg viewBox="0 0 720 720" style={{ width: "100%", display: "block" }}>
          {EDGES.map((e, i) => {
            const pa = lay[e.a];
            const pb = lay[e.b];
            if (!pa || !pb) return null;
            const v = edgeView(e);
            return (
              <line
                key={i}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={e.kind === "confusable" ? "#a8452c" : "#8a806c"}
                strokeDasharray={e.kind === "confusable" ? "5 4" : undefined}
                style={{ pointerEvents: "none", opacity: v.o, strokeWidth: v.w, transition: "opacity .5s ease, stroke-width .5s ease" }}
              />
            );
          })}
          {SUBJECTS.map((sub) => {
            const p = lay["s:" + sub.id];
            const t = target["s:" + sub.id];
            if (!p || !t) return null;
            const idxs = unitsUpTo(sub.id, state.stage);
            const avg = idxs.length ? idxs.reduce((a2, j) => a2 + state.units[unitKey(sub.id, j)].mastery, 0) / idxs.length : 0;
            const C = 2 * Math.PI * 30;
            const showName = !focus || sub.id === focus;
            return (
              <g
                key={sub.id}
                style={{ transform: "translate(" + p.x + "px," + p.y + "px) scale(" + p.s + ")", opacity: p.o, pointerEvents: t.o > 0.5 ? "auto" : "none", cursor: "pointer" }}
                onClick={() => clickSubject(sub.id)}
              >
                <title>{sub.name} · 平均掌握 {Math.round(avg)}</title>
                <circle r={36} fill="transparent" />
                <circle r={30} fill="none" stroke="#d8cfbc" strokeWidth={3} opacity={0.8} />
                <circle r={30} fill="none" stroke={sub.color} strokeWidth={3} strokeLinecap="round" strokeDasharray={(avg / 100) * C + " " + C} transform="rotate(-90)" />
                <circle r={23} fill="#fffdf7" stroke={sub.color} strokeWidth={1.4} />
                <text y={5.5} textAnchor="middle" fontSize={16} fontWeight={600} fill={sub.color}>{sub.short}</text>
                <g style={{ opacity: showName ? 1 : 0, transition: "opacity .4s" }}>
                  <text y={50} textAnchor="middle" fontSize={13} fill={sub.color} style={{ paintOrder: "stroke", stroke: "#f7f3ea", strokeWidth: 3.5 }}>{sub.name}</text>
                </g>
              </g>
            );
          })}
          {SUBJECTS.flatMap((sub) =>
            sub.units.map((_, j) => {
              const k = unitKey(sub.id, j);
              const p = lay[k];
              const t = target[k];
              if (!p || !t) return null;
              const m = state.units[k].mastery;
              const locked = !unlockedMap[sub.id].has(j);
              const r = locked ? 5.5 : 4 + m / 10;
              const isSel = sel === k;
              return (
                <g
                  key={k}
                  className="starnode"
                  style={{ transform: "translate(" + p.x + "px," + p.y + "px) scale(" + p.s + ")", opacity: p.o, pointerEvents: t.o > 0.5 ? "auto" : "none" }}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    clickUnit(k);
                  }}
                >
                  <title>{unitLabel(k)}</title>
                  <circle r={r + 8} fill="transparent" />
                  {locked ? (
                    <circle r={r} fill="none" stroke={sub.color} strokeWidth={1.1} strokeDasharray="3 3" opacity={0.75} />
                  ) : (
                    <>
                      <circle r={r} fill={sub.color} opacity={0.18 + m / 160} />
                      <circle r={r} fill="none" stroke={sub.color} strokeWidth={isSel ? 2.2 : 1.2} strokeOpacity={isSel ? 1 : 0.65} />
                    </>
                  )}
                </g>
              );
            })
          )}
          {sel ? (
            <g style={{ pointerEvents: "none", animation: "sm-fade .45s ease .08s both" }}>
              <text x={lay[sel].x} y={lay[sel].y + 42} textAnchor="middle" fontSize={15} fontWeight={600} fill="#1c1b18" style={{ paintOrder: "stroke", stroke: "#f7f3ea", strokeWidth: 4 }}>
                {smUnitName(sel)}
              </text>
              {neighbors.map((nb) => {
                const p = lay[nb.key];
                if (!p) return null;
                const nm = smUnitName(nb.key);
                return (
                  <text key={nb.key} x={p.x} y={p.y + 26} textAnchor="middle" fontSize={11.5} fill={SUBJECT_MAP[smSubjectOf(nb.key)].color} style={{ paintOrder: "stroke", stroke: "#f7f3ea", strokeWidth: 3.5 }}>
                    {nm.length > 9 ? nm.slice(0, 8) + "…" : nm}
                  </text>
                );
              })}
            </g>
          ) : null}
        </svg>
      </div>

      {sel && detail ? (
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>{unitLabel(sel)}</strong>
            <span className="mono">{Math.round(detail.mastery)}</span>
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>
            掌握度 {Math.round(detail.mastery)} / 100
            {state.week - state.units[sel].lastStudied > 2 ? " · 正在遗忘（已 " + (state.week - state.units[sel].lastStudied) + " 周没碰）" : " · 刚学过"}
            {detail.info.sources.length ? " · 迁移加成 +" + Math.round((detail.info.mul - 1) * 100) + "%" : " · 暂无迁移加成"}
            {detail.info.clash ? " · 正在与 " + unitLabel(detail.info.clash.key) + " 互相干扰" : ""}
          </div>
          <div style={{ marginTop: 8 }}>
            {detail.info.sources.length === 0 ? (
              <p className="small muted">先把这个单元自己学起来（到 10），再让关联的单元超过 20，才会有迁移。</p>
            ) : (
              detail.info.sources.map((s) => (
                <div key={s.key} className="row small" style={{ marginTop: 4 }}>
                  <span className="muted" style={{ flex: 1 }}>{unitLabel(s.key)}</span>
                  <span className="mono">+{Math.round(s.w * 100)}%</span>
                </div>
              ))
            )}
          </div>
          <p className="small muted" style={{ marginTop: 8, marginBottom: 0 }}>实线=正迁移，红色虚线=易混；点关联知识点可以继续跳转，再点中心返回本科。</p>
        </div>
      ) : (
        <p className="small muted">
          {focus
            ? "点一个知识点，它会居中并标出所有关联；点外圈小圆可切换学科。虚线圈是还没学到的单元。"
            : "点一个学科，展开它的知识点体系。学科之间的细线是跨科迁移关联。"}
        </p>
      )}
    </div>
  );
}

export function ExamView(props: { state: GameState }) {
  const { state } = props;
  const exams = state.exams.slice().reverse();
  return (
    <div>
      <h2 className="section">成绩单</h2>
      {exams.length === 0 ? <p className="muted small">还没有考试。</p> : null}
      {exams.map((ex) => (
        <div className="card" key={ex.week + ex.kind}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>{examName(ex.kind)} · 第 {ex.week} 周</strong>
            <span className="mono">{ex.total}{ex.max ? " / " + ex.max : ""}</span>
          </div>
          <div className="small muted">
            班级第 {ex.classRank} / 48 · 全省预估前 {100 - ex.percentile}%
            {typeof ex.factor === "number" ? " · 临场 ×" + ex.factor.toFixed(2) : ""}
          </div>
          <table className="grid" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>科目</th>
                <th>原始</th>
                <th>赋分</th>
                <th>计入</th>
              </tr>
            </thead>
            <tbody>
              {ex.scores.map((s) => (
                <tr key={s.subject}>
                  <td>{SUBJECT_MAP[s.subject].name}</td>
                  <td>{s.raw}</td>
                  <td>{s.graded != null ? s.graded + " (" + s.grade + ")" : "—"}</td>
                  <td>{s.final}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="small muted" style={{ marginTop: 8 }}>
            最弱的三处：{ex.weak.map((w) => w.label + " " + w.rate + "%").join(" · ")}
          </div>
          {state.classRanking && state.exams[state.exams.length - 1].week === ex.week ? (
            <details style={{ marginTop: 8 }}>
              <summary className="small muted" style={{ cursor: "pointer" }}>班级排名（48 人）</summary>
              <div style={{ marginTop: 6 }}>
                {state.classRanking.slice(0, 10).map((r) => (
                  <div key={r.id} className="row small" style={{ justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{ color: r.id === "you" ? "#1c1b18" : "#6f685b", fontWeight: r.id === "you" ? 600 : 400 }}>
                      {r.rank}. {r.id === "you" ? "你" : r.name || "同学"}
                    </span>
                    <span className="mono">{r.total}</span>
                  </div>
                ))}
                {(() => {
                  const me = state.classRanking!.find((r) => r.id === "you");
                  const partner = state.romance ? state.classRanking!.find((r) => r.id === state.romance!.npcId) : null;
                  const rows: any[] = [];
                  if (me && me.rank > 10) rows.push({ key: "me", rank: me.rank, label: "你", total: me.total });
                  if (partner && partner.rank > 10) rows.push({ key: "partner", rank: partner.rank, label: partner.name + "（恋人）", total: partner.total });
                  if (!rows.length) return null;
                  return (
                    <div style={{ marginTop: 6, borderTop: "1px solid #e6dfd0", paddingTop: 4 }}>
                      {rows.map((r) => (
                        <div key={r.key} className="row small" style={{ justifyContent: "space-between", marginTop: 2 }}>
                          <span style={{ fontWeight: 600 }}>{r.rank}. {r.label}</span>
                          <span className="mono">{r.total}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </details>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Radar({ values }: { values: { label: string; v: number }[] }) {
  const size = 240;
  const c = size / 2;
  const R = 88;
  const pts = values.map((d, i) => {
    const a = (i / values.length) * Math.PI * 2 - Math.PI / 2;
    const r = (d.v / 100) * R;
    return { x: c + Math.cos(a) * r, y: c + Math.sin(a) * r, lx: c + Math.cos(a) * (R + 18), ly: c + Math.sin(a) * (R + 18), label: d.label };
  });
  return (
    <svg viewBox={"0 0 " + size + " " + size} style={{ width: "100%", maxWidth: 280, margin: "0 auto", display: "block" }}>
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon
          key={k}
          points={values.map((_, i) => {
            const a = (i / values.length) * Math.PI * 2 - Math.PI / 2;
            return (c + Math.cos(a) * R * k) + "," + (c + Math.sin(a) * R * k);
          }).join(" ")}
          fill="none" stroke="#d8cfbc" strokeWidth={1}
        />
      ))}
      <polygon points={pts.map((p) => p.x + "," + p.y).join(" ")} fill="rgba(47,93,138,.18)" stroke="#2f5d8a" strokeWidth={1.6} />
      {pts.map((p) => (
        <text key={p.label} x={p.lx} y={p.ly} fontSize={11} textAnchor="middle" fill="#6f685b">{p.label}</text>
      ))}
    </svg>
  );
}

export type ArchiveActions = {
  slots: SlotMeta[];
  onSave: (i: number) => void;
  onLoad: (i: number) => void;
  onDelete: (i: number) => void;
  onRestart: () => void;
};

export function Archive(props: { state: GameState; actions?: ArchiveActions }) {
  const { state, actions } = props;
  const edu = fiveEdu(state);
  const values = [
    { label: "品德", v: edu.moral },
    { label: "学业", v: edu.academic },
    { label: "健康", v: edu.health },
    { label: "艺术", v: edu.art },
    { label: "劳动", v: edu.labor },
  ];
  const byDim: Record<string, string[]> = {};
  for (const e of state.evidence) {
    const k = e.dim;
    byDim[k] = byDim[k] || [];
    byDim[k].push(e.label + (e.documented ? "" : "（没留痕）"));
  }
  return (
    <div>
      <h2 className="section">五育</h2>
      <div className="card">
        <Radar values={values} />
        <div className="grid2" style={{ marginTop: 8 }}>
          {values.map((v) => (
            <div key={v.label} className="row small" style={{ justifyContent: "space-between" }}>
              <span className="muted">{v.label}</span>
              <span className="mono">{Math.round(v.v)}</span>
            </div>
          ))}
        </div>
      </div>
      <h2 className="section">证据</h2>
      <div className="card">
        {state.evidence.length === 0 ? <p className="small muted">还没有留下任何记录。做了但没记录，只算六成。</p> : null}
        {Object.keys(byDim).map((k) => (
          <div key={k} style={{ marginBottom: 8 }}>
            <div className="small muted">{k}</div>
            {byDim[k].slice(-6).map((l, i) => (
              <div key={i} className="small">· {l}</div>
            ))}
          </div>
        ))}
      </div>
      <h2 className="section">关系</h2>
      <div className="card">
        {state.npcs
          .slice()
          .sort((a, b) => b.relation - a.relation)
          .slice(0, 6)
          .map((n) => {
            const def = NPC_MAP[n.id];
            return (
              <div key={n.id} className="row small" style={{ justifyContent: "space-between", marginTop: 2 }}>
                <span className="muted">{def ? def.name : n.id}{def && def.seat ? " · " + def.seat : ""}</span>
                <span className="mono">{Math.round(n.relation)}</span>
              </div>
            );
          })}
      </div>

      <h2 className="section">事件库</h2>
      <div className="card">
        {(() => {
          const counts = {};
          for (const e of EVENTS) {
            const g = e.group || "daily";
            counts[g] = (counts[g] || 0) + 1;
          }
          const names = { main: "主线", daily: "日常", social: "社交", friend: "朋友", crush: "暧昧", love: "恋爱" };
          return Object.entries(names).map(([k, label]) => (
            <div key={k} className="row small" style={{ justifyContent: "space-between", marginTop: 2 }}>
              <span className="muted">{label}</span>
              <span className="mono">{counts[k] || 0}</span>
            </div>
          ));
        })()}
      </div>

      <h2 className="section">综合评价</h2>
      <div className="card">
        {state.evaluations.length === 0 ? (
          <p className="small muted">还没有结算过。高一暑假结束后会有第一次综合评价，合格线 {PASS_LINE}，一次不合格即结束。</p>
        ) : (
          state.evaluations.map((e, i) => (
            <div key={i} className="row" style={{ justifyContent: "space-between", marginTop: i === 0 ? 0 : 6 }}>
              <span className="small">{e.stageName}</span>
              <span className="mono small" style={{ color: e.passed ? "#3f6b4f" : "#a8452c" }}>{e.score} {e.passed ? "合格" : "不合格"}</span>
            </div>
          ))
        )}
      </div>

      {actions ? (
        <>
          <h2 className="section">存档</h2>
          <div className="card">
            {actions.slots.map((s, idx) => {
              const i = idx + 1;
              return (
                <div key={i} className="row" style={{ marginTop: idx === 0 ? 0 : 10 }}>
                  <div className="grow small">
                    <b>槽位 {i}</b>
                    <div className="muted">
                      {s ? "第 " + s.week + " 周 · " + new Date(s.at).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "空"}
                    </div>
                  </div>
                  <button className="chip" onClick={() => actions.onSave(i)}>保存</button>
                  <button className="chip" onClick={() => actions.onLoad(i)} disabled={!s} style={{ opacity: s ? 1 : 0.35 }}>读取</button>
                  <button className="chip" onClick={() => actions.onDelete(i)} disabled={!s} style={{ opacity: s ? 1 : 0.35 }}>删除</button>
                </div>
              );
            })}
          </div>
          <button
            className="btn ghost"
            style={{ marginTop: 14, color: "#a8452c", borderColor: "#a8452c" }}
            onClick={actions.onRestart}
          >
            重新开始（丢弃当前进度）
          </button>
        </>
      ) : null}
    </div>
  );
}

export function Settings(props: { config: AiConfig; onSave: (c: AiConfig) => void; onClose: () => void }) {
  const [c, setC] = useState<AiConfig>(props.config);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ id?: string; name: string; baseUrl: string; model: string; apiKey: string }>({ name: "", baseUrl: "", model: "", apiKey: "" });
  const isProxy = c.source === "proxy";

  const refreshProfiles = async (serverBase: string, preferredId?: string | null) => {
    try {
      const d = await listProfiles(serverBase);
      setProfiles(d.profiles);
      const id = preferredId || d.activeProfileId;
      setActiveId(id);
      const cur = d.profiles.find((x: any) => x.id === id) || d.profiles[0];
      if (cur) setDraft({ id: cur.id, name: cur.name, baseUrl: cur.baseUrl, model: cur.model, apiKey: "" });
    } catch {
      setProfiles([]);
    }
  };

  useEffect(() => {
    if (!isProxy) return;
    let alive = true;
    (async () => {
      try {
        const d = await listProfiles(c.baseUrl);
        if (!alive) return;
        setProfiles(d.profiles);
        setActiveId(d.activeProfileId);
        const cur = d.profiles.find((x: any) => x.id === d.activeProfileId) || d.profiles[0];
        if (cur) setDraft({ id: cur.id, name: cur.name, baseUrl: cur.baseUrl, model: cur.model, apiKey: "" });
      } catch {
        if (alive) setProfiles([]);
      }
    })();
    return () => { alive = false; };
  }, [isProxy, c.baseUrl]);

  const doModels = async () => {
    setBusy("models");
    setStatus(null);
    try {
      const r = await listModels(c, isProxy ? draft.baseUrl : c.baseUrl);
      setModels(r.models);
      setStatus({ ok: true, text: "拿到 " + r.models.length + " 个模型" + (r.url ? " · " + r.url : "") });
      if (r.models.length && r.models.indexOf(draft.model) < 0) setDraft({ ...draft, model: r.models[0] });
    } catch (e: any) {
      setStatus({ ok: false, text: "获取失败：" + (e?.message || "未知错误") });
    }
    setBusy("");
  };

  const doTest = async () => {
    setBusy("test");
    setStatus(null);
    const r = await testConnection(c);
    setBusy("");
    setStatus({ ok: r.ok, text: r.message + " · " + r.ms + "ms" });
  };

  const pickProfile = async (id: string) => {
    const r = await activateProfile(c.baseUrl, id);
    if (!r.ok) return setStatus({ ok: false, text: "切换失败" });
    await refreshProfiles(c.baseUrl, id);
    setStatus({ ok: true, text: "已切换到该配置" });
  };

  const newProfile = () => {
    setDraft({ name: "", baseUrl: "", model: "", apiKey: "" });
    setActiveId(null);
    setModels([]);
    setStatus(null);
  };

  const removeProfile = async () => {
    if (!draft.id || profiles.length <= 1) return;
    const r = await deleteProfile(c.baseUrl, draft.id);
    if (!r.ok) return setStatus({ ok: false, text: "删除失败" });
    await refreshProfiles(c.baseUrl, null);
    setStatus({ ok: true, text: "已删除" });
  };

  const doSave = async () => {
    if (isProxy) {
      setBusy("save");
      const patch: any = {
        id: draft.id,
        name: draft.name || "未命名",
        baseUrl: draft.baseUrl,
        model: draft.model,
        provider: "custom",
      };
      if (draft.apiKey.trim()) patch.apiKey = draft.apiKey.trim();
      const r = await saveProfile(c.baseUrl, patch);
      setBusy("");
      if (!r.ok) {
        setStatus({ ok: false, text: r.data?.error || "保存失败" });
        return;
      }
      await refreshProfiles(c.baseUrl, r.data.activeProfileId);
      setDraft({ ...draft, apiKey: "" });
      setStatus({ ok: true, text: "已保存并切换" });
      props.onSave(c);
      return;
    }
    props.onSave(c);
    props.onClose();
  };

  return (
    <div className="overlay" onClick={props.onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 className="section" style={{ margin: 0 }}>AI 叙事 · 连接</h2>
          <button className="btn ghost" style={{ width: "auto", padding: "4px 10px" }} onClick={props.onClose}>关闭</button>
        </div>

        <div className="field">
          <label>连接方式</label>
          <select value={c.source} onChange={(e) => setC(switchSource(c, e.target.value as any))}>
            <option value="proxy">本地代理（仅本机，推荐）</option>
            <option value="deepseek">DeepSeek 直连（Key 在浏览器）</option>
            <option value="openai">OpenAI 直连（Key 在浏览器）</option>
            <option value="custom">自定义直连（OpenAI 兼容）</option>
          </select>
        </div>

        {isProxy ? (
          <>
            <div className="field">
              <label>已保存的配置</label>
              <div className="chips">
                {profiles.map((pr: any) => (
                  <button key={pr.id} className={"chip" + (pr.id === activeId ? " on" : "")} onClick={() => pickProfile(pr.id)}>
                    {pr.name}
                  </button>
                ))}
                <button className="chip" onClick={newProfile}>+ 新建</button>
              </div>
              <div className="small muted" style={{ marginTop: 6 }}>
                点名字即切换；每个配置各自保存地址、Key 与模型。
              </div>
            </div>

            <div className="field">
              <label>配置名称</label>
              <input className="key" value={draft.name} placeholder="官方 / 中转" onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>

            <div className="field">
              <label>模型服务商接口地址</label>
              <input className="key" value={draft.baseUrl} placeholder="https://api.deepseek.com 或中转地址" onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })} />
              <div className="small muted" style={{ marginTop: 4 }}>带不带 /v1 都行，服务端会两个都试。</div>
            </div>

            <div className="field">
              <label>Key</label>
              <div className="small" style={{ marginBottom: 6 }}>
                当前：{draft.id ? (profiles.find((x: any) => x.id === draft.id)?.hasKey ? <b className="mono">{profiles.find((x: any) => x.id === draft.id)?.masked}</b> : <span className="muted">未配置</span>) : <span className="muted">新配置</span>}
              </div>
              <input className="key" type="password" placeholder={draft.id ? "留空则保持不变" : "粘贴 sk-..."} value={draft.apiKey} onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })} />
            </div>

            <div className="field">
              <label>模型</label>
              <div className="row">
                <input className="key grow" value={draft.model} placeholder="deepseek-chat" onChange={(e) => setDraft({ ...draft, model: e.target.value })} />
                <button className="chip" style={{ flex: "none" }} onClick={doModels} disabled={busy === "models"}>
                  {busy === "models" ? "…" : "获取模型"}
                </button>
              </div>
              {models.length ? (
                <div className="chips" style={{ marginTop: 8 }}>
                  {models.slice(0, 40).map((m) => (
                    <button key={m} className={"chip" + (m === draft.model ? " on" : "")} onClick={() => setDraft({ ...draft, model: m })}>{m}</button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="field">
              <label>本地代理地址（一般不改）</label>
              <input className="key" value={c.baseUrl} onChange={(e) => setC({ ...c, baseUrl: e.target.value })} />
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label>接口地址（Base URL）</label>
              <input className="key" value={c.baseUrl} placeholder="https://api.deepseek.com" onChange={(e) => setC({ ...c, baseUrl: e.target.value })} />
            </div>
            <div className="field">
              <label>API Key</label>
              <div className="row">
                <input className="key grow" type={show ? "text" : "password"} value={c.apiKey} placeholder="sk-..." onChange={(e) => setC({ ...c, apiKey: e.target.value })} />
                <button className="chip" style={{ flex: "none" }} onClick={() => setShow(!show)}>{show ? "隐藏" : "显示"}</button>
              </div>
            </div>
            <div className="field">
              <label>附加请求头（可选，JSON）</label>
              <textarea className="key" rows={2} value={c.headers} placeholder='{"X-Title":"hs-life-sim"}' onChange={(e) => setC({ ...c, headers: e.target.value })} />
            </div>
            <div className="field">
              <label>模型</label>
              <div className="row">
                <input className="key grow" value={c.model} onChange={(e) => setC({ ...c, model: e.target.value })} />
                <button className="chip" style={{ flex: "none" }} onClick={async () => {
                  setBusy("models");
                  try {
                    const r = await listModels(c, c.baseUrl);
                    setModels(r.models);
                    setStatus({ ok: true, text: "拿到 " + r.models.length + " 个模型" });
                  } catch (e: any) {
                    setStatus({ ok: false, text: "获取失败：" + (e?.message || "") });
                  }
                  setBusy("");
                }} disabled={busy === "models"}>获取模型</button>
              </div>
              {models.length ? (
                <div className="chips" style={{ marginTop: 8 }}>
                  {models.slice(0, 40).map((m) => (
                    <button key={m} className={"chip" + (m === c.model ? " on" : "")} onClick={() => setC({ ...c, model: m })}>{m}</button>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        )}

        <div className="field">
          <label>温度 {c.temperature.toFixed(2)}</label>
          <input type="range" min={0} max={1.5} step={0.05} value={c.temperature} onChange={(e) => setC({ ...c, temperature: Number(e.target.value) })} style={{ width: "100%" }} />
        </div>

        {status ? <div className="small" style={{ color: status.ok ? "#3f6b4f" : "#a8452c", margin: "6px 0", wordBreak: "break-all" }}>{status.text}</div> : null}

        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn ghost" onClick={doTest} disabled={busy === "test"}>{busy === "test" ? "测试中…" : "测试连接"}</button>
          <button className="btn" onClick={doSave} disabled={busy === "save"}>{busy === "save" ? "保存中…" : "保存"}</button>
        </div>
        {isProxy && draft.id && profiles.length > 1 ? (
          <button className="btn ghost" style={{ marginTop: 10, color: "#a8452c", borderColor: "#a8452c" }} onClick={removeProfile}>删除这个配置</button>
        ) : null}
      </div>
    </div>
  );
}