import type { ReactNode } from "react";

import { FootballCrest } from "./FootballCrest";
import { OverflowTicker } from "./OverflowTicker";

/** 足球各頁共用字彙：主／和／客一律呢三個字 */
export const SIDE_ZH = ["主勝", "和局", "客勝"] as const;

export type CrestRow = {
  /** 已譯好嘅顯示隊名（繁中／HKJC 對照） */
  name: string;
  /** 官方隊徽 URL，冇或失效時 FootballCrest 自動退回派生識別標 */
  crest: string | null;
  /** 右側一直行嘅數字（實入球、預期入球 λ 等） */
  value: ReactNode;
};

/**
 * 計分板：主上客下，隊徽／隊名／右側數字各自一直行。
 * 全站足球頁（賽前預測、預測 vs 賽果、球隊頁）共用同一排版，窄螢幕都對齊。
 */
export function CrestScoreboard({
  rows,
  badge,
  crestSize = 26,
  valueWidth = "1.75rem",
  valueClass = "text-[15px] text-ink",
}: {
  rows: CrestRow[];
  crestSize?: number;
  /** 右側固定格（命中狀態、鎖定狀態等） */
  badge?: ReactNode;
  /** 右側數字欄闊（預期入球要兩位小數時可闊啲） */
  valueWidth?: string;
  valueClass?: string;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
      <div className="min-w-0">
        {rows.map((r, i) => (
          <div
            key={`${i}-${r.name}`}
            className="grid h-8 min-w-0 items-center gap-2"
            style={{ gridTemplateColumns: `calc(${crestSize}px + 0.25rem) minmax(0,1fr) ${valueWidth}` }}
          >
            <span className="grid place-items-center" style={{ width: crestSize + 4, height: crestSize + 4 }}>
              <FootballCrest name={r.name} src={r.crest} size={crestSize} />
            </span>
            <OverflowTicker className="text-center font-serif-tc text-[14px] font-bold text-ink">{r.name}</OverflowTicker>
            <span className={`tabnum text-right font-mono-tx font-bold ${valueClass}`}>{r.value}</span>
          </div>
        ))}
      </div>
      {badge}
    </div>
  );
}

/** 三格機率（主／和／客）橫條：同一排版，只換配色同小數位 */
export function ProbBars({
  p,
  mark,
  tone = "gold",
  digits = 1,
  showDot = false,
}: {
  p: number[];
  /** 要標出嘅一格（賽前＝最高格；結算後＝實際賽果格），-1 表示冇 */
  mark: number;
  tone?: "gold" | "win";
  digits?: 0 | 1;
  showDot?: boolean;
}) {
  const pc = (v: number) => `${(v * 100).toFixed(digits)}%`;
  const barOn = tone === "gold" ? "bg-gold" : "bg-win";
  const barOff = tone === "gold" ? "bg-ink-3/45" : "bg-ink-3/50";
  const labelOn = tone === "gold" ? "text-ink" : "text-win";
  return (
    <div className="space-y-1">
      {[0, 1, 2].map((i) => {
        const v = p[i] ?? 0;
        const on = i === mark;
        return (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`w-8 shrink-0 text-[10px] font-bold ${on ? labelOn : "text-ink-2"}`}>{SIDE_ZH[i]}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-[2px] bg-hairline">
              <span
                className={`block h-full ${on ? barOn : barOff}`}
                style={{ width: `${Math.round(v * 100)}%` }}
              />
            </span>
            <span
              className={`tabnum w-10 shrink-0 text-right font-mono-tx text-[10px] ${
                on ? "font-bold text-ink" : "text-ink-2"
              }`}
            >
              {pc(v)}
            </span>
            {showDot ? <span className="w-3 shrink-0 text-[10px] text-win">{on ? "●" : ""}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

/** 版本指紋：一行顯示、水平可滾動；裝唔落時右邊顯示漸變提示可以撳 */
export function FingerprintChip({
  values,
  label = "版本指紋",
  note,
}: {
  values: (string | null | undefined)[];
  label?: string;
  note?: string;
}) {
  const uniq = [...new Set(values.map((v) => v?.trim() ?? "").filter((v) => v.length > 0))];
  const text = uniq.join(" / ");
  if (uniq.length === 0) return null;
  return (
    <div className="mt-1.5 flex max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-[7px] border border-hairline bg-paper px-2 py-1">
      <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">{label}</span>
      <OverflowTicker className="flex-1 font-mono-tx text-[10px] leading-none text-ink-2">
        {text}{note ? ` · ${note}` : ""}
      </OverflowTicker>
    </div>
  );
}

