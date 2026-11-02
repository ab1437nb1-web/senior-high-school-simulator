import { useState } from "react";
import type { Choice, Difficulty } from "../sim/types";
import { DIFFICULTY_LABEL } from "../sim/engine";
import type { SlotMeta } from "../save";
import { NPCS } from "../sim/npcs";
import { SeatMap } from "./panels";

export default function Setup(props: { onStart: (c: Choice, d: Difficulty, g: "m" | "f", name: string, seat: { col: number; row: number }, realMode: boolean) => void; slots?: SlotMeta[]; onLoad?: (i: number) => void }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"m" | "f">("f");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [seat, setSeat] = useState<{ col: number; row: number }>({ col: 2, row: 2 });
  // 默认真实模式；官方作弊入口只通过 URL 参数开启，界面上没有任何提示
  const [easyComp] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).has("easycomp");
    } catch {
      return false;
    }
  });

  const start = () => {
    // 开局不选科：高一上按九科走，选科放到高一下之前
    props.onStart({ first: "physics", second: ["chemistry", "geography"] }, difficulty, gender, name.trim() || "你", seat, !easyComp);
  };

  return (
    <div style={{ padding: "28px 20px 40px" }}>
      <div className="serif" style={{ fontSize: 26, lineHeight: 1.3 }}>高一开学</div>
      <p className="small muted" style={{ marginTop: 6 }}>
        九门课同时开。选科表要到高一结束前才发下来。
      </p>

      <h2 className="section">你叫什么</h2>
      <input className="key" value={name} maxLength={8} placeholder="同学会这样叫你" onChange={(e) => setName(e.target.value)} />

      <h2 className="section">你坐在哪</h2>
      <SeatMap npcs={NPCS as any[]} playerSeat={seat} onPick={setSeat} />
      <p className="small muted" style={{ marginTop: 6 }}>
        点一个空位坐下。前两排听课更稳，后排更自由；同桌和前后桌才是够得着的人。
      </p>

      <h2 className="section">性别</h2>
      <div className="chips">
        <button className={"chip" + (gender === "f" ? " on" : "")} onClick={() => setGender("f")}>女生</button>
        <button className={"chip" + (gender === "m" ? " on" : "")} onClick={() => setGender("m")}>男生</button>
      </div>

      <h2 className="section">难度</h2>
      <div className="chips">
        {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
          <button key={d} className={"chip" + (difficulty === d ? " on" : "")} onClick={() => setDifficulty(d)}>
            {DIFFICULTY_LABEL[d]}
          </button>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 6 }}>难度决定知识衰减的速度：学会了不管，就会忘。越高越快。</p>

      <button className="btn" style={{ marginTop: 18 }} onClick={start}>开始第 1 周</button>

      {props.slots?.some(Boolean) ? (
        <>
          <h2 className="section">读取存档</h2>
          <div className="card">
            {props.slots.map((s, idx) => {
              if (!s) return null;
              return (
                <div key={s.index} className="row" style={{ marginTop: idx === 0 ? 0 : 8 }}>
                  <div className="grow small"><b>槽位 {s.index}</b><span className="muted"> · 第 {s.week} 周</span></div>
                  <button className="chip" onClick={() => props.onLoad && props.onLoad(s.index)}>读取</button>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}