import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { FootballNav } from "@/components/tx/FootballNav";
import { Card, Disclaimer, ErrorNote, Loading, PageHead, Stat, StatGrid } from "@/components/tx/ui";
import { supabase } from "@/integrations/supabase/client";
import { DUAL_ENGINE, OUTCOME_LABEL, OUTCOMES, type Outcome } from "@/lib/footballDualEngine";
import { hkDateTime } from "@/lib/hkTime";
import { teamZh } from "@/lib/teamZh";

export const Route = createFileRoute("/football/match-vs-result")({
  head: () => ({
    meta: [
      { title: "足球逐場預測 vs 賽果 · 入球與隨機對照 · 天喜 TIANXI" },
      { name: "description", content: "揀一場已完場賽事，睇雙引擎鎖定嘅預期入球同主和客預測，對比實際比分、平均入球基準同隨機三揀一。" },
      { property: "og:title", content: "足球逐場預測 vs 賽果 · 天喜 TIANXI" },
      { property: "og:description", content: "雙引擎預期入球、主和客命中，同隨機基準逐場對照。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type Row = {
  match_key: string; div: string; home: string; away: string; kickoff_utc: string;
  lambda: number[]; p_final: number[]; prediction: Outcome; odds: number[] | null;
};
type Res = { ftr: Outcome; ft_h: number; ft_a: number };
const pc = (v: number) => `${(v * 100).toFixed(1)}%`;

function Page() {
  const ledger = useQuery({
    queryKey: ["football-mvr-ledger"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_dual_ledger")
        .select("match_key,div,home,away,kickoff_utc,lambda,p_final,prediction,odds")
        .eq("version", DUAL_ENGINE.version)
        .order("kickoff_utc", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 5 * 60_000,
  });
  const months = [...new Set((ledger.data ?? []).map((r) => r.kickoff_utc.slice(0, 7)))];
  const results = useQuery({
    queryKey: ["football-mvr-results", months.join(",")],
    enabled: months.length > 0,
    queryFn: async () => {
      const out: Record<string, Res> = {};
      for (const m of months) {
        const r = await fetch(`/api/public/football-predictions?file=log&month=${m}`);
        if (!r.ok) continue;
        const j = (await r.json()) as { matches?: Record<string, { result?: Res | null }> };
        for (const [k, v] of Object.entries(j.matches ?? {})) if (v.result) out[k] = v.result;
      }
      return out;
    },
    staleTime: 10 * 60_000,
  });

  const settled = useMemo(
    () => (ledger.data ?? []).flatMap((r) => (results.data?.[r.match_key] && r.lambda?.length === 2 ? [{ ...r, res: results.data[r.match_key]! }] : [])),
    [ledger.data, results.data],
  );
  // 平均入球基準：同一樣本實際主客平均入球（唔睇對手，等同「無模型」）
  const base = useMemo(() => {
    const n = settled.length || 1;
    return [settled.reduce((s, r) => s + r.res.ft_h, 0) / n, settled.reduce((s, r) => s + r.res.ft_a, 0) / n];
  }, [settled]);
  const agg = useMemo(() => {
    let eng = 0, bas = 0, hit = 0, mk = 0, mn = 0, eh = 0;
    for (const r of settled) {
      eng += Math.abs(r.lambda[0]! - r.res.ft_h) + Math.abs(r.lambda[1]! - r.res.ft_a);
      bas += Math.abs(base[0]! - r.res.ft_h) + Math.abs(base[1]! - r.res.ft_a);
      if (r.prediction === r.res.ftr) hit += 1;
      if (r.odds?.length === 3) {
        mn += 1;
        const fav = OUTCOMES[r.odds.indexOf(Math.min(...r.odds))];
        if (fav === r.res.ftr) mk += 1;
        if (r.prediction === r.res.ftr) eh += 1;
      }
    }
    const n = settled.length || 1;
    return { eng: eng / n, bas: bas / n, hit: hit / n, mkt: mn ? mk / mn : 0, engOnMkt: mn ? eh / mn : 0, mn };
  }, [settled, base]);

  const [sel, setSel] = useState<string>("");
  const cur = settled.find((r) => r.match_key === sel) ?? settled[0];

  return (
    <AppShell page="football" ticker="逐場預測 vs 賽果 · 雙引擎 T−6h 鎖定 · 入球同隨機對照">
      <PageHead en="Match vs Result" title="逐場預測 vs 賽果" desc="揀一場已完場賽事：雙引擎鎖定時嘅預期入球同主和客預測，對比 90 分鐘實際比分、平均入球基準同隨機三揀一。" />
      <FootballNav />
      {ledger.isLoading || results.isLoading ? (
        <Loading />
      ) : ledger.error || results.error ? (
        <div className="mx-4 mt-3"><ErrorNote error={ledger.error ?? results.error} /></div>
      ) : !settled.length ? (
        <Card title="未有已完場鎖定場次">雙引擎由 {DUAL_ENGINE.frozenAt} 起鎖定，賽果每日自動收料，完場後會自動出數。</Card>
      ) : (
        <>
          <div className="mx-4 mt-3">
            <StatGrid cols={3}>
              <Stat label="入球誤差（引擎）" value={agg.eng.toFixed(2)} sub={`平均基準 ${agg.bas.toFixed(2)} · 越細越好`} />
              <Stat label="主和客命中" value={pc(agg.hit)} sub={`隨機 33.3% · 長買主 ${pc(DUAL_ENGINE.base[0])}`} />
              <Stat label="樣本" value={`${settled.length} 場`} sub="已完場鎖定場次" />
            </StatGrid>
          </div>
          <Card title="預測目標" en="Target">
            {(() => {
              const beat = agg.mn > 0 && agg.engOnMkt > agg.mkt;
              return (
                <div className="text-[12px]">
                  <div className="grid grid-cols-3 gap-2 text-center tabular-nums">
                    <div><div className="text-ink-3">雙引擎</div><div className="text-[18px] font-bold text-gold">{pc(agg.engOnMkt)}</div></div>
                    <div><div className="text-ink-3">隨機三揀一</div><div className="text-[18px] font-bold">33.3%</div></div>
                    <div><div className="text-ink-3">市場熱門</div><div className="text-[18px] font-bold">{pc(agg.mkt)}</div></div>
                  </div>
                  <p className="mt-2 text-center">入球誤差：引擎 {agg.eng.toFixed(2)} · 平均基準 {agg.bas.toFixed(2)}</p>
                  <p className={`mt-2 text-center font-bold ${beat ? "text-win" : "text-lose"}`}>
                    {beat ? "已超越市場熱門" : `未達標：仲差 ${((agg.mkt - agg.engOnMkt) * 100).toFixed(1)} 個百分點先追到市場熱門`}
                  </p>
                  <p className="mt-1 text-[10px] text-ink-3">樣本 {agg.mn} 場有賠率鎖定場次；市場熱門＝鎖定時最低賠率一方，只作對照，賠率權重 0。</p>
                </div>
              );
            })()}
          </Card>
          <Card title="揀場次" en="Pick a Match">
            <select
              className="w-full rounded-[6px] border border-hairline bg-paper px-2 py-2 text-[13px] text-ink"
              value={cur?.match_key}
              onChange={(e) => setSel(e.target.value)}
            >
              {settled.map((r) => (
                <option key={r.match_key} value={r.match_key}>
                  {hkDateTime(r.kickoff_utc)} {teamZh(r.div, r.home)} vs {teamZh(r.div, r.away)}
                </option>
              ))}
            </select>
          </Card>
          {cur && (
            <Card title={`${teamZh(cur.div, cur.home)} ${cur.res.ft_h}–${cur.res.ft_a} ${teamZh(cur.div, cur.away)}`} en="Goals vs Baseline">
              <table className="w-full text-[12px]">
                <thead className="text-ink-3"><tr><th className="text-left">項目</th><th>主隊入球</th><th>客隊入球</th><th>總誤差</th></tr></thead>
                <tbody className="text-center tabular-nums">
                  <tr className="border-t border-hairline"><td className="text-left">實際</td><td className="font-semibold">{cur.res.ft_h}</td><td className="font-semibold">{cur.res.ft_a}</td><td>—</td></tr>
                  <tr className="border-t border-hairline"><td className="text-left text-gold">引擎預期</td><td>{cur.lambda[0]!.toFixed(2)}</td><td>{cur.lambda[1]!.toFixed(2)}</td><td className="text-gold">{(Math.abs(cur.lambda[0]! - cur.res.ft_h) + Math.abs(cur.lambda[1]! - cur.res.ft_a)).toFixed(2)}</td></tr>
                  <tr className="border-t border-hairline"><td className="text-left">平均基準</td><td>{base[0]!.toFixed(2)}</td><td>{base[1]!.toFixed(2)}</td><td>{(Math.abs(base[0]! - cur.res.ft_h) + Math.abs(base[1]! - cur.res.ft_a)).toFixed(2)}</td></tr>
                </tbody>
              </table>
              <table className="mt-3 w-full text-[12px]">
                <thead className="text-ink-3"><tr><th className="text-left">結果</th><th>雙引擎機率</th><th>隨機</th><th>歷史出現率</th></tr></thead>
                <tbody className="text-center tabular-nums">
                  {OUTCOMES.map((o, i) => (
                    <tr key={o} className={`border-t border-hairline ${o === cur.res.ftr ? "font-semibold" : ""}`}>
                      <td className="text-left">{OUTCOME_LABEL[o]}{o === cur.prediction ? " · 預測" : ""}{o === cur.res.ftr ? " · 賽果" : ""}</td>
                      <td>{pc(cur.p_final[i] ?? 0)}</td><td>33.3%</td><td>{pc(DUAL_ENGINE.base[i]!)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={`mt-2 text-[12px] font-bold ${cur.prediction === cur.res.ftr ? "text-win" : "text-lose"}`}>
                {cur.prediction === cur.res.ftr ? "命中" : "未中"}：預測 {OUTCOME_LABEL[cur.prediction]}，賽果 {OUTCOME_LABEL[cur.res.ftr]}
              </p>
              <p className="mt-1 text-[10px] text-ink-3">平均基準＝本樣本實際主客平均入球（唔睇對手）；只讀開賽前 6 小時鎖定列，完場唔重算。</p>
            </Card>
          )}
        </>
      )}
      <Disclaimer extra="只作對帳展示，不構成投注建議。" />
    </AppShell>
  );
}
