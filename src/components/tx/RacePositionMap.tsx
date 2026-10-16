import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { actualStages, historicalPositions, type PositionForm } from "@/lib/racing-visibility";
import { txApi } from "@/lib/tx-api";
import { Card, Empty, ErrorNote, Loading, Pill, Seg, Silks } from "./ui";

type Runner = { horseId?: string; id?: string; horseNumber: number; nameCh?: string; rank?: number; pWin?: number };
export function RacePositionMap({ date, raceId, distance, picks, frozen }: { date: string; raceId?: string; distance: number; picks: Runner[]; frozen: boolean }) {
  const [scope, setScope] = useState<"picks" | "all">("picks");
  const canonicalId = raceId ? (raceId.startsWith("race_") ? raceId : `race_${raceId}`) : undefined;
  const result = useQuery({ queryKey: ["race-position-result", canonicalId], enabled: Boolean(canonicalId), staleTime: 60_000, refetchInterval: 300_000,
    queryFn: () => txApi.race(canonicalId ?? ""),
  });
  const actual: { horseNumber: number; runningPosition?: string; finishingPosition?: number }[] = result.data?.horses ?? [];
  const settled = actual.some(p => Number(p.finishingPosition) > 0);
  const ids = picks.map(p => p.horseId ?? "").join(",");
  const q = useQuery({ queryKey: ["historical-position-map", date, raceId, distance, ids], staleTime: 300_000,
    queryFn: async () => {
      const entries = canonicalId ? await txApi.raceEntries(canonicalId).catch(() => null) : null;
      const all: Runner[] = Array.isArray(entries?.entries) ? entries.entries : Array.isArray(entries?.horses) ? entries.horses : picks;
      const runners = all.map(p => ({ ...p, horseId: p.horseId ?? p.id })).filter(p => p.horseId);
      const output = [];
      for (let i = 0; i < runners.length; i += 4) {
        output.push(...await Promise.all(runners.slice(i, i + 4).map(async p => {
          const form = await txApi.horseForm(p.horseId ?? "", 30).catch(() => null);
          const history: PositionForm[] = form?.recentForm ?? [];
          return { ...p, failed: !form, summary: historicalPositions(history, date, distance), pick: picks.find(x => x.horseNumber === p.horseNumber) };
        })));
      }
      return output.sort((a, b) => (a.summary.stages[0]?.mid ?? Infinity) - (b.summary.stages[0]?.mid ?? Infinity));
    }, enabled: Boolean(date && picks.length),
  });
  const rows = (q.data ?? []).filter(p => scope === "all" || (p.pick?.rank != null && p.pick.rank <= 4));
  const ordered = scope === "picks" ? rows.slice().sort((a, b) => (a.pick?.rank ?? 99) - (b.pick?.rank ?? 99)) : rows;
  return <Card title="馬匹走位對照" en="Running positions" action={<Pill tone={settled ? "win" : "ink"}>{settled ? "已有賽果" : "賽果待更新"}</Pill>}>
    <div className="mb-3"><Seg value={scope} onChange={setScope} options={[{ value: "picks", label: frozen ? "凍結四揀" : "本場四揀" }, { value: "all", label: "全場馬匹" }]} /></div>
    <div className="mb-3 grid grid-cols-2 gap-3 border-b border-hairline pb-3 text-[11px] leading-relaxed">
      <p className="text-ink-2"><span className="mb-1 block font-bold text-gold">賽前 · 歷史參考</span>過往通常跑喺第幾位</p>
      <p className="text-ink-2"><span className="mb-1 block font-bold text-win">賽後 · 當場實際</span>今場真係跑喺第幾位</p>
    </div>
    <p className="mb-3 text-[11px] leading-relaxed text-ink-3">位置數字越細，越接近領放馬；末段走位唔係終點名次。歷史參考唔係今場已凍結嘅走位預測。</p>
    {result.error ? <ErrorNote error={result.error} /> : !settled ? <p className="mb-3 border-l-2 border-hairline pl-2 text-[11px] text-ink-3">{result.isLoading ? "正在讀取當場賽果…" : "當場走位及終點名次尚未入帳。"}</p> : null}
    {q.isLoading ? <Loading /> : q.error ? <ErrorNote error={q.error} /> : ordered.length ? <div className="divide-y divide-hairline">
      {ordered.map(p => {
        const runner = actual.find(a => a.horseNumber === p.horseNumber);
        const stages = actualStages(runner?.runningPosition);
        const finish = Number(runner?.finishingPosition);
        const hasFinish = Number.isFinite(finish) && finish > 0;
        const selected = p.pick?.rank != null && p.pick.rank <= 4;
        return <article key={p.horseId} className="py-4 first:pt-0 last:pb-0">
          <header className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2"><Silks source={{ horseId: p.horseId ?? null }} size={30} /><span className="tabnum grid h-7 w-7 shrink-0 place-items-center rounded-[4px] bg-deep font-mono-tx text-[13px] font-bold text-deep-fg">{p.horseNumber}</span><h3 className="min-w-0 break-words text-[13px] font-bold text-ink">{p.nameCh || p.pick?.nameCh || "馬名未提供"}</h3></div>
            {selected ? <Pill tone="gold">{frozen ? "凍結" : "初版"}第{p.pick?.rank}選</Pill> : null}
          </header>
          <div className="grid grid-cols-[40px_repeat(3,minmax(0,1fr))] items-center gap-x-2 gap-y-2 text-center text-[11px]">
            <span /><span className="text-ink-3">早段</span><span className="text-ink-3">中段</span><span className="text-ink-3">末段</span>
            <span className="text-left font-bold text-gold">賽前</span>
            {p.summary.stages.map((s, i) => <div key={`history-${i}`} className="relative min-w-0">{i < 2 ? <span aria-hidden="true" className="absolute -right-2 top-2.5 text-ink-3">→</span> : null}<span className="tabnum block rounded-[4px] border border-gold-strong/40 bg-gold-bg py-1.5 font-mono-tx font-bold text-ink">{s.mid == null ? "無資料" : `約${Number(s.mid.toFixed(1))}位`}</span></div>)}
            <span className="text-left font-bold text-win">賽後</span>
            {[0, 1, 2].map(i => <div key={`actual-${i}`} className="relative min-w-0">{i < 2 ? <span aria-hidden="true" className="absolute -right-2 top-2.5 text-ink-3">→</span> : null}<span className={`tabnum block rounded-[4px] border py-1.5 font-mono-tx font-bold ${stages?.[i] != null ? "border-win/30 bg-win/10 text-win" : "border-hairline bg-paper text-ink-3"}`}>{stages?.[i] != null ? `第${stages[i]}位` : "未有資料"}</span></div>)}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-2 text-[11px]">
            <span className="text-ink-3">{p.failed ? "歷史讀取失敗" : `歷史樣本 ${p.summary.n} 仗 · ${p.summary.sameBand ? "同途程組" : "跨途程"}`}</span>
            <span className="font-bold text-ink">終點名次 <span className={hasFinish && finish <= 4 ? "text-win" : "text-ink-3"}>{hasFinish ? `第 ${finish} 名` : "未入帳"}</span></span>
          </div>
          <details className="mt-2 text-[10px] leading-relaxed text-ink-3"><summary className="cursor-pointer">原始走位及歷史範圍</summary><p className="mt-2 break-words">當場完整走位：{runner?.runningPosition || "未有資料"}；最後一個數字為終點，不計入上方走位。</p><p>歷史中間50%範圍：{p.summary.stages.map((s, i) => `${["早段", "中段", "末段"][i]} ${s.low == null ? "無資料" : `${Number(s.low.toFixed(1))}–${Number(s.high?.toFixed(1))}位`}`).join(" · ")}</p></details>
        </article>;
      })}
    </div> : <Empty label={scope === "picks" ? "未有四揀走位資料" : "未有馬匹走位資料"} />}
    <details className="mt-4 border-t border-hairline pt-3 text-[10px] leading-relaxed text-ink-3"><summary className="cursor-pointer">資料來源與限制</summary><p className="mt-2">歷史參考只用 {date} 前近8仗，優先同途程組；「約」為過往位置中位數，唔係今場名次估算。早、中、末段取自走位記錄嘅相對段落，唔係固定米數；不同场次馬數可能不同。</p><p className="mt-1">當場賽果每5分鐘更新。現有接口未提供T−90走位快照，唔計凍結估測誤差；四揀鎖定狀態只指選馬，唔代表上方歷史走位已鎖定。</p></details>
  </Card>;
}