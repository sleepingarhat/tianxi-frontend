import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { FootballNav } from "@/components/tx/FootballNav";
import { Card, PageHead, Pill, Stat, StatGrid } from "@/components/tx/ui";
import { BsdMonitorCard } from "@/components/tx/BsdMonitorCard";
import { ModelVersions } from "@/components/tx/ModelVersions";
import { supabase } from "@/integrations/supabase/client";
import validation from "@/data/football-dual-engine-v1.json";
import eloV2 from "@/data/football-elo-v2.json";
import {
  DUAL_ENGINE,
  ODDS_SOURCE_LABEL,
  OUTCOME_LABEL,
  settlePnl,
  type Outcome,
} from "@/lib/footballDualEngine";
import { hkDateTime } from "@/lib/hkTime";
import { teamZh } from "@/lib/teamZh";

export const Route = createFileRoute("/football/dual-ledger")({
  head: () => ({
    meta: [
      { title: "天喜足球雙引擎戰績 · 命中率與盈虧 · 天喜 TIANXI" },
      { name: "description", content: "天喜足球雙引擎 dual-v1 由 2026-09-29 定版起逐場開賽前 6 小時鎖定，公開主／和／客命中率及平注盈虧。" },
      { property: "og:title", content: "天喜足球雙引擎戰績" },
      { property: "og:description", content: "定版起逐場鎖定、只增不改：命中率、平注盈虧、賠率來源全部公開。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DualLedger,
});

type Row = {
  match_key: string; div: string; home: string; away: string; kickoff_utc: string; locked_at: string;
  p_a: number[]; p_b_d: number; p_final: number[]; prediction: Outcome;
  odds_source: string; pick_odds: number | null; stake: number;
};
type LogRec = { result?: { ftr: Outcome; ft_h: number; ft_a: number } | null };

const pc = (v: number) => `${(v * 100).toFixed(1)}%`;
const months = (rows: Row[]) => [...new Set(rows.map((r) => r.kickoff_utc.slice(0, 7)))];

function DualLedger() {
  const [tab, setTab] = useState<"live" | "backtest">("live");
  const ledger = useQuery({
    queryKey: ["football-dual-ledger", DUAL_ENGINE.version],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_dual_ledger")
        .select("match_key,div,home,away,kickoff_utc,locked_at,p_a,p_b_d,p_final,prediction,odds_source,pick_odds,stake")
        .eq("version", DUAL_ENGINE.version)
        .order("kickoff_utc", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 5 * 60_000,
  });
  const rows = ledger.data ?? [];
  const results = useQuery({
    queryKey: ["football-dual-results", months(rows).join(",")],
    enabled: rows.length > 0,
    queryFn: async () => {
      const out: Record<string, LogRec> = {};
      for (const m of months(rows)) {
        const r = await fetch(`/api/public/football-predictions?file=log&month=${m}`);
        if (r.ok) Object.assign(out, ((await r.json()) as { matches?: Record<string, LogRec> }).matches ?? {});
      }
      return out;
    },
    staleTime: 10 * 60_000,
  });

  const stats = useMemo(() => {
    const blank = () => ({
      settled: 0, hit: 0, bets: 0, pnl: 0, staked: 0,
      byPick: { home: { n: 0, hit: 0 }, draw: { n: 0, hit: 0 }, away: { n: 0, hit: 0 } } as Record<Outcome, { n: number; hit: number }>,
    });
    const cur = blank(); // 現行版本：$100 注（2026-10-06 起）
    const old = blank(); // 歷史版本：$10 注
    for (const r of rows) {
      const ftr = results.data?.[r.match_key]?.result?.ftr;
      if (!ftr) continue;
      const s = (r.stake ?? DUAL_ENGINE.stake) >= DUAL_ENGINE.stakeV2 ? cur : old;
      s.settled++;
      s.byPick[r.prediction].n++;
      if (ftr === r.prediction) { s.hit++; s.byPick[r.prediction].hit++; }
      const p = settlePnl(r.prediction, ftr, r.pick_odds, r.stake ?? DUAL_ENGINE.stake);
      if (p !== null) { s.bets++; s.pnl += p; s.staked += r.stake ?? DUAL_ENGINE.stake; }
    }
    return { cur, old };
  }, [rows, results.data]);

  return (
    <AppShell page="football">
      <PageHead en="Dual Engine · Official Record" title="雙引擎戰績"
        desc={`${DUAL_ENGINE.version} 由 ${DUAL_ENGINE.frozenAt} 定版（Elo 換成重訓版 elo-v2，四季回測全面勝出舊版）。每場開賽前 ${DUAL_ENGINE.lockHours} 小時鎖定，只增不改，每場平注 $${DUAL_ENGINE.stakeV2}；戰績只計本版。`} />
      <FootballNav />
      <div className="flex gap-1.5 px-4 pt-3">
        {(["live", "backtest"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`rounded-full border px-3 py-1 text-[12px] font-bold text-ink ${tab === t ? "border-gold-strong bg-gold-bg" : "border-hairline bg-paper"}`}>
            {t === "live" ? "正式戰績（定版起）" : "回測（唔計入正式）"}
          </button>
        ))}
      </div>

      {tab === "live" ? (
        <>
          <div className="px-4 pt-3">
            <p className="mb-1.5 font-mono-tx text-[9px] font-bold uppercase tracking-[0.16em] text-ink-3">當前版本 · $100／注（{DUAL_ENGINE.stakeV2From} 起）</p>
            <StatGrid>
              <Stat label="已結算" value={`${stats.cur.settled} 場`} sub={`共鎖定 ${rows.length} 場`} />
              <Stat label="命中率" value={stats.cur.settled ? pc(stats.cur.hit / stats.cur.settled) : "—"} sub={`${stats.cur.hit} 中`} />
              <Stat label="淨盈虧" value={`${stats.cur.pnl >= 0 ? "+" : ""}$${stats.cur.pnl.toFixed(1)}`} sub={`${stats.cur.bets} 注有賠率`} />
              <Stat label="回報率" value={stats.cur.staked ? pc(stats.cur.pnl / stats.cur.staked) : "—"} sub="平注 $100" />
            </StatGrid>
            <details className="mt-2 rounded-[8px] border border-hairline bg-paper px-2.5 py-2">
              <summary className="cursor-pointer text-[10px] font-bold text-ink-2">歷史版本 · $10／注（{DUAL_ENGINE.frozenAt} 至 2026-10-05）</summary>
              <div className="mt-2"><StatGrid>
                <Stat label="已結算" value={`${stats.old.settled} 場`} sub="舊注碼時期" />
                <Stat label="命中率" value={stats.old.settled ? pc(stats.old.hit / stats.old.settled) : "—"} sub={`${stats.old.hit} 中`} />
                <Stat label="淨盈虧" value={`${stats.old.pnl >= 0 ? "+" : ""}$${stats.old.pnl.toFixed(1)}`} sub={`${stats.old.bets} 注有賠率`} />
                <Stat label="回報率" value={stats.old.staked ? pc(stats.old.pnl / stats.old.staked) : "—"} sub="平注 $10" />
              </StatGrid></div>
            </details>
          </div>
          <BsdMonitorCard />
          <ModelVersions engine="football" />
          <Card title="按預測分" en="By pick">
            <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
              {(["home", "draw", "away"] as Outcome[]).map((k) => (
                <div key={k} className="rounded-[8px] border border-hairline bg-paper-2 py-2">
                  <p className="font-bold text-ink">{OUTCOME_LABEL[k]}</p>
                  <p className="tabnum font-mono-tx text-ink-2">{stats.cur.byPick[k].n + stats.old.byPick[k].n} 場 · {stats.cur.byPick[k].n + stats.old.byPick[k].n ? pc((stats.cur.byPick[k].hit + stats.old.byPick[k].hit) / (stats.cur.byPick[k].n + stats.old.byPick[k].n)) : "—"}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="逐場帳" en="Match ledger">
            {ledger.isLoading ? <p className="text-[12px] text-ink-3">載入中…</p> : !rows.length ? (
              <p className="text-[12px] leading-relaxed text-ink-3">定版後第一場開賽前 6 小時自動鎖定，之後會喺呢度出現。</p>
            ) : (
              <ul className="divide-y divide-hairline">
                {rows.map((r) => {
                   const res = results.data?.[r.match_key]?.result;
                  const pnl = res ? settlePnl(r.prediction, res.ftr, r.pick_odds, r.stake ?? DUAL_ENGINE.stake) : null;
                  return (
                    <li key={r.match_key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 py-2 text-[12px]">
                      <span className="min-w-0">
                        <Link to="/football/match/$matchKey" params={{ matchKey: r.match_key }} className="font-bold text-ink underline decoration-hairline underline-offset-2">{teamZh(r.div, r.home)} vs {teamZh(r.div, r.away)}</Link>
                        <small className="block text-ink-3">{hkDateTime(r.kickoff_utc)} · 和局 A {pc(r.p_a[1] ?? 0)}／B {pc(r.p_b_d)} · {ODDS_SOURCE_LABEL[r.odds_source] ?? r.odds_source}{r.pick_odds ? ` ${r.pick_odds.toFixed(2)}` : ""}</small>
                      </span>
                      <span className="text-right">
                        <Pill tone="gold">{OUTCOME_LABEL[r.prediction]}</Pill>
                        <small className="tabnum block font-mono-tx text-ink-2">
                          {res ? `${res.ft_h}-${res.ft_a} ${res.ftr === r.prediction ? "● 中" : "○ 未中"}${pnl !== null ? ` ${pnl >= 0 ? "+" : ""}${pnl.toFixed(1)}` : " 無賠率"}` : "未結算"}
                        </small>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      ) : (
        <Card title="回測 · 2021/22–2024/25" en="Backtest (not official)">
          <p className="mb-2 text-[11px] leading-relaxed text-ink-3">常量用 2014/15–2020/21 定死後，四季原封不動驗證；引擎 A 用研究代理模型，唔係正式凍結矩陣。賠率為 Bet365 開盤價。</p>
          <div className="overflow-x-auto"><table className="w-full min-w-[340px] text-left text-[11px]">
            <thead><tr className="border-b border-hairline text-ink-3"><th className="py-2">季度</th><th>場數</th><th>命中率</th><th>主／和／客預測</th><th>平注回報</th></tr></thead>
            <tbody>{validation.validation.map((v) => (
              <tr key={v.season} className="border-b border-hairline last:border-0">
                <td className="py-2">20{v.season.slice(0, 2)}/{v.season.slice(2)}</td><td>{v.n}</td><td>{pc(v.acc)}</td>
                <td>{v.picks.join("／")}</td><td>{(v.flat_roi * 100).toFixed(2)}%</td>
              </tr>
            ))}</tbody>
          </table></div>
        </Card>
      )}
      {tab !== "live" && (
        <Card title="點解換新 Elo · elo-v2" en="Elo Retrain Backtest">
          <p className="mb-2 text-[11px] leading-relaxed text-ink-3">
            用 2020/21 季或之前資料重新搵參數（主場優勢 {eloV2.params_old.hfa}→{eloV2.params_new.hfa}、K {eloV2.params_old.k0}→{eloV2.params_new.k0}、跨季保留 {eloV2.params_old.reg}→{eloV2.params_new.reg}），再原封不動驗證四季。RPS 越低越準。
            四季 RPS 全部低過舊版、命中率全部上升，所以直接換新，舊版停止計分。
          </p>
          <div className="overflow-x-auto"><table className="w-full min-w-[340px] text-left text-[11px]">
            <thead><tr className="border-b border-hairline text-ink-3"><th className="py-2">季度</th><th>場數</th><th>RPS 舊→新</th><th>命中 舊→新</th><th>五大聯賽命中</th></tr></thead>
            <tbody>{eloV2.validation.map((v) => (
              <tr key={v.season} className="border-b border-hairline last:border-0">
                <td className="py-2">20{v.season.slice(0, 2)}/{v.season.slice(2)}</td><td>{v.n.toLocaleString()}</td>
                <td className="tabnum">{v.rps_old.toFixed(4)}→<b className="text-win">{v.rps_new.toFixed(4)}</b></td>
                <td>{pc(v.acc_old)}→{pc(v.acc_new)}</td><td>{pc(v.acc5_old)}→{pc(v.acc5_new)}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </Card>
      )}
    </AppShell>
  );
}
