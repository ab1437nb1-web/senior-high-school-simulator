import { qiangjiScore } from "../.tmp/engine.mjs";
for (const g of [560, 600, 640, 680]) {
  for (const [s, lv] of [[12, "决赛银牌"], [12, ""], [6, "决赛银牌"]]) {
    const r = qiangjiScore(g, s, lv);
    console.log("高考" + g, "训练" + s, lv || "无奖项", "-> 高考部分", r.gaokaoPart.toFixed(1), "校测", r.interview.toFixed(1), "综合", r.composite.toFixed(1));
  }
}
