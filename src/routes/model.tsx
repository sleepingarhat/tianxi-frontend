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
      <Formula>{`對每對參賽者 i、j：
expected_i = 1 / (1 + 10^((R_j − R_i) / 400))
K_eff_i   = K_base × exp(−距上仗日數 / τ) × 暫定倍率
delta_i   = Σ K_eff_i / (N − 1) × (實際得分 − expected_i)
K_base：馬 ${ELO.k.horse}／騎師 ${ELO.k.jockey}／練馬師 ${ELO.k.trainer}
τ（日）：馬 ${ELO.tau.horse}／騎師 ${ELO.tau.jockey}／練馬師 ${ELO.tau.trainer}
暫定倍率：更新前少於 ${ELO.provisionalGames} 仗 → ×${ELO.provisionalMultiplier}，其餘 ×1`}</Formula>
      <P>N 為有效比較人數；實際得分：名次較好為1、較差為0、同名次為0.5。未完成（名次999）不參與配對。初出無上仗日數時不衰減；一般起步評分{ELO.initial}，進口馬1580、自購馬1560。外地騎師1550係可用設定，但原批次程式未傳入該標記，不宣稱已採用。</P>
      <Formula>{`可信度 = min(1, 出賽數 / 20) × (1 − exp(−近期加權出賽數 / 6))
普通更新：近期加權出賽數 = 舊值 × exp(−距上仗日數 / τ) + 1`}</Formula>
      <P>可信度係出賽量與新鮮度指標，唔係命中機率。馬匹休息超365日至720日暫停更新自身變動，超720日列退役；騎師／練馬師相應門檻為730／1095日。馬季回歸系數：馬5%、騎師及練馬師2%，拉近1500；原程式跨曆年亦會觸發，唔只係7月31日。2017年年底或之前的快照另有暖機標記。</P>
      <Formula>{`elo_composite = (0.7 × 馬匹 + 0.2 × 騎師 + 0.1 × 練馬師) ÷ 有資料權重之和`}</Formula>
      <P>馬匹有overall軸，另按草地／泥地×途程分軸儲存（短途≤1400、一哩≤1800、中距≤2000、其餘長途）。草地常見軸為 {ELO.axes.join("、")}；唔係固定只得五軸。正式預測<b>只讀overall軸</b>，所以冇五軸融合權重；騎師與練馬師各自只有overall評分。以上綜合權重係預測層設定，唔係Elo更新公式。</P>
      <Src path="scripts/elo/engine_v12.ts" />
      <Src path="scripts/elo/compute_v12.ts" />
      <P>2026-10-17核查更新流程錯配：真正v12快照曾停在4月15日，現已補計至10月14日；舊凍結預測與鎖定紀錄不改。補計評分唔代表原賽前已使用，亦不保證命中率提高。</P>
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
      <P>正式訓練新增保存序列化模型嘅gain（樹分裂改善量）及split（使用次數），各自列百分比、保留零值與訓練欄序，附模型及設定檔指紋。不是單馬SHAP、因果或Elo貢獻，亦不自動升版；首份正式完整重訓報告仍待驗收。</P>
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
