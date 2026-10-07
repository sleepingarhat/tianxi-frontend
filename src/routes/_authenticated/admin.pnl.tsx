import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AdminHead, Kpi, NoteBox, Panel, fmtMoney, fmtPct } from "@/components/admin/kit";
import { useFootballLedger, useRacingPnl, type LedgerRow } from "@/components/admin/data";
import { ledgerFixture, useFixture } from "@/components/admin/fixtures";
import { EChart } from "@/components/tx/EChart";
import { settlePnl } from "@/lib/footballDualEngine";
import { ExoticTrioPools } from "@/components/tx/ExoticTrioPools";
import { txApi } from "@/lib/tx-api";
import { hkToday } from "@/lib/hkTime";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/pnl")({
  head: () => ({ meta: [{ title: "盈虧 · 天喜監控端" }, { name: "description", content: "天喜賽馬策略、孖T三T逐日成本派彩及足球盈虧。" }, { property: "og:title", content: "盈虧 · 天喜監控端" }, { property: "og:description", content: "核對賽馬跨場彩池及足球帳面表現。" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Pnl,
});

function curve(points: { x: string; v: number }[]) {
  let cum = 0, peak = 0, dd = 0;
  const cumArr = points.map((p) => { cum += p.v; peak = Math.max(peak, cum); dd = Math.min(dd, cum - peak); return { x: p.x, cum }; });
  return { cumArr, maxDD: dd, total: cum };
}

const chart = (data: { x: string; cum: number }[], name: string) => ({
  backgroundColor: "transparent",
  textStyle: { color: "#D0D6D0" },
  tooltip: { trigger: "axis" as const },
  grid: { left: 56, right: 12, top: 16, bottom: 28 },
  xAxis: { type: "category" as const, data: data.map((d) => d.x), axisLine: { lineStyle: { color: "rgba(212,161,30,0.3)" } } },
  yAxis: { type: "value" as const, splitLine: { lineStyle: { color: "rgba(212,161,30,0.08)" } } },
  series: [{ name, type: "line" as const, showSymbol: false, data: data.map((d) => Math.round(d.cum * 10) / 10), lineStyle: { color: "#D4A11E" }, areaStyle: { color: "rgba(212,161,30,0.12)" } }],
});

function Pnl() {
  const rp = useRacingPnl();
  const led = useFootballLedger();
  const meets = useQuery({ queryKey: ["meetings", 12], queryFn: () => txApi.meetings("?limit=12") });
  const [trioDate, setTrioDate] = useState("");
  const dates: string[] = [...new Set<string>((meets.data?.meetings ?? []).map((m: { date?: string }) => String(m.date ?? "")).filter((d: string) => d && d <= hkToday()))].sort().reverse();
  const selectedDate = trioDate || dates[0] || "";
  const fRows = useFixture<LedgerRow[]>(led.data ?? [], { demo: ledgerFixture("demo") as LedgerRow[], worst: ledgerFixture("worst") as LedgerRow[] });
  const versions = useMemo(() => [...new Set(fRows.map((r) => r.version))], [fRows]);
  const [ver, setVer] = useState<string>("all");

  const racing = useMemo(() => {
    const pts = ((rp.data?.points ?? []) as any[]).map((p) => ({ x: p.date as string, v: Number(p.net) || 0 }));
    return curve(pts);
  }, [rp.data]);

  const fb = useMemo(() => {
    const rows = fRows.filter((r) => ver === "all" || r.version === ver).filter((r) => r.ftr).sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc));
    let hit = 0, bets = 0, staked = 0;
    const pts: { x: string; v: number }[] = [];
    for (const r of rows) {
      if (!r.ftr) continue;
      if (r.ftr === r.prediction) hit++;
      const p = settlePnl(r.prediction, r.ftr, r.pick_odds, r.stake);
      if (p !== null) { bets++; staked += r.stake; pts.push({ x: r.kickoff_utc.slice(0, 10), v: p }); }
    }
    const c = curve(pts);
    return { ...c, settled: rows.length, hit, bets, staked, roi: staked ? (c.total / staked) * 100 : null };
  }, [fRows, ver]);

  return (
    <>
      <AdminHead title="盈虧" en="P&L" desc="賽馬每注 $10；四揀複式累計與孖T／三T 逐日核對分開列。足球按帳面注碼（現行 $100）。負數照實展示。" onRefresh={() => { rp.refetch(); led.refetch(); meets.refetch(); }} refreshing={rp.isFetching || led.isFetching} />
      <Panel title="賽馬策略" en="Racing · $10/注">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="淨盈虧" value={fmtMoney(rp.data?.totalNet, 0)} tone={(rp.data?.totalNet ?? 0) >= 0 ? "win" : "lose"} sub={`${rp.data?.from ?? "—"} 至 ${rp.data?.to ?? "—"}`} />
          <Kpi label="回報率 ROI" value={fmtPct(rp.data?.roiPct)} />
          <Kpi label="最大回撤" value={fmtMoney(racing.maxDD, 0)} tone="lose" />
          <Kpi label="投注場數" value={rp.data?.racesBet ?? "—"} sub={`${rp.data?.daysEvaluated ?? "—"} 個賽馬日`} />
        </div>
        {racing.cumArr.length ? <div className="mt-3"><EChart height={220} ariaLabel="賽馬累計盈虧" option={chart(racing.cumArr.map((d) => ({ x: d.x, cum: d.cum })), "累計")} /></div> : null}
        {rp.data?.poolBreakdown ? (
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {Object.entries(rp.data.poolBreakdown as Record<string, any>).map(([k, v]) => (
              <div key={k} className="rounded-[8px] border border-hairline bg-paper-3 px-3 py-2">
                <p className="text-[10px] text-ink-3">{({ FF: "四連環", TRIO: "單T", TIERCE: "三重彩", QUARTET: "四重彩" } as Record<string, string>)[k] ?? k}</p>
                <p className={`tabnum font-mono-tx text-[14px] ${v.net >= 0 ? "text-win" : "text-lose"}`}>{fmtMoney(v.net, 0)}</p>
                <p className="text-[10px] text-ink-3">中 {v.wins} / {v.bets}</p>
              </div>
            ))}
          </div>
        ) : null}
      </Panel>

      <section className="mt-4 min-w-0" aria-label="孖T三T逐日核對">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label id="trio-date-label" className="text-[12px] font-bold text-ink">孖T／三T 賽馬日</label>
          <Select value={selectedDate} onValueChange={setTrioDate}>
            <SelectTrigger aria-labelledby="trio-date-label" className="w-[170px] border-hairline bg-paper-3 text-ink"><SelectValue placeholder="選擇賽馬日" /></SelectTrigger>
            <SelectContent>{dates.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-ink-3">二拖三複式：孖T 9 注 $90，三T 27 注 $270。正獎、安慰獎與成本逐日核對，未併入上方四揀累計。</p>
        {selectedDate ? <ExoticTrioPools date={selectedDate} /> : <NoteBox>{meets.isError ? "賽馬日讀取失敗，請重新整理。" : meets.isLoading ? "讀取賽馬日中…" : "暫無賽馬日資料。"}</NoteBox>}
      </section>

      <Panel
        title="足球雙引擎"
        en="Football"
        className="mt-4"
        right={
          <select value={ver} onChange={(e) => setVer(e.target.value)} className="rounded-[6px] border border-hairline bg-paper-3 px-2 py-1 text-[11px] text-ink">
            <option value="all">全部版本</option>
            {versions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        }
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="淨盈虧" value={fmtMoney(fb.total)} tone={fb.total >= 0 ? "win" : "lose"} sub={`${fb.bets} 注有賠率`} />
          <Kpi label="命中率" value={fb.settled ? fmtPct((fb.hit / fb.settled) * 100) : "—"} sub={`${fb.hit} / ${fb.settled} 場`} />
          <Kpi label="ROI" value={fmtPct(fb.roi)} />
          <Kpi label="最大回撤" value={fmtMoney(fb.maxDD)} tone="lose" />
        </div>
        {fb.cumArr.length ? <div className="mt-3"><EChart height={220} ariaLabel="足球累計盈虧" option={chart(fb.cumArr, "累計")} /></div> : <div className="mt-3"><NoteBox>呢個版本未有已結算而有賠率嘅場次。</NoteBox></div>}
      </Panel>
    </>
  );
}
