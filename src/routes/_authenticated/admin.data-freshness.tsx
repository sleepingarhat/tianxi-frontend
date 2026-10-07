import { createFileRoute } from "@tanstack/react-router";

import { AdminHead, DataTable, Panel, StatusBadge, useMemoCols, type Status } from "@/components/admin/kit";
import { ago, useFootballIngest, useMarksixLatest, useRacingHealth } from "@/components/admin/data";
import { useFixture, workflowFixture } from "@/components/admin/fixtures";
import { hkDateTime } from "@/lib/hkTime";

export const Route = createFileRoute("/_authenticated/admin/data-freshness")({
  head: () => ({ meta: [{ title: "資料新鮮度 · 天喜監控端" }, { name: "robots", content: "noindex" }] }),
  component: Freshness,
});

type Row = { product: string; label: string; state: Status; conclusion: string; at: string | null };

function Freshness() {
  const rh = useRacingHealth();
  const fi = useFootballIngest();
  const m6 = useMarksixLatest();

  const realWf = (rh.data?.workflows ?? []) as any[];
  const wf = useFixture<any[]>(realWf, { demo: workflowFixture("demo"), worst: workflowFixture("worst") });
  const rows: Row[] = [
    ...wf.map((w) => ({
      product: "賽馬",
      label: w.label,
      state: (w.state === "ok" ? "ok" : w.state === "fail" ? "fail" : w.startedAt ? "stale" : "missing") as Status,
      conclusion: w.conclusion ?? w.status ?? "—",
      at: w.startedAt,
    })),
    ...((fi.data?.jobs ?? []) as any[]).map((j) => {
      const r = j.runs?.[0];
      return {
        product: "足球",
        label: j.label,
        state: (!r ? "missing" : r.conclusion === "success" ? "ok" : r.status !== "completed" ? "warn" : "fail") as Status,
        conclusion: r?.conclusion ?? r?.status ?? "—",
        at: r?.at ?? null,
      };
    }),
  ];
  const cols = useMemoCols<Row>(() => [
    { accessorKey: "product", header: "產品" },
    { accessorKey: "label", header: "任務", cell: (c) => <span title={String(c.getValue())}>{String(c.getValue())}</span> },
    { accessorKey: "state", header: "狀態", cell: (c) => <StatusBadge s={c.getValue() as Status} /> },
    { accessorKey: "conclusion", header: "結果" },
    { accessorKey: "at", header: "最後運行（香港時間）", cell: (c) => <span className="tabnum font-mono-tx">{c.getValue() ? `${hkDateTime(String(c.getValue()))} · ${ago(String(c.getValue()))}` : "從未運行"}</span> },
  ]);
  const m6Age = m6.data?.date ? (Date.now() - Date.parse(m6.data.date)) / 86400_000 : null;

  return (
    <>
      <AdminHead title="資料新鮮度" en="Data Freshness" desc="各產品資料最後更新時間同 GitHub 定時任務狀態；過時、缺失、失敗會標出。" onRefresh={() => { rh.refetch(); fi.refetch(); m6.refetch(); }} refreshing={rh.isFetching || fi.isFetching} />
      <div className="grid gap-3 md:grid-cols-3">
        <Panel title="賽馬派彩" en="Racing">
          <p className="font-mono-tx text-[16px] text-ink">{rh.data?.lastDividend?.date ?? "—"}</p>
          <p className="text-[11px] text-ink-3">寫入 {ago(rh.data?.lastDividend?.committedAt)}</p>
        </Panel>
        <Panel title="足球收料" en="Football">
          <p className="font-mono-tx text-[16px] text-ink">{fi.data?.generated_at ? hkDateTime(fi.data.generated_at) : "—"}</p>
          <p className="text-[11px] text-ink-3">{(fi.data?.jobs ?? []).length} 項任務</p>
        </Panel>
        <Panel title="六合彩攪珠" en="Mark Six" right={<StatusBadge s={m6Age == null ? "unknown" : m6Age > 5 ? "stale" : "ok"} />}>
          <p className="font-mono-tx text-[16px] text-ink">{m6.data?.draw ?? "—"}</p>
          <p className="text-[11px] text-ink-3">{m6.data?.date ?? "—"}</p>
        </Panel>
      </div>
      <Panel title="定時任務" en="GitHub Actions" className="mt-4">
        <DataTable data={rows} columns={cols} pageSize={25} empty={rh.isLoading ? "讀取中…" : "未有任務資料"} />
      </Panel>
    </>
  );
}
