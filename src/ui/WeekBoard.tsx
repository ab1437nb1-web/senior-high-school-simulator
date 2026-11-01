import { ACTIONS, ACTION_MAP, ALL_SUBJECTS, DAY_FOCUS, PRESETS, SUBJECT_MAP } from "../sim/data";
import type { Choice, Plan, Slot } from "../sim/types";

const DAYS = ["周一", "周二", "周三", "周四", "周五"];
const WEEKEND = ["周六·上午", "周六·下午", "周六·晚", "周日·上午", "周日·下午", "周日·晚"];

export function decode(v: string): Slot {
  const parts = v.split(":");
  if (parts.length > 1) return { a: parts[0], s: parts[1] as any };
  return { a: v };
}

export function encode(s: Slot): string {
  return s.s ? s.a + ":" + s.s : s.a;
}

function SlotSelect({ slot, onChange, focus, actions }: { slot: Slot; onChange: (s: Slot) => void; focus?: boolean; actions?: typeof ACTIONS }) {
  const value = encode(slot);
  return (
    <select className="grow" value={value} onChange={(e) => onChange(decode(e.target.value))}>
      {focus
        ? DAY_FOCUS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))
        : null}
      {focus ? (
        <optgroup label="主攻某科">
          {ALL_SUBJECTS.map((s) => (
            <option key={"main-" + s} value={"main:" + s}>
              主攻·{SUBJECT_MAP[s].name}
            </option>
          ))}
        </optgroup>
      ) : null}
      {!focus
        ? (actions || ACTIONS).filter((a) => !a.needSubject).map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))
        : null}
      {!focus ? (
        <optgroup label="学习（选科目）">
          {(actions || ACTIONS).filter((a) => a.needSubject).map((a) =>
            ALL_SUBJECTS.map((s) => (
              <option key={a.id + s} value={a.id + ":" + s}>
                {a.name}·{SUBJECT_MAP[s].name}
              </option>
            ))
          )}
        </optgroup>
      ) : null}
    </select>
  );
}

export default function WeekBoard(props: {
  plan: Plan;
  choice: Choice;
  onChange: (p: Plan) => void;
  onPreset: (id: string) => void;
  onCopy: () => void;
  canCopy: boolean;
  presetId: string;
  holiday?: boolean;
  allowPreview?: boolean;
  npcs?: { id: string; name: string; seat: string }[];
  socialTarget?: string;
  socialTarget2?: string;
  onTarget?: (id: string) => void;
  onTarget2?: (id: string) => void;
}) {
  const { plan, onChange, onPreset, onCopy, canCopy, presetId } = props;
  const actions = ACTIONS.filter((a) => a.id !== "preview" || (props.holiday && props.allowPreview !== false));

  const setFocus = (i: number, s: Slot) => {
    const next = { ...plan, focus: plan.focus.slice() };
    next.focus[i] = s;
    onChange(next);
  };
  const setEvening = (i: number, s: Slot) => {
    const next = { ...plan, evening: plan.evening.slice() };
    next.evening[i] = s;
    onChange(next);
  };
  const setWeekend = (i: number, s: Slot) => {
    const next = { ...plan, weekend: plan.weekend.slice() };
    next.weekend[i] = s;
    onChange(next);
  };

  return (
    <div>
      <h2 className="section">模板</h2>
      <div className="chips">
        {PRESETS.map((p) => (
          <button key={p.id} className={"chip" + (presetId === p.id ? " on" : "")} onClick={() => onPreset(p.id)}>
            {p.name}
          </button>
        ))}
        <button className="chip" onClick={onCopy} disabled={!canCopy} style={{ opacity: canCopy ? 1 : 0.4 }}>
          复制上周
        </button>
      </div>

      {props.npcs && props.npcs.length ? (
        <>
          <h2 className="section">本周找谁</h2>
          <div className="small muted" style={{ marginBottom: 4 }}>主要</div>
          <div className="chips">
            {props.npcs.map((n) => (
              <button key={"p" + n.id} className={"chip" + (props.socialTarget === n.id ? " on" : "")} onClick={() => props.onTarget && props.onTarget(n.id)}>
                {n.name}·{n.seat}
              </button>
            ))}
          </div>
          <div className="small muted" style={{ marginBottom: 4, marginTop: 8 }}>次要（可以空着）</div>
          <div className="chips">
            {props.npcs.map((n) => (
              <button key={"s" + n.id} className={"chip" + (props.socialTarget2 === n.id ? " on" : "")} onClick={() => props.onTarget2 && props.onTarget2(props.socialTarget2 === n.id ? "" : n.id)}>
                {n.name}
              </button>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 6 }}>
            本周的社交行动和社交事件围着「主要」转；「次要」只拿到一半。两个都没选的人，关系会慢慢淡下去。
          </p>
        </>
      ) : null}

      <h2 className="section">工作日 · 全天重点 + 晚自习</h2>
      <div className="card">
        {DAYS.map((d, i) => (
          <div key={d} className="row" style={{ marginTop: i === 0 ? 0 : 10 }}>
            <span className="dayname">{d}</span>
            <SlotSelect slot={plan.focus[i] || { a: "free" }} onChange={(s) => setFocus(i, s)} focus />
            <SlotSelect slot={plan.evening[i] || { a: "study", s: "math" }} onChange={(s) => setEvening(i, s)} actions={actions} />
          </div>
        ))}
      </div>

      <h2 className="section">周末 · 六个时段</h2>
      <div className="card">
        <div className="grid2">
          {WEEKEND.map((w, i) => (
            <div key={w} style={{ marginBottom: 6 }}>
              <div className="small muted" style={{ marginBottom: 4 }}>
                {w}
              </div>
              <SlotSelect slot={plan.weekend[i] || { a: "rest" }} onChange={(s) => setWeekend(i, s)} actions={actions} />
            </div>
          ))}
        </div>
      </div>

      <p className="small muted" style={{ marginTop: 12 }}>
        {props.holiday
          ? "假期：学习只剩三成收益，硬学不划算；社团与志愿的效果翻倍并留下记录。运动只改善状态，不直接记分。"
          : "16 个决策点：周一至周五各一个「全天重点」和一个晚自习，周末六段。选「学习」时右侧同一格里选科目。"}
      </p>
    </div>
  );
}