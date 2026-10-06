import { createFileRoute, Link } from "@tanstack/react-router";

import { FootballNav } from "@/components/tx/FootballNav";
import { AppShell } from "@/components/tx/AppShell";
import { Card, Disclaimer, PageHead, Pill, Scroller, Stat, StatGrid, Table, Td } from "@/components/tx/ui";
import { KVGrid, MeterBar, Timeline } from "@/components/tx/viz";
import {
  FB_AUDIT,
  FB_SEASONS,
  FB_SNAPSHOT_DATE,
  FB_SOURCES,
  FB_STRENGTH,
  FB_TEMPO,
  FB_TOTAL_MATCHES,
  FB_TRACKS,
  FB_XG,
  pct,
} from "@/lib/football-snapshot";

export const Route = createFileRoute("/football/engine")({
  head: () => ({
    meta: [
      { title: "足球引擎流程 · 賽前凍結與紅黃綠燈 · 天喜 TIANXI" },
      {
        name: "description",
        content:
          "天喜足球引擎逐步流程：三軌集成權重、校準器揀選、賽前凍結與版本指紋、紅黃綠燈定義，以及採用同未採用嘅特徵因子。賠率零權重。",
      },
      { property: "og:title", content: "足球引擎流程 · 天喜 TIANXI" },
      { property: "og:description", content: "七步流程、集成權重、凍結規矩與特徵取捨全部公開。" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FootballEnginePage,
});

const ens = FB_TRACKS.find((t) => t.live)!;
const STR_LIVE = FB_STRENGTH.variants.find((v) => v.live)!;
const STR_RAW = FB_STRENGTH.variants.find((v) => !v.live)!;
const XG_NOW = FB_XG.variants.find((v) => v.live)!;
const XG_NEXT = FB_XG.variants.find((v) => !v.live)!;
const latest = FB_SEASONS[FB_SEASONS.length - 1]!;
const CALIB_LABEL: Record<string, string> = { none: "免校準", vector: "向量標度", isotonic: "保序回歸" };

const STEPS: { key: string; time: string; title: string; sub: string; tone: "gold" | "ink" | "win" }[] = [
  { key: "1", time: "T-7 日", title: "① 賽程落地", sub: "官方源頭每 6 小時抓未來一週賽程，抓唔到保留舊貨並標明", tone: "win" },
  { key: "2", time: "T-72 時", title: "② 賽前特徵計算", sub: "54 項只用開賽前已存在資料：Elo、λ、近十場滾動、休息日、對賽", tone: "win" },
  { key: "3", time: "T-72 時", title: "③ 三軌各自出機率", sub: "天喜足球ELO ／ Dixon-Coles 入球模型 ／ 天喜足球LGB", tone: "win" },
  { key: "4", time: "T-72 時", title: "④ 對數空間加權集成", sub: "權重只用測試季之前兩季季外預測擬合", tone: "win" },
  { key: "5", time: "T-48 時", title: "⑤ 機率校準", sub: "向量標度 對 逐類保序 互比，揀贏嘅（ECE 0.30%）", tone: "win" },
  {
    key: "6",
    time: "T-24 時",
    title: "⑥ 派生全部盤口",
    sub: "卜瓦松矩陣＋Dixon-Coles 低比分修正，再按集成實力機率分區加權；主客和／大細／入球雙方／波膽同出一個矩陣",
    tone: "win",
  },
  { key: "7", time: "T-2 時", title: "⑦ 市場對照（唔入模）", sub: "多莊平均去水賠率只作基準線、價值注判斷、殘差診斷", tone: "gold" },
  { key: "8", time: "T-30 分", title: "⑧ 凍結＋版本指紋", sub: "鎖定機率、記模型與特徵指紋，賽後用官方賽果逐場對帳", tone: "gold" },
];

const LIGHTS: { tone: "win" | "gold" | "lose"; name: string; label: string; body: string }[] = [
  { tone: "gold", name: "黃燈", label: "暫定", body: "已出機率但未夠鐘鎖定，或官方首發陣容未公布。數字仲會變。" },
  { tone: "win", name: "綠燈", label: "最終預測", body: "開賽前 30 分鐘鎖定，版本指紋已保存，之後唔會改，賽後全部公開對帳。" },
  { tone: "lose", name: "紅燈", label: "退回基準", body: "特徵缺失或集成失敗，退回天喜足球ELO 基準機率，頁面明確標示，唔會當成最終預測。" },
];

const USED: { group: string; items: string; n: number }[] = [
  { group: "自家 Elo（主客獨立）", items: "主客場評分、分差、跨季回歸後評分、近期評分變化", n: 8 },
  { group: "入球模型派生", items: "λ 主／客、攻擊防守係數、比分矩陣三項機率、大細與入球雙方機率", n: 11 },
  { group: "近十場滾動", items: "賽果得分、入失球、射門／中目標、角球、黃紅牌，主客場分開計", n: 20 },
  { group: "賽程結構", items: "休息日數、14 日內場次密度、連續作客", n: 5 },
  { group: "對賽往績", items: "H2H 場數、勝率、平均入球（只計本場之前）", n: 6 },
  { group: "賽事層", items: "聯賽 ID、季內周次、主場優勢基線", n: 4 },
];

const REJECTED: { name: string; why: string }[] = [
  { name: "任何賠率（開盤／收盤／亞盤）", why: "鐵律：market_beta = 0。賠率只做對照線、價值注同殘差診斷，永不入排名。" },
  { name: "數據集自帶 ExpectedGoals 欄", why: "唔係真 xG——由中目標同賠率衍生，仲用埋賽中統計，兩重犯規。" },
  { name: "賽中統計（實際射門、控球、犯規）", why: "開賽後先存在，入模即係數據洩漏。只准用作歷史滾動特徵嘅過去場次。" },
  { name: "和局重採樣／類別加權", why: "會扭曲機率校準。和局改用「機率對賠率」價值注處理。" },
  { name: "隨機切分驗證", why: "時序資料抽籤等於偷看未來，一律逐季 walk-forward。" },
  { name: "球員 11 人分數直接加總", why: "換人組合未知。改為聚合成預期首發強度、板凳深度、可用陣容比率、輪換不確定度四項球隊層特徵（v1）。" },
];

function FootballEnginePage() {
  return (
    <AppShell
      page="football"
      ticker={`TX-Football 引擎 v0 · S5 三軌集成＋校準 · RPS ${ens.rps.toFixed(4)} · 命中率 ${pct(ens.acc)} · 校準誤差 0.30% · S8 五大聯賽實力模型 RPS ${STR_LIVE.rps.toFixed(4)} ／ 命中率 ${pct(STR_LIVE.acc)}（波膽層採用）· 賠率零權重`}
    >
      <PageHead
        en="Engine"
        title="足球引擎流程"
        desc={
          <>
            同賽馬引擎同一套規矩：每一步幾時做、用咩資料、幾時鎖定、邊啲因子採用邊啲唔採用，全部寫明。
            賠率永遠零權重。
          </>
        }
      />
      <FootballNav />

      <Card title="現行引擎" en="Live Track">
        <StatGrid cols={3}>
          <Stat label="排序分數 RPS" value={ens.rps.toFixed(4)} sub="越低越好" />
          <Stat label="命中率" value={pct(ens.acc)} sub="主客和三項" />
          <Stat label="校準誤差" value="0.30%" sub="講幾成即幾成" />
        </StatGrid>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <MeterBar label="集成 對 市場去水線" value={ens.rps.toFixed(4)} ratio={0.2047 / ens.rps} sub="市場線 0.2047 · 尚差 0.0051" />
          <MeterBar label="集成 對 第一閘（歷史頻率）" value="勝" tone="win" ratio={1} sub="歷史頻率 0.2261" />
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          回測基礎：{FB_TOTAL_MATCHES.toLocaleString()} 場，逐季時序前推，快照 {FB_SNAPSHOT_DATE} 凍結只增不改。
          逐季明細見{" "}
          <Link to="/football/results" className="font-bold text-gold">
            公開對帳頁
          </Link>
          。
        </p>
      </Card>

      <Card title="S8 五大聯賽實力模型（波膽層正式採用）" en="Strength Model">
        <StatGrid cols={3}>
          <Stat label="排序分數 RPS" value={STR_LIVE.rps.toFixed(4)} sub={`已贏市場去水線 0.2047`} />
          <Stat label="主客和命中率" value={pct(STR_LIVE.acc)} sub={`回測 ${FB_STRENGTH.backtested.toLocaleString()} 場`} />
          <Stat label="波膽命中率" value={pct(STR_LIVE.scoreHit)} sub="單一比分，理論上限附近" />
        </StatGrid>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <MeterBar
            label="實力重加權 對 市場去水線"
            value={STR_LIVE.rps.toFixed(4)}
            tone="win"
            ratio={1}
            sub={`市場線 0.2047 · 勝 ${(0.2047 - STR_LIVE.rps).toFixed(4)}`}
          />
          <MeterBar
            label="實力重加權 對 純入球實力模型"
            value="勝"
            tone="win"
            ratio={1}
            sub={`純入球 ${STR_RAW.rps.toFixed(4)} ／ 命中 ${pct(STR_RAW.acc)} ／ 波膽 ${pct(STR_RAW.scoreHit)}`}
          />
        </div>
        <div className="mt-2">
          <KVGrid
            rows={[
              { k: "訓練範圍", v: `${FB_STRENGTH.leagues} · ${FB_STRENGTH.span} · ${FB_STRENGTH.matches.toLocaleString()} 場` },
              { k: "模型", v: "Dixon-Coles 攻守係數＋主場優勢＋低比分修正" },
              { k: "時間衰減", v: `半衰期 ${FB_STRENGTH.halfLifeDays} 日，每 ${FB_STRENGTH.retrainDays} 日滾動重訓` },
              { k: "波膽權重", v: "比分矩陣按集成主／和／客機率分區縮放（勝負由實力定）", tone: "win" },
              {
                k: "大比數校準",
                v: `預測四球或以上 ${pct(FB_STRENGTH.bigGoalsPred, 1)}，實際 ${pct(FB_STRENGTH.bigGoalsAct, 1)}`,
              },
              { k: "賠率權重", v: "0（永不入模，亦不用作校正）", tone: "lose" },
            ]}
          />
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          誠實講：重加權提升嘅係機率質素（RPS {STR_RAW.rps.toFixed(4)} → {STR_LIVE.rps.toFixed(4)}），
          唔會令模型多出大比數波膽——1-1 集中度反而由 {pct(FB_STRENGTH.drawConcentration.before, 0)} 升到{" "}
          {pct(FB_STRENGTH.drawConcentration.after, 0)}，因為兩隊 λ 多數落 1.1–1.6，數學上最厚一格必然係低比分。
          所以展示改為「一個主選＋分區備選」，並公開四球以上合計機率。快照 {FB_STRENGTH.frozen} 凍結。
        </p>
      </Card>

      <Card title="S9 預期入球（xG）併入波膽模型：驗證完成，等授權數據源" en="xG Integration">
        <StatGrid cols={3}>
          <Stat label="現行（只用實際入球）" value={XG_NOW.rps.toFixed(4)} sub={`命中 ${pct(XG_NOW.acc)} · 波膽 ${pct(XG_NOW.scoreHit)}`} />
          <Stat label="入球 × xG 混合" value={XG_NEXT.rps.toFixed(4)} sub={`命中 ${pct(XG_NEXT.acc)} · 波膽 ${pct(XG_NEXT.scoreHit)}`} />
          <Stat label="最佳混合比例" value={`${Math.round(FB_XG.bestWeight.xg * 100)}% xG`} sub={`實際入球 ${Math.round(FB_XG.bestWeight.goals * 100)}%`} />
        </StatGrid>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <MeterBar
            label="xG 混合 對 現行實際入球"
            value="勝"
            tone="win"
            ratio={1}
            sub={`RPS ${XG_NOW.rps.toFixed(4)} → ${XG_NEXT.rps.toFixed(4)} · 命中 ${pct(XG_NOW.acc)} → ${pct(XG_NEXT.acc)}`}
          />
          <MeterBar
            label="xG 混合 對 市場去水線"
            value={XG_NEXT.rps.toFixed(4)}
            tone="win"
            ratio={1}
            sub={`市場線 ${FB_XG.marketLine.toFixed(4)} · 勝 ${(FB_XG.marketLine - XG_NEXT.rps).toFixed(4)}`}
          />
        </div>
        <div className="mt-2">
          <KVGrid
            rows={[
              { k: "驗證範圍", v: `${FB_XG.leagues} · ${FB_XG.span} · ${FB_XG.matches.toLocaleString()} 場（回測 ${FB_XG.backtested.toLocaleString()} 場）` },
              { k: "做法", v: "Dixon-Coles 訓練目標由「實際入球」改為「實際入球 × xG 混合」，其餘口徑不變" },
              { k: "上線狀態", v: "未上線：等已授權 xG 供應接通，模型改動已驗證好", tone: "lose" },
              { k: "合規落地條件", v: "接上已授權 xG 供應（FootyStats API ／ TheSports ／ Opta）即可即時開啟" },
            ]}
          />
        </div>
        <div className="mt-2">
          <Scroller>
            <Table head={["缺口", "採用源次序", "狀態", "處理原則"]}>
              {FB_SOURCES.map((s) => (
                <tr key={s.item} className="border-t border-hairline">
                  <Td>
                    <b className="text-ink">{s.item}</b>
                  </Td>
                  <Td>{s.source}</Td>
                  <Td>
                    <Pill tone="gold">{s.status}</Pill>
                  </Td>
                  <Td>{s.note}</Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          價值注要翻正，欠嘅正係呢三格資料。S7 回測八個方案全部蝕錢（最佳 −2.24%），抽水就係嗰堵牆；
          xG 已證實可以推低排序分數，先發陣容同傷停係開賽前最後一批未用資訊。三者未齊之前，我哋唔會宣稱價值注可行。
        </p>
      </Card>

      <Card title="S10 賽事節奏層：Elo 分差 vs 滾動平均，逐項驗過" en="Match Tempo">
        <p className="text-[10px] leading-relaxed text-ink-2">
          外界有講法話「Elo 分差係比賽行為統計嘅最強預測因子」。我哋用自建 Elo（逐場迭代、跨季回歸 25%、
          只用開賽前賽果）喺 {FB_TEMPO.leagues} 共 {FB_TEMPO.matches.toLocaleString()} 場（{FB_TEMPO.span}）
          逐項重做斯皮爾曼相關度，結論係：呢個講法對一半。
        </p>
        <div className="mt-2">
          <Scroller>
            <Table head={["項目", "樣本", "全局平均", "Elo 分差", "自身近十場滾動", "對手容許滾動", "主特徵"]}>
              {FB_TEMPO.stats.map((s) => (
                <tr key={s.key} className="border-t border-hairline">
                  <Td>
                    <b className="text-ink">{s.name}</b>
                  </Td>
                  <Td>{s.n.toLocaleString()}</Td>
                  <Td>{s.mean.toFixed(2)}</Td>
                  <Td>
                    <span className={s.driver === "elo" ? "font-bold text-gold" : "text-ink-3"}>
                      {s.rhoElo >= 0 ? "+" : "−"}
                      {Math.abs(s.rhoElo).toFixed(4)}
                    </span>
                  </Td>
                  <Td>
                    <span className={s.driver === "style" ? "font-bold text-gold" : "text-ink-3"}>
                      +{s.rhoOwnRoll.toFixed(4)}
                    </span>
                  </Td>
                  <Td>+{s.rhoOppConceded.toFixed(4)}</Td>
                  <Td>
                    <Pill tone={s.driver === "elo" ? "win" : "ink"}>
                      {s.driver === "elo" ? "Elo 分差" : "球隊風格滾動"}
                    </Pill>
                  </Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {FB_TEMPO.stats
            .filter((s) => s.driver === "elo")
            .map((s) => (
              <div key={s.key} className="rounded-[8px] border border-hairline bg-paper-2 px-2 py-2">
                <p className="mb-1 text-[10px] font-bold text-ink-2">
                  {s.name}：按 Elo 分差分檔嘅實際平均
                </p>
                {s.buckets.map((b) => (
                  <MeterBar
                    key={b.label}
                    label={b.label}
                    value={b.mean.toFixed(2)}
                    tone="gold"
                    ratio={Math.min(1, b.mean / (s.buckets[s.buckets.length - 1]!.mean || 1))}
                    sub={`${b.n.toLocaleString()} 場`}
                  />
                ))}
              </div>
            ))}
        </div>
        <div className="mt-2">
          <KVGrid
            rows={[
              {
                k: "射門／角球",
                v: "Elo 分差壓倒滾動平均（0.4302 對 0.2997；0.3111 對 0.1554）。實力差距越大，強嘅一邊射門由 8.45 升到 17.84、角球由 3.38 升到 7.22——滾動平均捉唔到，因為佢唔知嗰啲射門係對邊隊攞到",
                tone: "win",
              },
              {
                k: "犯規／牌數",
                v: "Elo 分差反而係負相關（−0.0973 同 −0.1496），滾動平均才最強（0.4976 同 0.2045）。合理：弱隊被壓住就要犯規截擊，所以呢兩項由球隊風格同球證主導",
                tone: "lose",
              },
              { k: "落地決定", v: "節奏層拆兩組特徵：射門／角球以 Elo 分差為主，犯規／牌數以風格滾動＋球證傾向為主，一律逐季前推驗證" },
              { k: "現時缺欄", v: FB_TEMPO.note, tone: "lose" },
            ]}
          />
        </div>
      </Card>

      <Card title="外部資料源對照（核對軌）" en="Source Cross-check">
        <p className="text-[10px] leading-relaxed text-ink-2">
          外部資料源逐個實測回應、robots.txt 立場、授權同實際覆蓋，然後先定用途：可排程嘅做主源，其餘只作交叉驗證。
        </p>
        <div className="mt-2">
          <Scroller>
            <Table head={["來源", "性質", "裁決", "理由"]}>
              {FB_AUDIT.map((a) => (
                <tr key={a.name} className="border-t border-hairline">
                  <Td>
                    <b className="text-ink">{a.name}</b>
                  </Td>
                  <Td>{a.kind}</Td>
                  <Td>
                    <Pill tone={a.verdict === "主源" ? "win" : "gold"}>
                      {a.verdict}
                    </Pill>
                  </Td>
                  <Td>{a.reason}</Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          核對軌有實際價值嘅係三樣——StatsBomb 開放資料做我哋自家 xG 嘅校準黃金樣本、
          datahub CSV 補返缺失嘅球證欄、reep 嘅 CC0 實體 ID 對照表做多源合併同名稱對照。
          外部一律只作啟發同交叉核對；模型、特徵、凍結機制同呈現全部自建。
        </p>
      </Card>

      <Card title="一場比賽由頭到尾" en="Pipeline">
        <Timeline items={STEPS} />
      </Card>

      <Card title="紅黃綠燈定義" en="Status Light">
        <div className="flex flex-col gap-1.5">
          {LIGHTS.map((l) => (
            <div key={l.name} className="flex items-start gap-2.5 rounded-[8px] border border-hairline bg-paper px-2.5 py-2">
              <span className="shrink-0">
                <Pill tone={l.tone}>{l.name}</Pill>
              </span>
              <p className="min-w-0 text-[10px] leading-relaxed text-ink-2">
                <b className="text-ink">{l.label}</b> · {l.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          官方首發陣容公布前一律黃燈——陣容係最影響賽果嘅賽前資訊，未有就唔標「最終」。
        </p>
      </Card>

      <Card title="集成權重（逐季，只用過去資料擬合）" en="Ensemble Weights">
        <Scroller>
          <Table head={["賽季", "場次", "天喜LGB", "入球模型", "天喜ELO", "校準器", "RPS ↓"]}>
            {FB_SEASONS.map((s) => (
              <tr key={s.season} className="border-t border-hairline">
                <Td className="font-bold text-ink">{s.season}</Td>
                <Td className="tabnum font-mono-tx">{s.n.toLocaleString()}</Td>
                <Td className="tabnum font-mono-tx">{s.alpha[0].toFixed(2)}</Td>
                <Td className="tabnum font-mono-tx">{s.alpha[1].toFixed(2)}</Td>
                <Td className="tabnum font-mono-tx">{s.alpha[2].toFixed(2)}</Td>
                <Td mono={false}>
                  <Pill tone={s.calib === "none" ? "ink" : "gold"}>{CALIB_LABEL[s.calib]}</Pill>
                </Td>
                <Td className="tabnum font-mono-tx">{s.rps.toFixed(4)}</Td>
              </tr>
            ))}
          </Table>
        </Scroller>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          權重浮動：天喜LGB 0.40–0.70、入球模型 0.05–0.40、天喜ELO 0.05–0.45。最新一季（{latest.season}）為{" "}
          {latest.alpha.map((a) => a.toFixed(2)).join(" / ")}，校準器 {CALIB_LABEL[latest.calib]}。
          每季權重同校準器只用該季之前兩季嘅季外預測擬合，測試季賽果從未參與。
        </p>
      </Card>

      <Card title="採用嘅特徵因子（54 項）" en="Features Used">
        <Scroller>
          <Table head={["組別", "內容", "項數"]}>
            {USED.map((u) => (
              <tr key={u.group} className="border-t border-hairline">
                <Td className="whitespace-normal font-bold text-ink">{u.group}</Td>
                <Td mono={false} className="whitespace-normal">
                  {u.items}
                </Td>
                <Td className="tabnum font-mono-tx">{u.n}</Td>
              </tr>
            ))}
          </Table>
        </Scroller>
        <div className="mt-2">
          <KVGrid
            rows={[
              { k: "共計", v: "54 項，全部賽前可計" },
              { k: "重訓頻率", v: "逐季一次，只用該季之前資料" },
              { k: "缺值處理", v: "少於 10 場向聯賽均值收縮" },
              { k: "賠率權重", v: "0（永不入模）", tone: "lose" },
            ]}
          />
        </div>
      </Card>

      <Card title="明確唔採用嘅因子" en="Rejected">
        <div className="flex flex-col gap-1.5">
          {REJECTED.map((r) => (
            <div key={r.name} className="rounded-[8px] border border-lose/25 bg-lose/5 px-2.5 py-2">
              <p className="font-serif-tc text-[12px] font-bold text-ink">{r.name}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-ink-2">{r.why}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="下一步（v1 目標）" en="Next">
        <p className="text-[11px] leading-relaxed text-ink-2">
          離市場去水線仲差 0.0051。要追靠三樣賽前資訊，唔會加賠率入模去偷：xG（源頭驗收中）、官方／預期首發陣容、傷停名單。
          三樣落地後陣容特徵可以上線，紅黃綠燈亦可以真正做到「陣容一公布就轉綠」。
        </p>
        <p className="mt-2">
          <Link
            to="/football/results"
            className="inline-flex items-center gap-1 rounded-[6px] border border-gold-strong/40 bg-gold-bg px-2.5 py-1.5 text-[11px] font-bold text-gold"
          >
            睇公開對帳（含未過關項目）→
          </Link>
        </p>
      </Card>

      <div className="px-4 pt-2">
        <Link to="/football/explain" className="font-mono-tx text-[11px] font-bold text-gold">凍結預測覆蓋解釋 →</Link>
      </div>
      <Disclaimer extra="本頁所有數字為歷史時序回測結果，不構成任何投注建議。" />
    </AppShell>
  );
}
