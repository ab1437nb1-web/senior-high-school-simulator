import { qiangjiScore } from "../.tmp/engine.mjs";
for (const [s, lv] of [[0, "决赛银牌"], [0, ""], [1, "决赛银牌"], [12, "决赛银牌"], [12, ""], [6, ""]]) {
  const r = qiangjiScore(600, s, lv);
  console.log("训练" + s, lv || "无奖项", "-> 校测", r.interview.toFixed(1), "| 高考600 综合", r.composite.toFixed(1));
}
