import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";

import { AdminHead, DataTable, Kpi, NoteBox, Panel, StatusBadge, useMemoCols, type Status } from "@/components/admin/kit";
import { useEngineHealth, useFootballLedger, useModelVersions, useRollup, type LedgerRow } from "@/components/admin/data";
import { EChart } from "@/components/tx/EChart";
import eloV2 from "@/data/football-elo-v2.json";
import { getFootballSeasonReport } from "@/lib/ops-history.functions";
import type { FootballSeasonReport } from "@/lib/football-season-report";

export const Route = createFileRoute("/_authenticated/admin/engine-health")({
  head: () => ({ meta: [{ title: "引擎健康 · 天喜監控端" }, { name: "robots", content: "noindex" }] }),
  component: EngineHealth,
});

const IDX = { home: 0, draw: 1, away: 2 } as const;
/** 由鎖定帳 p_final 對 90 分鐘賽果計 logloss／Brier／ECE（10 格，按最高格信心） */
function calib(rows: LedgerRow[]) {
  const done = rows.filter((r) => r.ftr && Array.isArray(r.p_final) && r.p_final.length === 3);
  const n = done.length;
  if (!n) return null;
  let ll = 0, br = 0, hit = 0;
  const bins = Array.from({ length: 10 }, () => ({ n: 0, conf: 0, acc: 0 }));
  for (const r of done) {
    const p = r.p_final.map((x) => Math.min(1 - 1e-6, Math.max(1e-6, Number(x))));
    const y = IDX[r.ftr!];
    ll += -Math.log(p[y]!);
    br += p.reduce((a, v, i) => a + (v - (i === y ? 1 : 0)) ** 2, 0);
    const top = p.indexOf(Math.max(...p));
    const ok = top === y ? 1 : 0;
    hit += ok;
    const b = bins[Math.min(9, Math.floor(p[top]! * 10))]!;
    b.n++; b.conf += p[top]!; b.acc += ok;
  }
  const ece = bins.reduce((a, b) => a + (b.n ? (b.n / n) * Math.abs(b.acc / b.n - b.conf / b.n) : 0), 0);
  return {
    n, logloss: ll / n, brier: br / n, ece, acc: hit / n,
    bins: bins.map((b, i) => ({ mid: (i + 0.5) / 10, n: b.n, conf: b.n ? b.conf / b.n : null, acc: b.n ? b.acc / b.n : null })),
  };
}

type Check = { key: string; label: string; status: Status; detail: string };

function EngineHealth() {
  const getSeasonReport = useServerFn(getFootballSeasonReport);
  const seasonReport = useQuery({ queryKey: ["admin", "football-season-report"], queryFn: () => getSeasonReport({ data: { format: "json" } }) });
  const eh = useEngineHealth();
  const roll = useRollup();
  const mv = useModelVersions();
  const d = eh.data ?? {};
  const raw: any[] = d.checks ?? d.gates ?? [];
  const checks: Check[] = raw.map((c: any, i: number) => ({
    key: String(c.key ?? c.id ?? i),
    label: String(c.label ?? c.name ?? c.key ?? `檢查 ${i + 1}`),
    status: (["PASS", "WATCH", "FAIL"].includes(String(c.status).toUpperCase()) ? String(c.status).toUpperCase() : "WATCH") as Status,
    detail: String(c.note ?? c.detail ?? c.message ?? ""),
  }));
  const cols = useMemoCols<Check>(() => [
    { accessorKey: "label", header: "檢查項" },
    { accessorKey: "status", header: "狀態", cell: (c) => <StatusBadge s={c.getValue() as Status} /> },
    { accessorKey: "detail", header: "說明", cell: (c) => <span title={String(c.getValue())}>{String(c.getValue()) || "—"}</span> },
  ]);
  const fb = (mv.data ?? []).find((v) => v.engine === "football" && v.status === "active");
  const rc = (mv.data ?? []).find((v) => v.engine === "racing" && v.status === "active");
  const led = useFootballLedger();
  const versions = [...new Set((led.data ?? []).map((r) => r.version))].sort().reverse();
  const cal = versions.map((v) => ({ v, c: calib((led.data ?? []).filter((r) => r.version === v)) }));
  const cur = cal.find((x) => x.c) ?? null;
  const seasons: any[] = (eloV2 as any).seasons ?? (eloV2 as any).validation ?? [];
  const seasonRows = seasonReport.data?.format === "json" ? seasonReport.data.rows : [];
  const seasonCols = useMemoCols<FootballSeasonReport>(() => [
    { accessorKey: "season", header: "賽季" }, { accessorKey: "version", header: "版本" },
    { accessorKey: "stake", header: "注碼", cell: (cell) => `$${Number(cell.getValue()).toLocaleString()}` },
    { accessorKey: "settled", header: "結算／鎖定", cell: (cell) => { const row = cell.row.original; return `${row.settled}/${row.locked}`; } },
    { accessorKey: "hitRate", header: "命中", cell: (cell) => cell.getValue() == null ? "—" : `${(Number(cell.getValue()) * 100).toFixed(1)}%` },
    { accessorKey: "homeHit", header: "主" }, { accessorKey: "drawHit", header: "和" }, { accessorKey: "awayHit", header: "客" },
    { accessorKey: "rps", header: "RPS", cell: (cell) => cell.getValue() == null ? "—" : Number(cell.getValue()).toFixed(4) },
    { accessorKey: "logloss", header: "Logloss", cell: (cell) => cell.getValue() == null ? "—" : Number(cell.getValue()).toFixed(4) },
    { accessorKey: "brier", header: "Brier", cell: (cell) => cell.getValue() == null ? "—" : Number(cell.getValue()).toFixed(4) },
    { accessorKey: "ece", header: "ECE", cell: (cell) => cell.getValue() == null ? "—" : `${(Number(cell.getValue()) * 100).toFixed(1)}%` },
    { accessorKey: "pnl", header: "淨盈虧", cell: (cell) => `${Number(cell.getValue()) >= 0 ? "+" : "−"}$${Math.abs(Number(cell.getValue())).toLocaleString()}` },
  ]);
  const downloadReport = async (format: "json" | "csv") => {
    const result = await getSeasonReport({ data: { format } });
    const content = result.format === "csv" ? result.content : JSON.stringify({ generatedAt: result.generatedAt, rows: result.rows }, null, 2);
    const blob = new Blob([content], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href; anchor.download = `tianxi-football-season-report.${format}`; anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <>
      <AdminHead title="引擎健康" en="Engine Health" desc="賽馬 TX-Oracle 守門閘、足球雙引擎版本同 Elo 驗證指標。只讀，唔會改任何設定。" onRefresh={() => eh.refetch()} refreshing={eh.isFetching} updatedAt={d.generatedHKT} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="賽馬總閘" value={d.overall ?? "—"} tone={d.overall === "PASS" ? "win" : d.overall === "FAIL" ? "lose" : "gold"} sub={d.engine ?? ""} />
        <Kpi label="PASS / WATCH / FAIL" value={`${d.counts?.pass ?? 0} / ${d.counts?.watch ?? 0} / ${d.counts?.fail ?? 0}`} />
        <Kpi label="四揀平均（90 日）" value={roll.data?.top4AvgIntersect?.toFixed?.(2) ?? "—"} tone="gold" sub="目標 3.0 · 市場熱門 2.31" />
        <Kpi label="賽季" value={d.season?.label ?? "—"} sub={`下次 ${d.season?.nextMeeting ?? "—"}`} />
      </div>
      {d.summary ? <div className="mt-3"><NoteBox>{d.summary}</NoteBox></div> : null}
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Panel title="賽馬守門閘" en="Racing Gates" className="lg:col-span-2">
          {checks.length ? <DataTable data={checks} columns={cols} searchable={false} pageSize={30} /> : <p className="text-[12px] text-ink-3">{eh.isLoading ? "讀取中…" : "後端未提供逐項檢查"}</p>}
        </Panel>
        <Panel title="版本指紋" en="Fingerprint">
          {[["賽馬", rc], ["足球", fb]].map(([n, v]: any) => (
            <div key={n} className="mb-3 min-w-0">
              <p className="text-[11px] text-ink-3">{n}</p>
              <p className="truncate font-mono-tx text-[13px] text-ink">{v?.version ?? "—"}</p>
              <p className="break-all font-mono-tx text-[10px] text-ink-3">{v?.fingerprint ?? "未有指紋"}</p>
              <p className="font-mono-tx text-[10px] text-ink-3">定版 {v?.released_at ?? "—"}</p>
            </div>
          ))}
          <p className="font-mono-tx text-[10px] text-ink-3">LGB：{d.constraintsLive?.objective ?? "—"} · leaves {d.constraintsLive?.numLeaves ?? "—"} · lr {d.constraintsLive?.learningRate ?? "—"}</p>
        </Panel>
      </div>
      <Panel title="足球實戰校準" en="Live logloss / ECE" className="mt-4">
        {led.isLoading ? <p className="text-[12px] text-ink-3">讀取中…</p> : !cur ? <p className="text-[12px] text-ink-3">未有已完賽嘅鎖定場次</p> : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <Kpi label="版本" value={cur.v} sub={`已完賽 ${cur.c!.n} 場`} />
              <Kpi label="Logloss" value={cur.c!.logloss.toFixed(3)} tone={cur.c!.logloss < Math.log(3) ? "win" : "lose"} sub={`隨機 ${Math.log(3).toFixed(3)}`} />
              <Kpi label="Brier" value={cur.c!.brier.toFixed(3)} tone={cur.c!.brier < 2 / 3 ? "win" : "lose"} sub="隨機 0.667" />
              <Kpi label="ECE" value={(cur.c!.ece * 100).toFixed(1) + "%"} tone={cur.c!.ece < 0.05 ? "win" : "gold"} sub="< 5% 算校準良好" />
              <Kpi label="命中率" value={(cur.c!.acc * 100).toFixed(1) + "%"} sub="隨機 33.3%" />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <EChart
                height={220}
                ariaLabel="校準曲線"
                option={{
                  backgroundColor: "transparent",
                  textStyle: { color: "#D0D6D0" },
                  tooltip: { trigger: "axis" },
                  legend: { textStyle: { color: "#8A8F88" } },
                  grid: { left: 40, right: 16, top: 32, bottom: 28 },
                  xAxis: { type: "value", min: 0.3, max: 1, name: "信心", splitLine: { show: false } },
                  yAxis: { type: "value", min: 0, max: 1, name: "實際命中", splitLine: { lineStyle: { color: "rgba(212,161,30,0.08)" } } },
                  series: [
                    { name: "完美校準", type: "line", data: [[0.3, 0.3], [1, 1]], symbol: "none", lineStyle: { color: "#8A8F88", type: "dashed" } },
                    { name: "實戰", type: "line", data: cur.c!.bins.filter((b) => b.n).map((b) => [b.conf, b.acc, b.n]), lineStyle: { color: "#D4A11E" }, itemStyle: { color: "#D4A11E" }, symbolSize: (d: number[]) => 6 + Math.min(14, d[2] ?? 0) },
                  ],
                }}
              />
              <table className="w-full text-[12px]">
                <thead><tr className="text-left text-ink-3"><th>版本</th><th>場數</th><th>Logloss</th><th>Brier</th><th>ECE</th><th>命中</th></tr></thead>
                <tbody>
                  {cal.map(({ v, c }) => (
                    <tr key={v} className="font-mono-tx text-ink">
                      <td>{v}</td><td>{c?.n ?? 0}</td><td>{c ? c.logloss.toFixed(3) : "—"}</td><td>{c ? c.brier.toFixed(3) : "—"}</td><td>{c ? (c.ece * 100).toFixed(1) + "%" : "—"}</td><td>{c ? (c.acc * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-ink-3">用鎖定帳賽前凍結機率對 90 分鐘賽果即時計，每個版本獨立計、唔回填。樣本少時 ECE 波動大。賽馬引擎只鎖排名唔鎖機率，所以冇 logloss／ECE。</p>
          </>
        )}
      </Panel>
      <Panel
        title="足球逐季正式帳評核"
        en="Season report"
        className="mt-4"
        right={<div className="flex gap-1"><button type="button" onClick={() => downloadReport("csv")} className="inline-flex items-center gap-1 rounded-[6px] border border-hairline px-2 py-1 text-[10px] text-ink-2"><Download className="h-3 w-3" />CSV</button><button type="button" onClick={() => downloadReport("json")} className="inline-flex items-center gap-1 rounded-[6px] border border-hairline px-2 py-1 text-[10px] text-ink-2"><Download className="h-3 w-3" />JSON</button></div>}
      >
        <DataTable data={seasonRows} columns={seasonCols} pageSize={20} empty={seasonReport.isLoading ? "整理鎖定帳與賽果中…" : "未有逐季正式帳資料"} />
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">按版本、實際注碼及開賽日期所屬賽季獨立計算；未結算只列入鎖定場數，唔會當輸。呢份係正式鎖定帳，與下方 Elo 離線重訓驗證分開。</p>
      </Panel>
      {seasons.length ? (
        <Panel title="足球 Elo 逐季 RPS" en="Football RPS by Season" className="mt-4">
          <EChart
            height={220}
            ariaLabel="足球逐季 RPS"
            option={{
              backgroundColor: "transparent",
              textStyle: { color: "#D0D6D0" },
              tooltip: { trigger: "axis" },
              legend: { textStyle: { color: "#8A8F88" } },
              grid: { left: 48, right: 16, top: 32, bottom: 28 },
              xAxis: { type: "category", data: seasons.map((s) => s.season ?? s.label), axisLine: { lineStyle: { color: "rgba(212,161,30,0.3)" } } },
              yAxis: { type: "value", scale: true, splitLine: { lineStyle: { color: "rgba(212,161,30,0.08)" } } },
              series: [
                { name: "舊 Elo", type: "line", data: seasons.map((s) => s.rps_old ?? s.old?.rps ?? null), lineStyle: { color: "#8A8F88" }, itemStyle: { color: "#8A8F88" } },
                { name: "新 Elo", type: "line", data: seasons.map((s) => s.rps_new ?? s.new?.rps ?? null), lineStyle: { color: "#D4A11E" }, itemStyle: { color: "#D4A11E" } },
              ],
            }}
          />
          <p className="text-[10px] text-ink-3">RPS 越低越準。實戰 logloss／ECE 見上面「足球實戰校準」。</p>
        </Panel>
      ) : null}
    </>
  );
}
