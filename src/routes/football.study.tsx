import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { FootballNav } from "@/components/tx/FootballNav";
import { Card, Disclaimer, PageHead, Pill, Stat, StatGrid } from "@/components/tx/ui";
import { Button } from "@/components/ui/button";
import { CrestScoreboard } from "@/components/tx/FootballMatchUI";
import { DEFAULT_WEIGHTS, LABELS, LEAGUES, scenario, studyMatches, type Weights } from "@/lib/football-weight-study";
import { teamZh } from "@/lib/teamZh";
import { useCrests } from "@/lib/footballCrests";

export const Route = createFileRoute("/football/study")({
  head: () => ({ meta: [
    { title: "足球逐場研究回測 · 因子情境 · 天喜 TIANXI" },
    { name: "description", content: "五大聯賽 2024/25 逐場賽果及主客強弱、近期戰績情境分析；權重只供研究，不改凍結預測。" },
    { property: "og:title", content: "足球逐場研究回測 · 天喜 TIANXI" },
    { property: "og:description", content: "可調因子權重，比對逐場賽果及價值注實際盈虧。" },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: FootballStudy,
});

function FootballStudy() {
  const matchRoute = useMatchRoute();
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [league, setLeague] = useState("all");
  const [page, setPage] = useState(0);
  const getCrest = useCrests(Object.keys(LEAGUES));
  const rows = useMemo(() => studyMatches.filter((match) => league === "all" || match.div === league), [league]);
  const metrics = useMemo(() => {
    let bets = 0, profit = 0, rps = 0, draw = 0;
    for (const match of rows) {
      const x = scenario(match, weights);
      rps += x.rps;
      if (x.p[1] > x.p[0] && x.p[1] > x.p[2]) draw++;
      if (x.profit !== null) { bets++; profit += x.profit; }
    }
    return { bets, profit, rps: rps / (rows.length || 1), roi: bets ? profit / bets : 0, draw };
  }, [rows, weights]);
  const weightControl = (key: keyof Weights, label: string, note?: string) => (
    <label key={key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-hairline py-2.5 last:border-0">
      <span className="text-[12px] font-bold text-ink">{label}{note ? <small className="block font-normal text-ink-3">{note}</small> : null}</span>
      <span className="tabnum font-mono-tx text-[12px] text-ink">{weights[key].toFixed(2)}×</span>
      <input aria-label={`${label}權重`} type="range" min="0" max="2" step="0.05" value={weights[key]}
        disabled={key === "injury"} onChange={(event) => setWeights((previous) => ({ ...previous, [key]: Number(event.target.value) }))}
        className="col-span-2 w-full accent-gold disabled:opacity-40" />
    </label>
  );
  if (matchRoute({ to: "/football/study/$matchId", fuzzy: false })) return <Outlet />;
  return <AppShell page="football">
    <PageHead en="Independent Study · 2024/25" title="逐場研究回測" desc="五大聯賽 2024/25 季外代理模型；調整權重只作情境比較，唔係重新訓練 S5，亦唔會改任何凍結預測。" />
    <FootballNav />
    <Card title="因子權重" en="Scenario controls">
      {weightControl("strength", "主客強弱", "賽前 Elo 相差")}
      {weightControl("venue", "場地優勢", "對代理模型主場基準作情境偏移")}
      {weightControl("form", "近期戰績", "同日賽果不入特徵；只用之前五場")}
      {weightControl("injury", "傷兵", "冇可核實逐場賽前快照，暫停調整")}
      <Button variant="outline" size="sm" className="mt-3" onClick={() => setWeights(DEFAULT_WEIGHTS)}>重設權重</Button>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-3">1× 為原始季外代理機率；其他值以固定情境偏移主客勝，再重新歸一。和局機率相對改變唔代表新算法已通過驗證。賠率權重固定 0，只供結算比較。</p>
    </Card>
    <div className="px-4 pt-1"><label className="text-[11px] font-bold text-ink-2" htmlFor="study-league">聯賽</label>
      <select id="study-league" value={league} onChange={(event) => { setLeague(event.target.value); setPage(0); }} className="ml-2 rounded-[6px] border border-hairline bg-paper px-2 py-1.5 text-[12px] text-ink">
        <option value="all">五大聯賽</option>{Object.entries(LEAGUES).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
      </select></div>
    <div className="px-4 pt-3"><StatGrid>
      <Stat label="賽果" value={`${rows.length} 場`} sub="2024/25 季外" />
      <Stat label="RPS" value={metrics.rps.toFixed(4)} sub="情境值，非 S5" />
      <Stat label="價值注 ROI" value={`${(metrics.roi * 100).toFixed(2)}%`} sub={`${metrics.bets} 注 · 每注 1 單位`} />
      <Stat label="實際盈虧" value={`${metrics.profit >= 0 ? "+" : ""}${metrics.profit.toFixed(1)}`} sub="單位 · 未計交易成本" />
    </StatGrid></div>
    <p className="px-4 pt-2 text-[11px] leading-relaxed text-ink-3">每場只揀扣水後機率差最大且 ≥5 個百分點的一注；冇達標就唔下注。開盤報價冇鎖點時間戳，唔代表當時可買。按已見賽果調權重會過擬合，正數唔等於樣本外轉正。</p>
    <Card title="和局機率門檻 · 季外比較" en="Draw threshold">
      <p className="mb-2 text-[11px] leading-relaxed text-ink-3">以下係未調權重嘅原始代理機率，2021/22–2024/25 四季 7,156 場；門檻事後比較，唔係已驗證嘅引擎規則。每一注係買和局，非上述「最大 edge」策略。</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[320px] text-left text-[11px]"><thead><tr className="border-b border-hairline text-ink-3"><th className="py-2">機率門檻</th><th>場數</th><th>實際和局</th><th>開盤 ROI</th></tr></thead><tbody>
        <tr className="border-b border-hairline"><td className="py-2">≥25%</td><td>4,138</td><td>28.3%</td><td>−1.75%</td></tr>
        <tr className="border-b border-hairline"><td className="py-2">≥28%</td><td>1,583</td><td>31.2%</td><td>+3.69%</td></tr>
        <tr><td className="py-2">≥30%</td><td>70</td><td>32.9%</td><td>+3.26%</td></tr>
      </tbody></table></div>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-3">28% 覆蓋多啲，但逐季 ROI 為 +11.59%／−1.05%／+6.93%／−2.52%；30% 每季只有 10–26 場，不能以較高命中率宣稱最準。門檻係睇咗同一批賽果先選，屬事後篩選；需另有未見季度驗證先可考慮。報價無鎖點時間戳。</p>
    </Card>
    <Card title="逐場賽果" en="Match-by-match">
      <p className="mb-2 text-[11px] text-ink-3">共 {rows.length} 場 · 情境判和 {metrics.draw} 場 · 每頁 30 場</p>
      <div className="divide-y divide-hairline">
        {rows.slice(page * 30, (page + 1) * 30).map((match) => {
          const x = scenario(match, weights);
          return <Link key={match.id} to="/football/study/$matchId" params={{ matchId: match.id }} className="block py-3 transition-colors hover:bg-gold-bg/40">
            <div className="flex items-center justify-between gap-2 text-[10px] text-ink-3"><span>{match.date} · {LEAGUES[match.div]}</span><span>詳情 →</span></div>
            <CrestScoreboard rows={[{ name: teamZh(match.div, match.home), crest: getCrest(match.div, match.home), value: match.score[0] }, { name: teamZh(match.div, match.away), crest: getCrest(match.div, match.away), value: match.score[1] }]} />
            <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-ink-2"><span>Elo 差 {match.eloGap > 0 ? "+" : ""}{match.eloGap}</span><span>和局 {(x.p[1] * 100).toFixed(1)}%</span><span>實際 {LABELS[{ H: 0, D: 1, A: 2 }[match.result]]}</span><span className={x.profit === null ? "text-ink-3" : x.profit >= 0 ? "text-win" : "text-lose"}>價值注 {x.profit === null ? "未下注" : `${x.profit > 0 ? "+" : ""}${x.profit.toFixed(2)}`}</span></div>
          </Link>;
        })}
      </div>
      <div className="mt-3 flex items-center justify-between"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((v) => v - 1)}>上一頁</Button><span className="tabnum text-[11px] text-ink-2">{page + 1} / {Math.ceil(rows.length / 30)}</span><Button variant="outline" size="sm" disabled={(page + 1) * 30 >= rows.length} onClick={() => setPage((v) => v + 1)}>下一頁</Button></div>
    </Card>
    <div className="px-4"><Pill tone="gold">研究軌 · 不計正式戰績</Pill></div>
    <Disclaimer extra="呢頁係獨立代理研究，並非 S5 凍結矩陣；賠率只用作回測結算。唔提供投注建議。" />
  </AppShell>;
}