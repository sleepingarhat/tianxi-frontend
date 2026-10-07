import { createFileRoute, Link } from "@tanstack/react-router";

import { AdminHead, CountUp, Kpi, Panel, StatusBadge, type Status } from "@/components/admin/kit";
import { ago, useEngineHealth, useFootballIngest, useLockState, useMarksixLatest, useModelVersions, useRacingHealth, useRollup } from "@/components/admin/data";
import { hkDateTime } from "@/lib/hkTime";

export const Route = createFileRoute("/_authenticated/admin/overview")({
  head: () => ({ meta: [{ title: "系統總覽 · 天喜監控端" }, { name: "robots", content: "noindex" }] }),
  component: Overview,
});

function Overview() {
  const eh = useEngineHealth();
  const rh = useRacingHealth();
  const fi = useFootballIngest();
  const lock = useLockState();
  const m6 = useMarksixLatest();
  const roll = useRollup();
  const mv = useModelVersions();

  const wf = rh.data?.workflows ?? [];
  const wfFail = wf.filter((w) => w.state === "fail").length;
  const fJobs: any[] = fi.data?.jobs ?? [];
  const fFail = fJobs.filter((j) => j.runs?.[0]?.conclusion && j.runs[0].conclusion !== "success").length;
  const active = (mv.data ?? []).filter((v) => v.status === "active");
  const m6Age = m6.data?.date ? (Date.now() - Date.parse(m6.data.date)) / 86400_000 : null;

  const modules: { name: string; s: Status; detail: string; to: string }[] = [
    {
      name: "賽馬",
      s: eh.data?.overall === "PASS" && wfFail === 0 ? "ok" : eh.data?.overall === "FAIL" || wfFail > 1 ? "fail" : eh.isLoading ? "unknown" : "warn",
      detail: `引擎 ${eh.data?.overall ?? "—"} · 定時任務失敗 ${wfFail}`,
      to: "/admin/engine-health",
    },
    { name: "足球", s: fi.isLoading ? "unknown" : fFail ? "warn" : "ok", detail: `收料任務 ${fJobs.length} 項，失敗 ${fFail}`, to: "/admin/data-freshness" },
    { name: "六合彩", s: m6Age == null ? "unknown" : m6Age > 5 ? "stale" : "ok", detail: `最新 ${m6.data?.draw ?? "—"}（${m6.data?.date ?? "—"}）`, to: "/admin/data-freshness" },
  ];

  const refresh = () => { eh.refetch(); rh.refetch(); fi.refetch(); lock.refetch(); m6.refetch(); };

  return (
    <>
      <AdminHead title="系統總覽" en="Overview" desc="賽馬、足球、六合彩三大模組今日狀態，一屏睇晒。" onRefresh={refresh} refreshing={eh.isFetching || rh.isFetching} updatedAt={eh.data?.generatedHKT ?? null} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="賽馬引擎守門" value={eh.data?.overall ?? "—"} tone={eh.data?.overall === "PASS" ? "win" : "gold"} sub={`${eh.data?.counts?.pass ?? "—"} 過 · ${eh.data?.counts?.watch ?? 0} 留意 · ${eh.data?.counts?.fail ?? 0} 失敗`} />
        <Kpi label="四揀平均中匹數（90 日）" value={<CountUp value={roll.data?.top4AvgIntersect} digits={2} />} tone="gold" sub={`${roll.data?.racesEvaluated ?? "—"} 場`} />
        <Kpi label="今日賽馬鎖定" value={lock.data?.locked ? "已鎖" : lock.data ? "未鎖" : "—"} tone={lock.data?.locked ? "win" : undefined} sub={lock.data ? `${lock.data.date} · ${lock.data.frozenRows ?? 0} 行凍結` : "—"} />
        <Kpi label="定時任務失敗" value={<CountUp value={wfFail + fFail} />} tone={wfFail + fFail ? "lose" : "win"} sub={`賽馬 ${wf.length} 項 · 足球 ${fJobs.length} 項`} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {modules.map((m) => (
          <Link key={m.name} to={m.to} className="rounded-[12px] border border-hairline bg-paper-2 p-4 transition-colors hover:border-gold">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-ink">{m.name}</span>
              <span className="ml-auto"><StatusBadge s={m.s} /></span>
            </div>
            <p className="mt-2 truncate text-[11px] text-ink-3">{m.detail}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Panel title="今日預測發布" en="Publish">
          <ul className="space-y-2 text-[12px]">
            <li className="flex gap-2"><span className="text-ink-3">賽馬</span><span className="ml-auto text-ink-2">{lock.data ? `${lock.data.venue ?? ""} 首場 ${hkDateTime(lock.data.firstPostAt)} · 鎖定 ${hkDateTime(lock.data.lockAt)}` : "今日無賽事"}</span></li>
            <li className="flex gap-2"><span className="text-ink-3">足球</span><span className="ml-auto text-ink-2">開賽前 6 小時逐場鎖定</span></li>
            <li className="flex gap-2"><span className="text-ink-3">六合彩</span><span className="ml-auto text-ink-2">攪珠當晚收料 22:30／23:00／23:30</span></li>
          </ul>
        </Panel>
        <Panel title="現行模型版本" en="Active Versions" right={<Link to="/admin/model-versions" className="text-[10px] text-gold">全部</Link>}>
          <ul className="space-y-1.5">
            {active.map((v) => (
              <li key={v.version} className="flex min-w-0 items-center gap-2 text-[12px]">
                <span className="w-14 shrink-0 text-ink-3">{v.engine === "racing" ? "賽馬" : v.engine === "football" ? "足球" : "六合彩"}</span>
                <span className="truncate font-mono-tx text-ink">{v.version}</span>
                <span className="tabnum ml-auto shrink-0 font-mono-tx text-[10px] text-ink-3">{v.released_at}</span>
              </li>
            ))}
            {!active.length ? <li className="text-[12px] text-ink-3">{mv.isLoading ? "讀取中…" : "未登記"}</li> : null}
          </ul>
        </Panel>
        <Panel title="API 健康" en="API Health">
          <ul className="space-y-1.5 text-[12px]">
            {[
              ["賽馬引擎健康", eh], ["賽馬後端定時任務", rh], ["足球收料狀態", fi], ["賽馬鎖定狀態", lock], ["六合彩攪珠", m6],
            ].map(([n, q]: any) => (
              <li key={n} className="flex items-center gap-2">
                <span className="text-ink-2">{n}</span>
                <span className="ml-auto"><StatusBadge s={q.isError ? "fail" : q.isLoading ? "unknown" : "ok"} label={q.isError ? "失敗" : q.isLoading ? "讀取中" : "回應正常"} /></span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="資料管線" en="Pipelines" right={<Link to="/admin/data-freshness" className="text-[10px] text-gold">詳情</Link>}>
          <ul className="space-y-1.5 text-[12px]">
            <li className="flex gap-2"><span className="text-ink-3">最後派彩收料</span><span className="ml-auto text-ink-2">{rh.data?.lastDividend?.date ?? "—"}（{ago(rh.data?.lastDividend?.committedAt)}）</span></li>
            <li className="flex gap-2"><span className="text-ink-3">Telegram 告警</span><span className="ml-auto text-ink-2">{rh.data?.telegram?.detail ?? "—"}</span></li>
            {fJobs.map((j) => (
              <li key={j.key} className="flex min-w-0 gap-2"><span className="truncate text-ink-3">{j.label}</span><span className="ml-auto shrink-0 text-ink-2">{ago(j.runs?.[0]?.at)}</span></li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
