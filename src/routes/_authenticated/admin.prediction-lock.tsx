import { createFileRoute } from "@tanstack/react-router";

import { AdminHead, DataTable, Kpi, NoteBox, Panel, StatusBadge, useMemoCols } from "@/components/admin/kit";
import { useFootballLedger, useLockState, type LedgerRow } from "@/components/admin/data";
import { ledgerFixture, useFixture } from "@/components/admin/fixtures";
import { OUTCOME_LABEL } from "@/lib/footballDualEngine";
import { hkDateTime } from "@/lib/hkTime";
import { teamZh } from "@/lib/teamZh";

export const Route = createFileRoute("/_authenticated/admin/prediction-lock")({
  head: () => ({ meta: [{ title: "預測鎖定 · 天喜監控端" }, { name: "robots", content: "noindex" }] }),
  component: LockPage,
});

const stage = (r: LedgerRow) => (r.ftr ? "已結算" : Date.parse(r.kickoff_utc) < Date.now() ? "待賽果入帳" : "已發布");

function LockPage() {
  const lock = useLockState();
  const led = useFootballLedger();
  const rows = useFixture<LedgerRow[]>(led.data ?? [], { demo: ledgerFixture("demo") as LedgerRow[], worst: ledgerFixture("worst") as LedgerRow[] });
  const n = { pub: 0, wait: 0, done: 0 };
  for (const r of rows) { const s = stage(r); if (s === "已結算") n.done++; else if (s === "已發布") n.pub++; else n.wait++; }
  const cols = useMemoCols<LedgerRow>(() => [
    { accessorKey: "kickoff_utc", header: "開賽（香港）", cell: (c) => <span className="tabnum font-mono-tx">{hkDateTime(String(c.getValue()))}</span> },
    { id: "match", header: "賽事", accessorFn: (r) => `${teamZh(r.div, r.home)} vs ${teamZh(r.div, r.away)}`, cell: (c) => <span title={String(c.getValue())}>{String(c.getValue())}</span> },
    { accessorKey: "version", header: "版本", cell: (c) => <span className="font-mono-tx">{String(c.getValue())}</span> },
    { accessorKey: "prediction", header: "預測", cell: (c) => OUTCOME_LABEL[c.getValue() as LedgerRow["prediction"]] ?? "—" },
    { accessorKey: "locked_at", header: "鎖定時刻", cell: (c) => <span className="tabnum font-mono-tx">{hkDateTime(String(c.getValue()))}</span> },
    { id: "lead", header: "提前", accessorFn: (r) => (Date.parse(r.kickoff_utc) - Date.parse(r.locked_at)) / 3600_000, cell: (c) => <span className="tabnum font-mono-tx">{(c.getValue() as number).toFixed(1)} 小時</span> },
    { id: "stage", header: "狀態", accessorFn: stage, cell: (c) => <StatusBadge s={c.getValue() === "已結算" ? "ok" : c.getValue() === "已發布" ? "unknown" : "warn"} label={String(c.getValue())} /> },
  ]);

  return (
    <>
      <AdminHead title="預測鎖定" en="Prediction Lock" desc="賽馬首場前 90 分鐘鎖全日；足球開賽前 6 小時逐場鎖定。鎖定紀錄只增不改，呢度只讀。" onRefresh={() => { lock.refetch(); led.refetch(); }} refreshing={lock.isFetching || led.isFetching} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="賽馬今日" value={lock.data?.locked ? "已鎖" : lock.data ? "未鎖" : "—"} tone={lock.data?.locked ? "win" : "gold"} sub={lock.data ? `${lock.data.date} · ${lock.data.frozenRows ?? 0} 行` : ""} />
        <Kpi label="足球已發布" value={n.pub} sub="未開賽" />
        <Kpi label="足球待賽果" value={n.wait} tone={n.wait ? "gold" : undefined} />
        <Kpi label="足球已結算" value={n.done} tone="win" />
      </div>
      <div className="mt-3">
        <NoteBox>
          賽馬鎖定：{lock.data ? `${lock.data.venue ?? ""} 首場 ${hkDateTime(lock.data.firstPostAt)}，鎖定 ${hkDateTime(lock.data.lockAt)}（提前 ${lock.data.lockLeadMinutes} 分鐘，來源 ${lock.data.source}，版本 ${lock.data.edition === "final" ? "定稿" : "初版"}）` : "今日無賽事"}
        </NoteBox>
      </div>
      <Panel title="足球鎖定帳" en="Football Ledger" className="mt-4">
        <DataTable data={rows} columns={cols} pageSize={20} empty={led.isLoading ? "讀取中…" : "未有鎖定紀錄"} />
      </Panel>
    </>
  );
}
