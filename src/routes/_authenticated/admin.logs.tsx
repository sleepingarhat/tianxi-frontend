import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AdminHead, DataTable, Panel, StatusBadge, useMemoCols, type Status } from "@/components/admin/kit";
import { ago, useEngineHealth, useFootballIngest, useRacingHealth } from "@/components/admin/data";
import { adminGet } from "@/lib/admin.functions";
import { hkDateTime } from "@/lib/hkTime";

export const Route = createFileRoute("/_authenticated/admin/logs")({
  head: () => ({ meta: [{ title: "日誌 · 天喜監控端" }, { name: "robots", content: "noindex" }] }),
  component: Logs,
});

type Log = { kind: string; level: Status; source: string; message: string; at: string | null };

function Logs() {
  const get = useServerFn(adminGet);
  const alerts = useQuery({ queryKey: ["admin", "alerts"], queryFn: () => get({ data: { path: "/admin/api/alerts" } }) });
  const rh = useRacingHealth();
  const fi = useFootballIngest();
  const eh = useEngineHealth();

  const logs: Log[] = [];
  const a = alerts.data?.payload;
  const list: any[] = Array.isArray(a) ? a : a?.["alerts"] ?? a?.["items"] ?? [];
  for (const x of list) logs.push({ kind: "資料完整性", level: x.severity === "critical" || x.level === "error" ? "fail" : "warn", source: String(x.source ?? x.key ?? "後端"), message: String(x.message ?? x.title ?? JSON.stringify(x)).slice(0, 300), at: x.created_at ?? x.at ?? null });
  for (const w of rh.data?.workflows ?? []) if (w.state === "fail") logs.push({ kind: "定時任務失敗", level: "fail", source: `賽馬 · ${w.label}`, message: `${w.file} 結果 ${w.conclusion}`, at: w.startedAt });
  for (const j of (fi.data?.jobs ?? []) as any[]) for (const r of j.runs ?? []) if (r.conclusion && r.conclusion !== "success") logs.push({ kind: "定時任務失敗", level: "fail", source: `足球 · ${j.label}`, message: `${j.workflow} 結果 ${r.conclusion}`, at: r.at });
  for (const t of rh.data?.telegram?.failing ?? []) logs.push({ kind: "告警", level: "warn", source: `Telegram · ${t.key}`, message: t.fail, at: t.sentAt });
  for (const c of (eh.data?.checks ?? []) as any[]) if (String(c.status).toUpperCase() !== "PASS") logs.push({ kind: "模型閘", level: String(c.status).toUpperCase() === "FAIL" ? "fail" : "warn", source: String(c.label ?? c.key), message: String(c.note ?? c.detail ?? ""), at: null });
  if (alerts.isError) logs.push({ kind: "API 錯誤", level: "fail", source: "/admin/api/alerts", message: String((alerts.error as Error)?.message ?? alerts.error), at: new Date().toISOString() });
  logs.sort((x, y) => (y.at ?? "").localeCompare(x.at ?? ""));

  const cols = useMemoCols<Log>(() => [
    { accessorKey: "at", header: "時間（香港）", cell: (c) => <span className="tabnum font-mono-tx">{c.getValue() ? `${hkDateTime(String(c.getValue()))} · ${ago(String(c.getValue()))}` : "—"}</span> },
    { accessorKey: "kind", header: "類別" },
    { accessorKey: "level", header: "級別", cell: (c) => <StatusBadge s={c.getValue() as Status} /> },
    { accessorKey: "source", header: "來源", cell: (c) => <span title={String(c.getValue())}>{String(c.getValue())}</span> },
    { accessorKey: "message", header: "內容", cell: (c) => <span title={String(c.getValue())}>{String(c.getValue())}</span> },
  ]);

  return (
    <>
      <AdminHead title="日誌" en="Logs" desc="API 錯誤、定時任務失敗、資料完整性警告同模型閘未過紀錄，集中一處。" onRefresh={() => { alerts.refetch(); rh.refetch(); fi.refetch(); eh.refetch(); }} refreshing={alerts.isFetching} />
      <Panel title="事件" en="Events">
        <DataTable data={logs} columns={cols} pageSize={25} empty={alerts.isLoading ? "讀取中…" : "冇異常紀錄"} />
      </Panel>
    </>
  );
}
