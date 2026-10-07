import { createFileRoute } from "@tanstack/react-router";

import { AdminHead, DataTable, Panel, StatusBadge, useMemoCols } from "@/components/admin/kit";
import { useModelVersions, type VersionRow } from "@/components/admin/data";
import { LONG_FP, useFixture } from "@/components/admin/fixtures";

export const Route = createFileRoute("/_authenticated/admin/model-versions")({
  head: () => ({ meta: [{ title: "模型版本 · 天喜監控端" }, { name: "robots", content: "noindex" }] }),
  component: Versions,
});

const ENG: Record<string, string> = { racing: "賽馬", football: "足球", marksix: "六合彩" };

function Versions() {
  const mv = useModelVersions();
  const worst: VersionRow[] = [
    { version: "dual-v2", engine: "football", fingerprint: LONG_FP, released_at: "2026-10-07", status: "active", notes: "超長說明".repeat(40) },
    { version: "x", engine: "racing", fingerprint: null, released_at: "2016-01-01", status: "archived", notes: null },
  ];
  const rows = useFixture<VersionRow[]>(mv.data ?? [], { demo: worst.slice(1), worst });
  const cols = useMemoCols<VersionRow>(() => [
    { accessorKey: "engine", header: "產品", cell: (c) => ENG[String(c.getValue())] ?? String(c.getValue()) },
    { accessorKey: "version", header: "版本", cell: (c) => <span className="font-mono-tx text-ink">{String(c.getValue())}</span> },
    { accessorKey: "status", header: "狀態", cell: (c) => <StatusBadge s={c.getValue() === "active" ? "ok" : "unknown"} label={c.getValue() === "active" ? "現行" : c.getValue() === "candidate" ? "候選" : "歸檔"} /> },
    { accessorKey: "released_at", header: "定版日（成績起計）", cell: (c) => <span className="tabnum font-mono-tx">{String(c.getValue())}</span> },
    { accessorKey: "fingerprint", header: "指紋", cell: (c) => <span className="font-mono-tx text-[10px]" title={String(c.getValue() ?? "")}>{String(c.getValue() ?? "—")}</span> },
    { accessorKey: "notes", header: "說明", cell: (c) => <span title={String(c.getValue() ?? "")}>{String(c.getValue() ?? "—")}</span> },
  ]);
  return (
    <>
      <AdminHead title="模型版本" en="Model Versions" desc="所有登記版本，包括已歸檔版本。每個版本由定版日起獨立計成績，唔回填。前台只顯示現行版本。" onRefresh={() => mv.refetch()} refreshing={mv.isFetching} />
      <Panel title="版本登記表" en="model_versions">
        <DataTable data={rows} columns={cols} empty={mv.isLoading ? "讀取中…" : "未有版本"} />
      </Panel>
    </>
  );
}
