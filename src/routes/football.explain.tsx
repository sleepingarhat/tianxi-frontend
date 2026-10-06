import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { FootballNav } from "@/components/tx/FootballNav";
import { AppShell } from "@/components/tx/AppShell";
import { FingerprintChip } from "@/components/tx/FootballMatchUI";
import { Card, Disclaimer, Empty, ErrorNote, Loading, PageHead, Pill, Stat, StatGrid } from "@/components/tx/ui";


export const Route = createFileRoute("/football/explain")({
  head: () => ({
    meta: [
      { title: "足球凍結預測覆蓋解釋 · 天喜 TIANXI" },
      {
        name: "description",
        content: "五大聯賽綠燈已鎖場次：凍結矩陣首選覆蓋、波膽頭八格覆蓋、RPS 同校準誤差；只讀凍結帳，係覆蓋統計，唔係因果。",
      },
      { property: "og:title", content: "足球凍結預測覆蓋解釋 · 天喜 TIANXI" },
      { property: "og:description", content: "只讀凍結帳：綠燈場次嘅首選覆蓋、頭八格覆蓋、RPS、ECE。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FootballExplainPage,
});

type Green = {
  n: number;
  rps_avg: number | null;
  argmax_hit_rate: number | null;
  ece: number | null;
  cs_top1?: number | null;
  cs_top3?: number | null;
  cs_top8: number | null;
  cs_logloss?: number | null;
  fingerprints?: string[];
};
type HitRate = { generated_at?: string; green?: Green; baselines?: { prior_asof?: number; s5_production_gate?: number; s5_backtest?: number } };

const pct = (x?: number | null) => (x == null ? "—" : `${(x * 100).toFixed(1)}%`);
const f4 = (x?: number | null) => (x == null ? "—" : x.toFixed(4));

function FootballExplainPage() {
  const q = useQuery({
    queryKey: ["footballHitRate"],
    queryFn: async (): Promise<HitRate> => {
      const r = await fetch("/api/public/football-predictions?file=hit_rate");
      if (!r.ok) throw new Error(`讀取失敗（${r.status}）`);
      return (await r.json()) as HitRate;
    },
    staleTime: 600_000,
    retry: 1,
  });
  const g = q.data?.green;
  const thin = (g?.n ?? 0) < 10;
  const fps = Array.from(new Set((g?.fingerprints ?? []).map((s) => s.split("s5:")[1] ?? s)));

  return (
    <AppShell page="football" ticker="足球覆蓋解釋 · 只讀凍結帳 · 綠燈五大聯賽 · 賠率零權重 · 唔係因果">
      <PageHead
        en="FOOTBALL · COVERAGE"
        title="凍結預測覆蓋解釋"
        desc={
          <>
            只收五大聯賽、綠燈、已鎖並完場嘅場次，量凍結矩陣首選同波膽頭八格覆蓋幾多。
            <strong className="text-ink"> 係覆蓋統計，唔係「點解會贏」嘅因果解釋。</strong>紅燈場次唔入呢個數。
          </>
        }
      />
      <FootballNav />

      <Card title="綠燈帳" en="GREEN LEDGER" action={g ? <Pill tone={thin ? "lose" : "win"}>{g.n} 場</Pill> : null}>
        {q.isLoading ? (
          <Loading label="讀取凍結帳…" />
        ) : q.error ? (
          <ErrorNote error={q.error} />
        ) : !g ? (
          <Empty label="未有綠燈完場樣本" />
        ) : (
          <>
            <StatGrid cols={3}>
              <Stat label="平均 RPS" value={f4(g.rps_avg)} sub="越低越好" />
              <Stat label="校準誤差 ECE" value={f4(g.ece)} sub="1X2" />
              <Stat label="樣本" value={g.n} sub="場" />
            </StatGrid>
            <div className="mt-2">
              <StatGrid cols={3}>
                <Stat label="首選覆蓋" value={pct(g.argmax_hit_rate)} sub="次指標" />
                <Stat label="頭八格覆蓋" value={pct(g.cs_top8)} sub="波膽" />
                <Stat label="頭三格覆蓋" value={pct(g.cs_top3)} sub="波膽" />
              </StatGrid>
            </div>
            {thin ? <p className="mt-2 text-[10px] text-lose">樣本少於 10 場，唔可以當結論。</p> : null}
            {q.data?.baselines ? (
              <p className="mt-2 tabnum font-mono-tx text-[10px] leading-relaxed text-ink-3">
                對照 RPS：賽前先驗 {f4(q.data.baselines.prior_asof)} · 生產閘 {f4(q.data.baselines.s5_production_gate)} · 回測{" "}
                {f4(q.data.baselines.s5_backtest)}（回測數字唔填入實戰）
              </p>
            ) : null}
            <FingerprintChip values={fps} note={`更新 ${q.data?.generated_at ?? "—"}`} />

          </>
        )}
      </Card>

      <Card title="口徑同限制" en="CAVEATS">
        <div className="space-y-1.5 text-[11px] leading-relaxed text-ink-2">
          <p><Pill>唯讀</Pill> 正式預測以雙引擎 dual-v1 為準，呢頁覆蓋數字照讀凍結三格；唔改機率、唔改指紋、唔重跑模型。</p>
          <p><Pill tone="lose">唔係因果</Pill> 覆蓋數字只反映凍結預測同賽果嘅重疊，唔代表任何一隊贏嘅原因。</p>
          <p><Pill>三揀接近</Pill> 主客差少過 8 個百分點只會加「三揀接近」標記，唔會改成判和。</p>
          <p><Pill>未開</Pill> 逐項因子（SHAP）未上線，呢頁唔顯示。</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link to="/football/prediction-vs-result" className="rounded-[6px] border border-hairline bg-paper px-2 py-1 font-mono-tx text-[10px] font-bold text-ink-2 hover:border-gold-strong">預測 vs 賽果 →</Link>
          <Link to="/football/standings" className="rounded-[6px] border border-hairline bg-paper px-2 py-1 font-mono-tx text-[10px] font-bold text-ink-2 hover:border-gold-strong">積分榜 →</Link>
        </div>
      </Card>

      <Disclaimer extra="足球覆蓋解釋只讀凍結帳，唔構成投注建議。" />
    </AppShell>
  );
}
