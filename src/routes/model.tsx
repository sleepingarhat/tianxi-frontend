import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/tx/AppShell";
import { Card, PageHead } from "@/components/tx/ui";
import { ELO, FACTOR_RULES, FEATURES, LGB } from "@/lib/model-spec";

const TITLE = "模型說明 · Elo 公式與 LightGBM 特徵 · 天喜賽馬";
const DESC = "天喜 TX-Oracle v3 公開模型說明：Elo 更新公式、K 值、騎練權重、52 項 LightGBM 特徵衍生及編碼方式。";

export const Route = createFileRoute("/model")({
  head: () => ({ meta: [
    { title: TITLE },
    { name: "description", content: DESC },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESC },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://tianxi.racing/model" }] }),
  component: ModelPage,
});

const SRC = "https://github.com/sleepingarhat/tianxi-racing/blob/main/backend/";

function Formula({ children }: { children: string }) {
  return <pre className="overflow-x-auto rounded-md border border-hairline bg-paper-2 p-3 font-mono-tx text-[11px] leading-relaxed text-ink">{children}</pre>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[12px] leading-relaxed text-ink-2">{children}</p>;
}

function Src({ path }: { path: string }) {
  return <a href={SRC + path} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block break-all font-mono-tx text-[10px] text-gold underline">源碼：{path}</a>;
}

function ModelPage() {
  return <AppShell page="dashboard" ticker="模型說明 · 公式與特徵公開">
    <PageHead en="Model" title="模型說明" desc="TX-Oracle v3：Elo 評分加 LightGBM 排名模型。以下內容逐項對照公開源碼，可自行核對。" />

    <Card title="融合公式" en="Ensemble">
      <Formula>{`blendZ     = α · lgb_z + (1 − α) · elo_z      α = ${LGB.alpha}
排名分      = blendZ + 0.5 · (factor_bonus ÷ 100)
finalScore = 1500 + blendZ × 100      （顯示用，唔包 factor）`}</Formula>
      <P>lgb_z、elo_z 係同一場內各自標準化（減平均、除標準差）。冇 LightGBM 分嘅馬以全場平均代入。現行正式預測嘅 factor_bonus 只計檔位同負磅兩項。</P>
      <Src path="src/routes/analyze.ts" />
    </Card>

    <Card title="Elo 更新公式" en="Elo">
      <Formula>{`對每對馬 i、j（i 名次較好）：
expected_i = 1 / (1 + 10^((R_j − R_i) / 400))
delta_i   += K / (N − 1) × (1 − expected_i)
delta_j   += K / (N − 1) × (0 − expected_j)
K = ${ELO.k}，初始評分 = ${ELO.initial}`}</Formula>
      <P>N 為完成賽事匹數；所有配對變動加總後同時套用；同名次當 0.5／0.5；未完成（DNF／PU）唔計。馬匹、騎師、練馬師各自用同一方法更新。</P>
      <Formula>{`elo_composite = (0.7 × 馬匹 + 0.2 × 騎師 + 0.1 × 練馬師) ÷ 有資料權重之和`}</Formula>
      <P>評分軸：馬匹快照分 {ELO.axes.join("、")} 五軸儲存，但正式預測<b>只讀 overall 軸</b>；其餘四軸冇加權入預測，所以冇「五軸權重」。騎師同練馬師只有單一評分。騎練權重可經回測調整，以上係預設值。</P>
      <Src path="scripts/elo/engine.ts" />
    </Card>

    <Card title="LightGBM 訓練" en="LambdaRank">
      <div className="grid gap-1 text-[12px] text-ink-2">
        <div>目標：{LGB.objective}；評估：{LGB.metric}；截斷：前 {LGB.truncation} 名</div>
        <div>標籤：{LGB.labels}</div>
        <div>label_gain：{LGB.labelGain}</div>
        <div>缺失值：{LGB.missing}</div>
        <div>類別特徵：{LGB.categorical}</div>
        <div>輪數：以早停搵最佳輪數，再用全部資料重訓</div>
        <div>防洩漏：所有往績只用賽日之前資料；唔用任何賠率</div>
      </div>
      <Src path="scripts/backtest/predict_upcoming.py" />
    </Card>

    <Card title={`特徵清單（${FEATURES.length} 項＋going_code）`} en="Features">
      <ol className="divide-y divide-hairline">
        {FEATURES.map((f, i) => <li key={f.name} className="grid gap-0.5 py-2 sm:grid-cols-[2rem_12rem_6rem_1fr_9rem] sm:gap-3">
          <span className="font-mono-tx text-[10px] text-ink-3">{i + 1}</span>
          <span className="break-all font-mono-tx text-[11px] font-bold text-ink">{f.name}</span>
          <span className="text-[11px] text-gold">{f.group}</span>
          <span className="text-[12px] leading-relaxed text-ink-2">{f.derive}</span>
          <span className="text-[11px] text-ink-3">{f.encode}</span>
        </li>)}
      </ol>
      <Src path="scripts/backtest/dump-features.ts" />
    </Card>

    <Card title="factor_bonus 規則分" en="Factors">
      <Formula>{`rate(出賽, 頭三, scale) = ((頭三 + 0.30 × 5) ÷ (出賽 + 5) − 0.30) × scale　；冇往績 = 0`}</Formula>
      <div className="mt-2 divide-y divide-hairline text-[12px]">
        {FACTOR_RULES.map((r) => <div key={r.name} className="flex gap-3 py-1.5"><b className="w-10 shrink-0 text-ink">{r.name}</b><span className="text-ink-2">{r.rule}</span></div>)}
      </div>
      <P>訓練特徵入面嘅 factor_bonus 係六項之和；正式預測加分只計檔位同負磅。</P>
    </Card>

    <Card title="測試過但未採用" en="Not promoted">
      <P>試閘、場內相對值、配備變化、分段速度 z 值、賽後評述（受阻／走大疊／出閘失準）：經 1,299 場 walk-forward A/B 測試，命中率冇穩定改善，未用於正式預測。長休復出、班次適應、騎練180日勝率等只喺回測檔，未升正式版。</P>
    </Card>
  </AppShell>;
}
