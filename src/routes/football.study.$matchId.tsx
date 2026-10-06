import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/tx/AppShell";
import { FootballNav } from "@/components/tx/FootballNav";
import { Card, Disclaimer, PageHead, Pill } from "@/components/tx/ui";
import { DEFAULT_WEIGHTS, LABELS, LEAGUES, scenario, studyMatches } from "@/lib/football-weight-study";
import { teamZh } from "@/lib/teamZh";
import { useCrests } from "@/lib/footballCrests";
import { CrestScoreboard, ProbBars } from "@/components/tx/FootballMatchUI";

export const Route = createFileRoute("/football/study/$matchId")({
  head: () => ({ meta: [
    { title: "逐場賽果與因子詳情 · 天喜 TIANXI" },
    { name: "description", content: "查看五大聯賽逐場實際比分、賽前主客強弱、近期戰績及和局因子對照。" },
    { property: "og:title", content: "足球逐場賽果詳情 · 天喜 TIANXI" },
    { property: "og:description", content: "對照賽果、賽前強弱、近期戰績及研究回測因子。" },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ] }), component: StudyMatchDetail,
});

function StudyMatchDetail() {
  const { matchId } = Route.useParams();
  const getCrest = useCrests(Object.keys(LEAGUES));
  const match = studyMatches.find((m) => m.id === matchId);
  if (!match) return <AppShell page="football"><FootballNav /><PageHead en="Research" title="搵唔到呢場賽事" /><div className="px-4 py-4"><Link to="/football/study" className="text-gold underline">返回逐場回測</Link></div></AppShell>;
  const value = scenario(match, DEFAULT_WEIGHTS);
  const fmt = (n: number) => `${(n * 100).toFixed(1)}%`;
  const homeForm = match.form[0].reduce((sum, n) => sum + n, 0);
  const awayForm = match.form[1].reduce((sum, n) => sum + n, 0);
  return <AppShell page="football">
    <PageHead en={`${LEAGUES[match.div]} · ${match.date}`} title={`${teamZh(match.div, match.home)} ${match.score[0]} : ${match.score[1]} ${teamZh(match.div, match.away)}`} desc="90 分鐘實際比分 · 獨立研究回測，非正式凍結預測" />
    <FootballNav />
    <div className="px-4 pt-3"><Link to="/football/study" className="text-[12px] font-bold text-gold">← 返回逐場回測</Link></div>
    <div className="px-4 pt-3"><CrestScoreboard rows={[{ name: teamZh(match.div, match.home), crest: getCrest(match.div, match.home), value: match.score[0] }, { name: teamZh(match.div, match.away), crest: getCrest(match.div, match.away), value: match.score[1] }]} /></div>
    <Card title="賽前因子 vs 實際賽果" en="As-of factors">
      <dl className="divide-y divide-hairline text-[12px]">
        <div className="flex justify-between gap-3 py-2"><dt>實際結果</dt><dd className="font-bold">{LABELS[{ H: 0, D: 1, A: 2 }[match.result]]}</dd></div>
        <div className="flex justify-between gap-3 py-2"><dt>主客強弱</dt><dd className="tabnum text-right">賽前 Elo 差 {match.eloGap > 0 ? "+" : ""}{match.eloGap}<br /><span className="text-ink-3">{match.eloGap > 50 ? "主隊較強" : match.eloGap < -50 ? "客隊較強" : "實力接近"}</span></dd></div>
        <div className="flex justify-between gap-3 py-2"><dt>場地</dt><dd>主隊主場 · 已計入原始基準</dd></div>
        <div className="flex justify-between gap-3 py-2"><dt>近期戰績</dt><dd className="tabnum text-right">前 {match.form[0].length} 場 {homeForm} 分 : 前 {match.form[1].length} 場 {awayForm} 分<br /><span className="text-ink-3">只計本場之前已完成賽事</span></dd></div>
        <div className="flex justify-between gap-3 py-2"><dt>傷兵</dt><dd>未有可核實嘅賽前快照 · 權重停用</dd></div>
      </dl>
    </Card>
    <Card title="和局判斷對照" en="Draw diagnosis">
      <div className="space-y-2 text-[12px] text-ink-2">
        <p>賽前預期入球：主 {match.goals[0].toFixed(2)} · 客 {match.goals[1].toFixed(2)}；預期總入球 {(match.goals[0] + match.goals[1]).toFixed(2)}。</p>
        <p>強弱差絕對值 {Math.abs(match.eloGap).toFixed(1)} Elo · {Math.abs(match.eloGap) < 50 ? "接近" : "有差距"}；兩隊預期入球差 {Math.abs(match.goals[0] - match.goals[1]).toFixed(2)}。</p>
        <p>代理機率：主勝 {fmt(value.p[0])} · 和局 {fmt(value.p[1])} · 客勝 {fmt(value.p[2])}。</p>
        <ProbBars p={value.p} mark={{ H: 0, D: 1, A: 2 }[match.result]} />
        <p>實際係{LABELS[{ H: 0, D: 1, A: 2 }[match.result]]}，單場 RPS {value.rps.toFixed(4)}。以上係賽前特徵對照，唔係賽果成因證明。</p>
      </div>
    </Card>
    <Card title="價值注結算" en="Open-price proxy">
      {match.odds ? <div className="space-y-2 text-[12px] text-ink-2">
        <p>Bet365 開盤主／和／客：{match.odds.map((v) => v.toFixed(2)).join(" / ")}；賠率唔入模型。</p>
        <p>最大扣水後機率差：{value.pick === null || !value.edge ? "未有" : `${LABELS[value.pick]} ${((value.edge[value.pick] ?? 0) * 100).toFixed(1)} 個百分點`}。</p>
        <p>預期每注收益（模型估計）：{value.expectedValue === null ? "未有" : `${(value.expectedValue * 100).toFixed(1)}%`}；實際每注盈虧：{value.profit === null ? "未達 5 點門檻，冇下注" : `${value.profit > 0 ? "+" : ""}${value.profit.toFixed(2)} 單位`}。</p>
      </div> : <Pill>冇同場可用報價 · 唔結算</Pill>}
    </Card>
    <Disclaimer extra="原始報價冇鎖點時間戳；個別正收益唔代表整體盈利，亦唔代表因子造成賽果。" />
  </AppShell>;
}