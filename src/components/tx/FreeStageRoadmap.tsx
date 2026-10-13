import { Link } from "@tanstack/react-router";

import { FREE_STAGE_GOAL_MEMBERS } from "@/lib/freeStage";
import { Card, Pill } from "@/components/tx/ui";

/** 全站商業路線：免費階段 → 目標門檻 → 出 App 同收費。門檻由用戶拍板（2026-10-13），改動要同步藍圖／roadmap／dev-log。 */
const GOAL_MEMBERS = FREE_STAGE_GOAL_MEMBERS;

const STEPS: { id: string; name: string; state: "now" | "todo"; desc: string; tag: string }[] = [
  {
    id: "01",
    name: "而家：全站免費",
    state: "now",
    desc: "香港賽馬全部功能免費使用，包括四揀預測、排位表、逐場對帳、六彩池策略盈虧同回測。冇隱藏收費、冇試用期倒數。",
    tag: "進行中",
  },
  {
    id: "02",
    name: `目標：免費會員 ${GOAL_MEMBERS.toLocaleString()} 人`,
    state: "todo",
    desc: "登記會員累積至這個數目先至進入下一步。未達標之前，收費同 App 都唔會悄悄推出；達標當日會喺呢頁同會員頁公告。",
    tag: "等呢一步",
  },
  {
    id: "03",
    name: "之後：出 iOS App ＋開始收費",
    state: "todo",
    desc: "達標後先排 iOS App Store 上架，同時開啟付費方案。已鎖定嘅預測、公開對帳同歷史成績一律照舊免費、唔改數。",
    tag: "未開放",
  },
];

export function FreeStageRoadmap() {
  return (
    <Card
      title="項目路線圖"
      en="Roadmap"
      action={
        <div className="flex items-center gap-1.5">
          <Pill tone="win">全站免費中</Pill>
          <Link to="/membership" className="font-mono-tx text-[10px] font-bold text-gold hover:underline">
            睇方案 →
          </Link>
        </div>
      }
    >
      <div className="mb-3 flex gap-1">
        {STEPS.map((s) => (
          <span
            key={s.id}
            className={`h-1.5 flex-1 rounded-full ${s.state === "now" ? "animate-pulse bg-gold" : "bg-hairline"}`}
          />
        ))}
      </div>
      <ol className="relative ml-3 border-l border-hairline">
        {STEPS.map((s) => (
          <li key={s.id} className="relative pb-3 pl-5 last:pb-0">
            <span
              className={`absolute -left-[9px] top-0.5 grid h-[18px] w-[18px] place-items-center rounded-full border-2 font-mono-tx text-[9px] font-bold ${
                s.state === "now" ? "border-gold bg-gold-bg text-gold" : "border-hairline bg-paper text-ink-3"
              }`}
            >
              {s.state === "now" ? "●" : ""}
            </span>
            <div
              className={`rounded-[10px] border px-2.5 py-2 ${
                s.state === "now" ? "border-gold-strong/40 bg-gold-bg" : "border-hairline bg-paper"
              }`}
            >
              <p className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono-tx text-[10px] font-bold text-ink-3">{s.id}</span>
                <span className="font-serif-tc text-[13px] font-bold leading-tight text-ink">{s.name}</span>
                <Pill tone={s.state === "now" ? "gold" : "ink"}>{s.tag}</Pill>
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-ink-3">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-2 rounded-[8px] border border-hairline bg-paper-2 px-2.5 py-2 text-[10px] leading-relaxed text-ink-2">
        <b className="text-ink">觸發條件只有一個：免費會員累積 {GOAL_MEMBERS.toLocaleString()} 人。</b>
        呢個門檻唔會因為個別場次輸贏而改動；達到之後先開始收費同推出 iOS App。公開對帳永久免費。
      </p>
    </Card>
  );
}
