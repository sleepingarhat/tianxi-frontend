import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { OraclePanel } from "@/components/tx/OraclePanel";
import { Card, Empty, ErrorNote, Loading, PageHead, Pill, Scroller, Stat, StatGrid, Table, Td } from "@/components/tx/ui";
import { supabase } from "@/integrations/supabase/client";
import { adminGet, adminPost, getAdminStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/console")({
  head: () => ({
    meta: [
      { title: "內部監控台 · 天喜 TIANXI" },
      { name: "description", content: "天喜內部運維監控台：資料覆蓋、工作流、警報與維護操作。" },
      { property: "og:title", content: "內部監控台 · 天喜 TIANXI" },
      { property: "og:description", content: "天喜內部運維監控台。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "picks" | "status" | "coverage" | "features" | "ops" | "sql";

const TABS: { key: Tab; label: string }[] = [
  { key: "picks", label: "即日預測" },
  { key: "status", label: "總覽 / 警報" },
  { key: "coverage", label: "資料覆蓋" },
  { key: "features", label: "特徵審計" },
  { key: "ops", label: "運維操作" },
  { key: "sql", label: "SQL 查詢" },
];

const DOT: Record<string, string> = {
  ok: "bg-win",
  warn: "bg-gold-strong",
  bad: "bg-lose",
};

function fmtTime(v?: string | null) {
  if (!v) return "—";
  return v.replace("T", " ").slice(0, 16);
}

function AdminPage() {
  const router = useRouter();
  const checkAdmin = useServerFn(getAdminStatus);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("picks");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.navigate({ to: "/auth" });
        return;
      }
      try {
        const r = await checkAdmin();
        if (!cancelled) setIsAdmin(r.isAdmin);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkAdmin, router]);

  if (isAdmin === null) {
    return (
      <AppShell ticker="內部監控台">
        <Loading label="核實權限中…" />
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell ticker="內部監控台 · 權限不足">
        <PageHead en="Restricted" title="無權進入" desc="此頁只限管理員帳戶。" />
        <Card title="權限不足" en="Forbidden">
          <p className="text-[12px] text-ink-2">你的帳戶未獲授權進入內部監控台。</p>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.navigate({ to: "/auth" });
            }}
            className="mt-3 rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-[12px] text-ink"
          >
            登出
          </button>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell ticker="內部監控台 · 只限管理員">
      <PageHead en="Internal Console" title="內部監控台" desc="經伺服器代理讀寫 tianxi-backend /admin/api/*，token 不會外露。" />

      <Scroller>
        <div className="flex gap-2 pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-[8px] border px-3 py-1.5 text-[12px] ${
                tab === t.key ? "border-gold bg-gold-bg text-ink" : "border-hairline bg-paper-2 text-ink-3"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Scroller>

      {tab === "picks" && <OraclePanel />}
      {tab === "status" && <StatusPanel />}
      {tab === "coverage" && <CoveragePanel />}
      {tab === "features" && <FeaturePanel />}
      {tab === "ops" && <OpsPanel />}
      {tab === "sql" && <SqlPanel />}

      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          router.navigate({ to: "/auth" });
        }}
        className="mt-4 w-full rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-[12px] text-ink-3"
      >
        登出
      </button>
    </AppShell>
  );
}

/** 共用：讀取一個 /admin/api GET 端點 */
function useAdminData(path: string | null) {
  const get = useServerFn(adminGet);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!path) return;
    setLoading(true);
    setError(null);
    get({ data: { path } })
      .then((r) => {
        if (!r.ok) throw new Error(`Worker ${r.status}: ${JSON.stringify(r.payload).slice(0, 200)}`);
        setData(r.payload);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [get, path]);

  useEffect(load, [load]);
  return { data, error, loading, reload: load };
}

function StatusPanel() {
  const status = useAdminData("/admin/api/status");
  const alerts = useAdminData("/admin/api/alerts");
  const gaps = useAdminData("/admin/api/gaps");
  const runs = useAdminData("/admin/api/runs?limit=15");

  const counts = status.data?.counts ?? {};
  const dates = status.data?.dates ?? {};

  const LABELS: [string, string][] = [
    ["meetings", "賽馬日"],
    ["races", "場次"],
    ["results", "賽果"],
    ["horses", "馬匹"],
    ["jockeys", "騎師"],
    ["trainers", "練馬師"],
    ["trackwork", "晨操"],
    ["injury", "傷患"],
    ["form", "往績"],
    ["entries", "排位表"],
    ["odds", "賠率"],
    ["horseElo", "馬 天喜ELO"],
    ["jockeyElo", "騎師 天喜ELO"],
    ["trainerElo", "練師 天喜ELO"],
  ];

  const alertList = (alerts.data?.alerts ?? []) as unknown[];
  const runList = (runs.data?.runs ?? []) as { conclusion?: string }[];
  const failed = runList.filter((r) => r.conclusion === "failure").length;
  const gapList = (gaps.data?.months ?? gaps.data?.gaps ?? []) as unknown[];

  return (
    <>
      <Card title="一屏總覽" en="Overview">
        <StatGrid cols={2}>
          <Stat label="引擎健康" value={alertList.length ? `${alertList.length} 項警報` : "正常"} sub="警報檢查" />
          <Stat label="數據完整性" value={gapList.length ? `${gapList.length} 個可疑月` : "齊全"} sub="賽馬日覆蓋" />
          <Stat label="同步狀態" value={runList.length ? `${runList.length - failed}/${runList.length} 成功` : "–"} sub={failed ? `失敗 ${failed}` : "最近工作流"} />
          <Stat label="最新賽果" value={String(dates.results ?? dates.meetings ?? "–")} sub="資料庫日期" />
        </StatGrid>
      </Card>
      <Card title="警報" en="Alerts" action={<button type="button" className="text-[11px] text-ink-3 underline" onClick={alerts.reload}>重新檢查</button>}>
        {alerts.loading && <Loading />}
        {alerts.error ? <ErrorNote error={alerts.error} /> : null}
        {alerts.data && (alerts.data.alerts?.length ? (
          <ul className="space-y-2">
            {alerts.data.alerts.map((a: any, i: number) => (
              <li key={i} className="flex gap-2 text-[12px] text-ink">
                <span className={`mt-[5px] h-2 w-2 shrink-0 rounded-full ${a.level === "red" ? "bg-lose" : "bg-gold-strong"}`} />
                {a.msg}
              </li>
            ))}
          </ul>
        ) : <Empty label="無警報" />)}
      </Card>

      <Card title="資料庫總量" en="Row Counts" action={<button type="button" className="text-[11px] text-ink-3 underline" onClick={status.reload}>刷新</button>}>
        {status.loading && <Loading />}
        {status.error ? <ErrorNote error={status.error} /> : null}
        {status.data && (
          <>
            <StatGrid cols={3}>
              {LABELS.map(([k, label]) => (
                <Stat key={k} label={label} value={<span className="tabnum">{(counts[k] ?? 0).toLocaleString()}</span>} />
              ))}
            </StatGrid>
            <div className="mt-3 space-y-1 text-[11px] text-ink-3">
              <div>最早賽馬日 <span className="tabnum text-ink">{dates.earliestMeeting ?? "—"}</span> · 最新 <span className="tabnum text-ink">{dates.latestMeeting ?? "—"}</span></div>
              <div>排位表 <span className="tabnum text-ink">{dates.latestEntry ?? "—"}</span> · 晨操 <span className="tabnum text-ink">{dates.latestTrackwork ?? "—"}</span></div>
              <div>天喜ELO <span className="tabnum text-ink">{dates.latestElo ?? "—"}</span> · 賠率 <span className="tabnum text-ink">{fmtTime(dates.latestOdds)}</span></div>
            </div>
          </>
        )}
      </Card>

      <Card title="可疑月份（賽馬日不足）" en="Suspect Months">
        {gaps.loading && <Loading />}
        {gaps.error ? <ErrorNote error={gaps.error} /> : null}
        {gaps.data && (gaps.data.suspectMonths?.length ? (
          <div className="flex flex-wrap gap-2">
            {gaps.data.suspectMonths.map((m: any) => (
              <Pill key={m.ym} tone="gold">{m.ym} · {m.n}</Pill>
            ))}
          </div>
        ) : <Empty label="無缺口" />)}
      </Card>

      <Card title="最近工作流" en="Workflow Runs" action={<button type="button" className="text-[11px] text-ink-3 underline" onClick={runs.reload}>刷新</button>}>
        {runs.loading && <Loading />}
        {runs.error ? <ErrorNote error={runs.error} /> : null}
        {runs.data && (runs.data.runs?.length ? (
          <Scroller>
            <Table head={["工作流", "狀態", "更新"]}>
              {runs.data.runs.map((r: any) => (
                <tr key={r.id}>
                  <Td>{r.name}</Td>
                  <Td>
                    <span className={r.conclusion === "failure" ? "text-lose" : r.conclusion === "success" ? "text-win" : "text-ink-3"}>
                      {r.conclusion || r.status}
                    </span>
                  </Td>
                  <Td mono>{fmtTime(r.updatedAt)}</Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        ) : <Empty label="未取得 GitHub 工作流（Worker 未設 token）" />)}
      </Card>
    </>
  );
}

function CoveragePanel() {
  const { data, error, loading, reload } = useAdminData("/admin/api/coverage");
  const meetings = useAdminData("/admin/api/meetings?limit=10");

  return (
    <>
      <Card title="14 個核心資料表" en="Datasets" action={<button type="button" className="text-[11px] text-ink-3 underline" onClick={reload}>刷新</button>}>
        {loading && <Loading />}
        {error ? <ErrorNote error={error} /> : null}
        {data && (
          <Scroller>
            <Table head={["資料", "歷史", "自動", "詳情", "最後成功"]}>
              {(data.datasets ?? []).map((d: any) => (
                <tr key={d.key}>
                  <Td>{d.label}</Td>
                  <Td><span className={`inline-block h-2 w-2 rounded-full ${DOT[d.history] ?? "bg-ink-3"}`} /></Td>
                  <Td><span className={`inline-block h-2 w-2 rounded-full ${DOT[d.auto] ?? "bg-ink-3"}`} /></Td>
                  <Td mono>{d.detail}</Td>
                  <Td mono>{fmtTime(d.lastSuccessAt)}</Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        )}
      </Card>

      <Card title="引擎特徵健康" en="Factors">
        {data && (
          <Scroller>
            <Table head={["特徵", "權重", "歷史", "自動", "來源"]}>
              {(data.factors ?? []).map((f: any) => (
                <tr key={f.key}>
                  <Td>{f.label}</Td>
                  <Td mono>{f.weight ?? "—"}</Td>
                  <Td><span className={`inline-block h-2 w-2 rounded-full ${DOT[f.history] ?? "bg-ink-3"}`} /></Td>
                  <Td><span className={`inline-block h-2 w-2 rounded-full ${DOT[f.auto] ?? "bg-ink-3"}`} /></Td>
                  <Td mono>{f.sourceLabel}</Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        )}
      </Card>

      <Card title="最近賽馬日" en="Meetings">
        {meetings.loading && <Loading />}
        {meetings.error ? <ErrorNote error={meetings.error} /> : null}
        {meetings.data && (
          <Scroller>
            <Table head={["日期", "馬場", "場地", "場次", "排位"]}>
              {(meetings.data.meetings ?? []).map((m: any) => (
                <tr key={m.id}>
                  <Td mono>{m.date}</Td>
                  <Td>{m.venue}</Td>
                  <Td>{m.track_condition ?? "—"}</Td>
                  <Td mono>{m.race_count}/{m.total_races ?? "—"}</Td>
                  <Td mono>{m.entry_count}</Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        )}
      </Card>
    </>
  );
}

function FeaturePanel() {
  const { data, error, loading, reload } = useAdminData("/admin/api/feature-audit");
  const lgb = useAdminData("/admin/api/lgb-predictions");

  const rows = useMemo(() => {
    if (!data) return [] as [string, any][];
    return Object.entries(data as Record<string, any>).filter(([, v]) => typeof v !== "object" || v === null);
  }, [data]);

  return (
    <>
      <Card title="特徵覆蓋審計" en="Feature Audit" action={<button type="button" className="text-[11px] text-ink-3 underline" onClick={reload}>刷新</button>}>
        {loading && <Loading />}
        {error ? <ErrorNote error={error} /> : null}
        {data && (
          <Scroller>
            <Table head={["指標", "值"]}>
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <Td>{k}</Td>
                  <Td mono>{String(v)}</Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        )}
        {data ? (
          <pre className="mt-3 max-h-64 overflow-auto rounded-[8px] bg-paper-3 p-2 text-[10px] leading-relaxed text-ink-2">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : null}
      </Card>

      <Card title="天喜LGB 預測儲存" en="天喜LGB Predictions">
        {lgb.loading && <Loading />}
        {lgb.error ? <ErrorNote error={lgb.error} /> : null}
        {lgb.data && (
          <>
            <StatGrid cols={2}>
              <Stat label="行數" value={<span className="tabnum">{lgb.data.summary?.rows_n ?? 0}</span>} />
              <Stat label="場次" value={<span className="tabnum">{lgb.data.summary?.races_n ?? 0}</span>} />
            </StatGrid>
            <div className="mt-2 text-[11px] text-ink-3">最新 <span className="tabnum text-ink">{fmtTime(lgb.data.summary?.latest)}</span></div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(lgb.data.byModelVersion ?? []).map((v: any) => (
                <Pill key={v.model_version}>{v.model_version} · {v.n}</Pill>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}

const WORKFLOWS = [
  "capy_race_daily.yml",
  "capy_pool_a.yml",
  "capy_odds.yml",
  "capy_entries.yml",
  "capy_d1_sync.yml",
  "capy_d1_sync_entries.yml",
  "capy_d1_sync_pool_a.yml",
  "capy_d1_bulk_backfill.yml",
  "capy_fixture_weekly.yml",
  "capy_integrity_audit.yml",
  "capy_racecard.yml",
];

// 0 行但屬正常的表：舊版遺留、已被新表取代，或功能未啟用。
const TABLE_NOTES: Record<string, string> = {
  _horse_id_migration: "一次性馬匹編號搬遷用的臨時表，搬完已清空",
  trackwork: "舊晨操表，已被 horse_trackwork 取代",
  sync_state: "舊同步狀態表，現以 GitHub 工作流紀錄取代",
  ingestion_runs: "舊匯入紀錄表，已停用",
  jockey_season_records: "騎師季度統計表，暫由即時計算取代",
  barrier_trials: "閘門試閘舊表，已被 trial_sessions／trial_runners 流程取代",
  trial_sessions: "試閘場次表：新季試閘資料開鑼後才會有",
  trial_runners: "試閘馬匹表：新季試閘資料開鑼後才會有",
  users: "站內用戶已改用 Lovable 雲端帳戶，D1 不再存用戶",
  membership_sessions: "會員登入場次：會員功能未啟用",
  membership_entitlements: "會員權限：會員功能未啟用",
};


function OpsPanel() {
  const post = useServerFn(adminPost);
  const tables = useAdminData("/admin/api/d1-maintenance");
  const [log, setLog] = useState<{ label: string; text: string; ok: boolean }[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [wf, setWf] = useState(WORKFLOWS[0]);
  const [alpha, setAlpha] = useState("0.5");
  const [pruneDate, setPruneDate] = useState("");

  const run = useCallback(
    async (label: string, path: string, body?: unknown) => {
      setBusy(label);
      try {
        const r = await post({ data: { path, body } });
        setLog((prev) => [{ label, ok: r.ok, text: JSON.stringify(r.payload, null, 2) }, ...prev].slice(0, 12));
      } catch (e) {
        setLog((prev) => [{ label, ok: false, text: e instanceof Error ? e.message : String(e) }, ...prev].slice(0, 12));
      } finally {
        setBusy(null);
      }
    },
    [post],
  );

  const btn = "rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-left text-[12px] text-ink disabled:opacity-50";

  return (
    <>
      <Card title="觸發工作流" en="Dispatch">
        <select
          value={wf}
          onChange={(e) => setWf(e.target.value)}
          className="w-full rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-[12px] text-ink"
        >
          {WORKFLOWS.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run(`dispatch ${wf}`, "/admin/api/dispatch", { workflow: wf, ref: "main" })}
          className="mt-2 w-full rounded-[8px] bg-deep px-3 py-2 text-[12px] text-deep-fg disabled:opacity-50"
        >
          {busy?.startsWith("dispatch") ? "觸發中…" : "觸發"}
        </button>
      </Card>

      <Card title="引擎參數" en="Set Alpha">
        <div className="flex gap-2">
          <input
            value={alpha}
            onChange={(e) => setAlpha(e.target.value)}
            inputMode="decimal"
            className="tabnum w-24 rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-[12px] text-ink"
          />
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run(`set-alpha ${alpha}`, `/admin/api/set-alpha?value=${encodeURIComponent(alpha)}`)}
            className={btn}
          >
            設定 alpha（0–1）
          </button>
        </div>
      </Card>

      <Card title="資料維護" en="Maintenance">
        <div className="grid gap-2">
          <button type="button" disabled={busy !== null} className={btn}
            onClick={() => run("prune-lgb", "/admin/api/d1-maintenance", { action: "prune-lgb-keep-latest-per-race" })}>
            清理 天喜LGB 舊版本（每場只留最新）
          </button>
          <div className="flex gap-2">
            <input
              value={pruneDate}
              onChange={(e) => setPruneDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="tabnum w-32 rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-[12px] text-ink"
            />
            <button type="button" disabled={busy !== null || !pruneDate} className={btn}
              onClick={() => run("prune-prediction-log", "/admin/api/d1-maintenance", { action: "prune-prediction-log-older-than", beforeDate: pruneDate })}>
              清理此日期前 prediction_log
            </button>
          </div>
          <button type="button" disabled={busy !== null || !pruneDate} className={btn}
            onClick={() => run("prune-elo", "/admin/api/d1-maintenance", { action: "prune-elo-snapshots-older-than", beforeDate: pruneDate })}>
            清理此日期前 天喜ELO snapshots
          </button>
          <button type="button" disabled={busy !== null} className={btn}
            onClick={() => run("housekeeping", "/admin/api/data-housekeeping", {})}>
            資料整理 data-housekeeping
          </button>
          <button type="button" disabled={busy !== null} className={btn}
            onClick={() => run("dedupe-meetings", "/admin/api/cleanup-duplicate-meetings", {})}>
            清理重複賽馬日
          </button>
          <button type="button" disabled={busy !== null} className={btn}
            onClick={() => run("refresh-dividends", "/admin/api/refresh-race-dividends", {})}>
            重整派彩 race dividends
          </button>
          <button type="button" disabled={busy !== null} className={btn}
            onClick={() => run("fix-pool-swap", "/admin/api/fix-dividend-pool-swap", {})}>
            修正派彩池錯位
          </button>
          <button type="button" disabled={busy !== null} className={btn}
            onClick={() => run("seed-jockey-elo", "/admin/api/seed-missing-jockey-elo", {})}>
            補種缺失騎師／練師 天喜ELO
          </button>
          <button type="button" disabled={busy !== null} className={btn}
            onClick={() => run("elo-backfill", "/admin/api/elo-backfill-from-results", {})}>
            由賽果回填 天喜ELO
          </button>
          <button type="button" disabled={busy !== null} className={btn}
            onClick={() => run("migrate-lgb", "/admin/api/migrate-prediction-log-lgb", {})}>
            Migration：prediction_log 天喜LGB 欄
          </button>
          <button type="button" disabled={busy !== null} className={btn}
            onClick={() => run("migrate-post-time", "/admin/api/migrate-entries-post-time", {})}>
            Migration：entries post_time
          </button>
        </div>
      </Card>

      <Card title="資料表行數" en="Table Counts" action={<button type="button" className="text-[11px] text-ink-3 underline" onClick={tables.reload}>刷新</button>}>
        {tables.loading && <Loading />}
        {tables.error ? <ErrorNote error={tables.error} /> : null}
        {tables.data && (() => {
          const all = Object.entries(tables.data.tableCounts ?? {}) as [string, number][];
          const live = all.filter(([t, n]) => n > 0 || !TABLE_NOTES[t]);
          const idle = all.filter(([t, n]) => n === 0 && TABLE_NOTES[t]);
          return (
            <>
              <Scroller>
                <Table head={["表", "行數"]}>
                  {live.map(([t, n]) => (
                    <tr key={t}>
                      <Td>{t}</Td>
                      <Td mono>{String(n)}</Td>
                    </tr>
                  ))}
                </Table>
              </Scroller>
              {idle.length > 0 && (
                <details className="mt-3 rounded-[8px] border border-hairline bg-paper-2 p-2.5">
                  <summary className="cursor-pointer text-[12px] text-ink-2">
                    0 行的表（{idle.length}）· 全部係舊表或備用表，非缺數據
                  </summary>
                  <div className="mt-2 divide-y divide-hairline">
                    {idle.map(([t]) => (
                      <div key={t} className="py-1.5">
                        <p className="tabnum font-mono-tx text-[11px] text-ink">{t}</p>
                        <p className="text-[11px] text-ink-3">{TABLE_NOTES[t]}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          );
        })()}
      </Card>


      <Card title="操作紀錄" en="Action Log">
        {log.length === 0 ? (
          <Empty label="尚未執行操作" />
        ) : (
          <div className="space-y-2">
            {log.map((l, i) => (
              <details key={i} className="rounded-[8px] border border-hairline bg-paper-2 p-2">
                <summary className={`cursor-pointer text-[12px] ${l.ok ? "text-win" : "text-lose"}`}>{l.label}</summary>
                <pre className="mt-2 max-h-48 overflow-auto text-[10px] text-ink-2">{l.text}</pre>
              </details>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function SqlPanel() {
  const post = useServerFn(adminPost);
  const [sql, setSql] = useState("SELECT date, venue, total_races FROM race_meetings ORDER BY date DESC LIMIT 20");
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const r = await post({ data: { path: "/admin/api/sql-read", body: { sql } } });
      if (!r.ok) throw new Error(JSON.stringify(r.payload));
      setRows(((r.payload as any).rows as any[]) ?? []);
    } catch (e) {
      setErr(e);
      setRows(null);
    } finally {
      setBusy(false);
    }
  }

  const cols = rows && rows.length ? Object.keys(rows[0]) : [];

  return (
    <Card title="唯讀 SQL" en="SQL Read">
      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        rows={4}
        className="w-full rounded-[8px] border border-hairline bg-paper-2 p-2 font-mono-tx text-[11px] text-ink"
      />
      <button type="button" disabled={busy} onClick={go} className="mt-2 w-full rounded-[8px] bg-deep px-3 py-2 text-[12px] text-deep-fg disabled:opacity-50">
        {busy ? "查詢中…" : "執行（只限 SELECT）"}
      </button>
      {err ? <ErrorNote error={err} /> : null}
      {rows && (rows.length ? (
        <Scroller>
          <Table head={cols}>
            {rows.map((r, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <Td key={c} mono>{r[c] === null ? "—" : String(r[c])}</Td>
                ))}
              </tr>
            ))}
          </Table>
        </Scroller>
      ) : <Empty label="無結果" />)}
    </Card>
  );
}
