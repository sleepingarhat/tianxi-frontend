import { useQuery } from "@tanstack/react-query";
import { historicalPositions, type PositionForm } from "@/lib/racing-visibility";
import { txApi } from "@/lib/tx-api";
import { Card, Empty, ErrorNote, Loading, Pill, Silks } from "./ui";

type Runner = { horseId?: string; id?: string; horseNumber: number; nameCh?: string; rank?: number; pWin?: number };
export function RacePositionMap({ date, raceId, distance, picks, frozen }: { date: string; raceId?: string; distance: number; picks: Runner[]; frozen: boolean }) {
  const ids = picks.map(p => p.horseId ?? "").join(",");
  const q = useQuery({ queryKey: ["historical-position-map", date, raceId, distance, ids], staleTime: 300_000,
    queryFn: async () => {
      const entries = raceId ? await txApi.raceEntries(raceId).catch(() => null) : null;
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
  return <Card title="速勢走位 · 賽前歷史參考" en="Historical speed map" action={<Pill tone="gold">{frozen ? "四揀已鎖" : "初版"}</Pill>}>
    <p className="mb-3 text-[11px] leading-relaxed text-ink-2">只用 {date} 之前近8仗；優先同途程組。數字係過往早段、中段、末段位置中位數，括號為中間50%範圍；終點名次不入走位圖。唔係 SpeedPRO 能量評級或新模型。</p>
    {q.isLoading ? <Loading /> : q.error ? <ErrorNote error={q.error} /> : q.data?.length ? <div>
      <div className="grid grid-cols-[minmax(85px,1.4fr)_repeat(3,minmax(0,1fr))] gap-1 border-b border-hairline pb-2 text-center text-[10px] text-ink-3"><span className="text-left">馬匹／樣本</span><span>早段</span><span>中段</span><span>末段</span></div>
      {q.data.map(p => <div key={p.horseId} className={`grid grid-cols-[minmax(85px,1.4fr)_repeat(3,minmax(0,1fr))] items-center gap-1 border-b border-hairline py-2 ${frozen && (p.pick?.rank ?? 99) <= 4 ? "bg-gold-bg" : ""}`}>
        <div className="min-w-0"><div className="flex items-center gap-1"><Silks source={{ horseId: p.horseId ?? null }} size={24} /><span className="break-words text-[10px] font-bold text-ink">#{p.horseNumber} {p.nameCh}</span></div><p className="mt-1 text-[9px] text-ink-3">{p.failed ? "讀取失敗" : `${p.summary.n}仗${p.summary.sameBand ? " · 同程組" : " · 跨程"}`}</p>{frozen && (p.pick?.rank ?? 99) <= 4 ? <span className="text-[9px] font-bold text-gold">凍結第{p.pick?.rank}選</span> : null}</div>
        {p.summary.stages.map((s, i) => <div key={i} className="min-w-0 text-center"><span className={`mx-auto grid h-7 w-7 place-items-center rounded-full border font-mono-tx text-[11px] font-bold ${s.mid != null && s.mid <= 3 ? "border-win/40 bg-win/10 text-win" : s.mid != null && s.mid >= 8 ? "border-hairline bg-paper text-ink-3" : "border-gold-strong/40 bg-gold-bg text-gold"}`}>{s.mid?.toFixed(1) ?? "—"}</span><p className="tabnum mt-1 text-[8px] text-ink-3">{s.low == null ? "未有走位" : `${s.low.toFixed(1)}–${s.high?.toFixed(1)}`}</p></div>)}
      </div>)}
    </div> : <Empty label="未有賽前歷史走位" />}
    <p className="mt-3 text-[10px] leading-relaxed text-ink-3">前列 ≤3位 · 居中 3–8位 · 留後 ≥8位。不同場次馬數不一，位置不能當勝算。途程 Elo 軸及 T−90 走位快照未由現有接口提供：本圖係日期截點只讀統計，未冒稱模型已凍結走位。</p>
  </Card>;
}