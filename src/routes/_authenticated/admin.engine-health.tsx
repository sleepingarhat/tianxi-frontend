import { createFileRoute } from "@tanstack/react-router";

import { AdminHead, DataTable, Kpi, NoteBox, Panel, StatusBadge, useMemoCols, type Status } from "@/components/admin/kit";
import { useEngineHealth, useModelVersions, useRollup } from "@/components/admin/data";
import { EChart } from "@/components/tx/EChart";
import eloV2 from "@/data/football-elo-v2.json";

export const Route = createFileRoute("/_authenticated/admin/engine-health")({
  head: () => ({ meta: [{ title: "引擎健康 · 天喜監控端" }, { name: "robots", content: "noindex" }] }),
  component: EngineHealth,
});

type Check = { key: string; label: string; status: Status; detail: string };

function EngineHealth() {
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
  const seasons: any[] = (eloV2 as any).seasons ?? (eloV2 as any).validation ?? [];

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
          <p className="text-[10px] text-ink-3">RPS 越低越準。logloss／ECE 後端未逐季輸出，暫未顯示。</p>
        </Panel>
      ) : null}
    </>
  );
}
