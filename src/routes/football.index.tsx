import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, ChartPie, Scale, ShieldCheck, Trophy, Workflow, type LucideIcon } from "lucide-react";

import { FootballNav } from "@/components/tx/FootballNav";
import { AppShell } from "@/components/tx/AppShell";
import { CompactFixtures, CompactLedger } from "@/components/tx/FootballHome";
import { Card, Disclaimer, PageHead, Pill, Scroller, Stat, StatGrid, Table, Td } from "@/components/tx/ui";

export const Route = createFileRoute("/football/")({
  head: () => ({
    meta: [
      { title: "天喜足球 TX-Football · 賽程、凍結預測與公開對帳 · 天喜 TIANXI" },
      {
        name: "description",
        content:
          "天喜足球：近期賽程凍結機率、預測 vs 賽果逐場對帳、238,854 場歷史基準線、賠率零權重鐵律，全部公開。",
      },
      { property: "og:title", content: "天喜足球 TX-Football" },
      { property: "og:description", content: "可驗證嘅足球賽前預測，賽前凍結、公開對帳。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FootballPage,
});

const STAGES: { id: string; name: string; desc: string; state: "done" | "now" | "todo" }[] = [
  {
    id: "S0",
    name: "數據地基",
    desc: "三個專屬倉庫、歷史庫、自建每日採集器（官方源頭直落：22 個聯賽賽果 + 未來一週賽程，每 6 小時一次，附自檢同異常告警）、名稱對照表（港式馬會譯名優先）。",
    state: "done",
  },
  {
    id: "S1",
    name: "基準線快照",
    desc: "238,854 場全量歷史落三條基準線，作為之後所有模型嘅及格線。",
    state: "done",
  },
  {
    id: "S2",
    name: "天喜足球ELO",
    desc: "Elo ＋ pi-rating 主客獨立評分，逐場迭代、跨季回歸，唔准全歷史重擬合。第一閘已通過。",
    state: "done",
  },
  {
    id: "S3",
    name: "泊松／Dixon-Coles 入球模型",
    desc: "攻防係數逐場迭代出 λ，一個比分機率矩陣派生全部盤口，保證互相一致。主客和已過閘（RPS 0.2149）。",
    state: "done",
  },
  {
    id: "S4",
    name: "天喜LGB 足球版",
    desc: "54 項賽前特徵（Elo、入球模型 λ、近十場滾動、休息日、對賽），逐季重訓時序前推 14.99 萬場。RPS 0.2105、命中率 48.66%、校準誤差 1.36%，三閘全過。",
    state: "done",
  },
  {
    id: "S5",
    name: "集成＋校準",
    desc: "Elo／入球模型／LGB 三軌對數空間加權，再過向量標度／保序校準；權重同校準器只用測試季之前資料擬合。RPS 0.2098、命中率 49.04%、校準誤差 0.30%，三閘全過。",
    state: "done",
  },
  {
    id: "S6",
    name: "預測頁＋公開對帳",
    desc: "同賽馬同一規矩：賽前凍結、紅黃綠燈、全部歷史預測公開。",
    state: "now",
  },
];

const BASELINES: { name: string; note: string; rps: string; logloss: string; acc: string; tone: "ink" | "gold" | "win" }[] = [
  { name: "盲猜（三項各⅓）", note: "地板線", rps: "0.2247", logloss: "1.0986", acc: "44.57%", tone: "ink" },
  { name: "歷史頻率（只用賽前資料）", note: "第一閘", rps: "0.2261", logloss: "1.0699", acc: "44.52%", tone: "ink" },
  { name: "天喜足球ELO（S2，已過閘）", note: "主客獨立評分＋跨季回歸", rps: "0.2144", logloss: "1.0373", acc: "47.90%", tone: "gold" },
  { name: "入球模型 Dixon-Coles（S3，已過閘）", note: "比分矩陣派生全部盤口", rps: "0.2149", logloss: "1.0367", acc: "47.42%", tone: "gold" },
  { name: "天喜足球LGB（S4，已過閘）", note: "54 項賽前特徵＋逐季重訓", rps: "0.2105", logloss: "1.0242", acc: "48.66%", tone: "gold" },
  { name: "三軌集成＋校準（S5，已過閘）", note: "現行最佳，校準誤差 0.30%", rps: "0.2098", logloss: "1.0203", acc: "49.04%", tone: "gold" },
  { name: "市場賠率去水（僅對照）", note: "最終逼近目標，永不入模", rps: "0.2047", logloss: "1.0056", acc: "50.10%", tone: "win" },
];

const RULES: { title: string; body: string }[] = [
  {
    title: "賠率零權重",
    body: "賠率永遠唔入模型主軌。佢只做三件事：對照基準線、價值注判斷、殘差診斷。訓練用終盤再同終盤比係自欺，一律同一凍結點對照。",
  },
  {
    title: "賽前凍結＋公開對帳",
    body: "開賽前鎖定預測並保存版本指紋，賽後用官方賽果逐場對帳，全部歷史預測公開——中幾多、錯幾多，唔會淨係貼中咗嘅截圖。",
  },
  {
    title: "時序驗證，唔准抽籤",
    body: "回測一律按時間前推（walk-forward），禁用隨機切分；特徵只准用開賽前已存在嘅資料，賽後先出現嘅統計永不入模。",
  },
  {
    title: "港式名稱",
    body: "球隊同球員顯示名以香港賽馬會官方譯名為準，對照表公開，撞唔到嘅會標「待審」而唔會亂譯。",
  },
];

const SOURCES: { name: string; role: string; license: string; tone: "win" | "gold" | "lose" }[] = [
  { name: "football-data.co.uk", role: "賽果＋開／收盤賠率主源（1993 至今）", license: "免費，商業用前要書面確認", tone: "gold" },
  { name: "xgabora 開放數據集", role: "啟動基線＋交叉核對（238,854 場）", license: "MIT，但上游非商業條款要處理", tone: "gold" },
  { name: "Open-Meteo 歷史天氣", role: "場地逐小時天氣，可即時回測", license: "免費", tone: "win" },
  { name: "michill 世界盃交鋒", role: "國際賽 H2H（7,503 場）", license: "公有領域", tone: "win" },
  { name: "FootyStats API", role: "候選 xG 主源（驗收中）", license: "第二順位採購", tone: "gold" },
  { name: "付費網站輸出（任何）", role: "不爬取——繞過授權，法律風險", license: "永不採用", tone: "lose" },
];

const LINKS: { to: string; icon: LucideIcon; title: string; sub: string; primary?: boolean }[] = [
  { to: "/football/prediction-vs-result", icon: Scale, title: "預測 vs 賽果", sub: "逐場凍結對帳", primary: true },
  { to: "/football/results", icon: ShieldCheck, title: "公開對帳", sub: "RPS 0.2098 · 校準 0.30%", primary: true },
  { to: "/football/fixtures", icon: CalendarClock, title: "賽前預測", sub: "逐場凍結機率" },
  { to: "/football/standings", icon: Trophy, title: "五大積分榜", sub: "附天喜足球ELO" },
  { to: "/football/engine", icon: Workflow, title: "引擎流程", sub: "凍結與紅黃綠燈" },
  { to: "/football/explain", icon: ChartPie, title: "覆蓋解釋", sub: "綠燈帳拆解" },
];

function FootballPage() {
  const doneN = STAGES.filter((s) => s.state === "done").length;
  return (
    <AppShell page="football" ticker="TX-Football v0 · S5 三軌集成＋校準過閘（RPS 0.2098 · 命中率 49.04% · 校準誤差 0.30%）· S6 預測頁＋公開對帳進行中">
      <PageHead
        en="TX-Football"
        title="天喜足球引擎"
        desc={<>可驗證、賽前凍結、公開對帳。每一步嘅數字都放喺呢頁，唔會攞個黑盒出嚟話「AI 九成中」。</>}
      />
      <FootballNav />

      <CompactFixtures />
      <CompactLedger />

      <Card title="公開對帳" en="Reconciliation">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`group flex min-w-0 items-center gap-2.5 rounded-[10px] border px-2.5 py-2.5 transition hover:-translate-y-px hover:shadow-md active:translate-y-0 ${
                l.primary ? "border-gold-strong/40 bg-gold-bg" : "border-hairline bg-paper hover:border-gold-strong/40"
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-[8px] ${
                  l.primary ? "bg-gold text-paper" : "bg-paper-2 text-ink-2"
                }`}
              >
                <l.icon size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-bold text-ink">{l.title}</span>
                <span className="block truncate text-[10px] text-ink-3">{l.sub}</span>
              </span>
              <span className="ml-auto text-ink-3 transition group-hover:translate-x-0.5">→</span>
            </Link>
          ))}
        </div>
      </Card>

      <Card
        title="而家去到邊"
        en="Roadmap"
        action={
          <span className="tabnum font-mono-tx text-[10px] font-bold text-ink-3">
            {doneN}/{STAGES.length} 完成
          </span>
        }
      >
        <div className="mb-3 flex gap-1">
          {STAGES.map((s) => (
            <span
              key={s.id}
              className={`h-1.5 flex-1 rounded-full ${
                s.state === "done" ? "bg-win" : s.state === "now" ? "animate-pulse bg-gold" : "bg-hairline"
              }`}
            />
          ))}
        </div>
        <ol className="relative ml-3 border-l border-hairline">
          {STAGES.map((s) => (
            <li key={s.id} className="relative pb-3 pl-5 last:pb-0">
              <span
                className={`absolute -left-[9px] top-0.5 grid h-[18px] w-[18px] place-items-center rounded-full border-2 text-[9px] font-bold ${
                  s.state === "done"
                    ? "border-win bg-win text-paper"
                    : s.state === "now"
                      ? "border-gold bg-gold-bg text-gold"
                      : "border-hairline bg-paper text-ink-3"
                }`}
              >
                {s.state === "done" ? "✓" : s.state === "now" ? "●" : ""}
              </span>
              <div
                className={`rounded-[10px] border px-2.5 py-2 ${
                  s.state === "now" ? "border-gold-strong/40 bg-gold-bg" : "border-hairline bg-paper"
                }`}
              >
                <p className="flex items-center gap-1.5">
                  <span className="font-mono-tx text-[10px] font-bold text-ink-3">{s.id}</span>
                  <span className="font-serif-tc text-[13px] font-bold leading-tight text-ink">{s.name}</span>
                  {s.state === "now" ? <Pill tone="gold">進行中</Pill> : null}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-ink-3">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>


      <Card title="基準線快照（S1，已凍結）" en="Baseline">
        <p className="mb-2 text-[11px] leading-relaxed text-ink-2">
          全量 <b>238,854 場</b>（2000 年至 2026 年 9 月，38 個聯賽）先落三條基準線。之後每個模型都要逐項跑贏「歷史頻率」先准上線，
          最終目標係逼近市場去水線。
        </p>
        <StatGrid cols={3}>
          <Stat label="歷史場次" value="238,854" sub="2000 → 2026-09" />
          <Stat label="聯賽" value="38" sub="歐洲主流＋國際賽" />
          <Stat label="快照日期" value="09-13" sub="凍結，只增不改" />
        </StatGrid>
        <div className="mt-2">
          <Scroller>
            <Table head={["基準", "RPS ↓", "Log-loss ↓", "命中率"]}>
              {BASELINES.map((b) => (
                <tr key={b.name} className="border-t border-hairline">
                  <Td className="whitespace-normal">
                    <span className="font-bold text-ink">{b.name}</span>
                    <span className="ml-1.5">
                      <Pill tone={b.tone}>{b.note}</Pill>
                    </span>
                  </Td>
                  <Td className="tabnum font-mono-tx">{b.rps}</Td>
                  <Td className="tabnum font-mono-tx">{b.logloss}</Td>
                  <Td className="tabnum font-mono-tx">{b.acc}</Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          有趣發現：盲猜嘅 RPS 略勝歷史頻率，因為 RPS 對「和局機率被推高」罰得重。所以我哋嘅閘門係 RPS 同
          log-loss 雙看，唔會俾單一指標誤導。和局佔實際賽果約 25%，但莊家只有 1.3% 場次將和局列為最可能結果——
          和局正係模型最有機會跑贏市場嘅位，對帳頁會設「和局召回率」做次要指標。
        </p>
        <p className="mt-2 rounded-[8px] border border-win/30 bg-win/5 px-2.5 py-2 text-[10px] leading-relaxed text-ink-2">
          <b className="text-win">S2 閘門結果：</b>
          天喜足球ELO（主客獨立評分、逐場迭代、跨季回歸七成、和局機率隨分差收窄）以時序前推喺全量 238,854
          場上跑出 RPS 0.2144、log-loss 1.0373、命中率 47.90%，三項全勝歷史頻率線，第一閘通過。
          參數穩健性實測：五組唔同參數（主場優勢 50–70 分、K 值 18–26、回歸 0.65–0.75）結果全部喺 ±0.001
          之內，唔係靠執參數。離市場去水線（0.2047／1.0056／50.10%）仲有距離，交俾 S3 入球模型同 S4 天喜LGB 追。
        </p>
        <p className="mt-2 rounded-[8px] border border-win/30 bg-win/5 px-2.5 py-2 text-[10px] leading-relaxed text-ink-2">
          <b className="text-win">S3 閘門結果：</b>
          在線 Dixon-Coles 入球模型（每隊攻擊／防守係數逐場梯度更新、主場優勢同逐聯賽平均入球率自動跟隨、跨季回歸八成）
          暖機 40 場後計分，時序前推實測 205,326 場：RPS 0.2149、log-loss 1.0367、命中率 47.42%，三項全勝歷史頻率線，過閘。
          價值唔止三項機率——每場出一個完整比分機率矩陣，主客和／大細／波膽全部由同一矩陣派生，機率永遠互相一致。
          誠實列未過關嘅：大細 2.5 log-loss 0.6918 僅僅贏基準率線 0.6930；
          <b>入球雙方（BTTS）0.6939 輸基準率線 0.6925，暫不上線</b>，等 S4 天喜LGB 補。
        </p>
        <p className="mt-2 rounded-[8px] border border-win/30 bg-win/5 px-2.5 py-2 text-[10px] leading-relaxed text-ink-2">
          <b className="text-win">S4 閘門結果：</b>
          天喜足球LGB 吃 54 項<b>賽前</b>特徵（自家 Elo、入球模型 λ 同比分矩陣機率、攻防係數、近十場滾動賽果／射門／角球／牌、主客場分開、休息日與 14 日密度、對賽往績、聯賽），
          每個賽季只用該季<b>之前</b>嘅資料重訓一次（逐季 walk-forward，禁用隨機抽籤），實測 2012–2026 共 149,890 場：
          RPS 0.2105、log-loss 1.0242、命中率 48.66%，同一批場次跑贏 S3 入球模型（0.2138／1.0322／48.39%），三閘全過；
          校準誤差 ECE 僅 1.36%，逐季 RPS 全部落喺 0.2086–0.2144 之間，冇單季崩盤。
          入球雙方（BTTS）由 0.6939 改善到 0.6903，終於贏基準率線 0.6925，<b>可以上線</b>；大細 2.5 亦升到 0.6840。
          兩樣照實講：和局召回率只有 2.9%（模型幾乎唔會把和局列為首選，同莊家同一結構性問題，S5 校準要專門處理）；
          離市場去水線（0.2047／1.0056／50.10%）仲差 0.0058，靠 S5 三軌集成再追。
        </p>
        <p className="mt-2 rounded-[8px] border border-win/30 bg-win/5 px-2.5 py-2 text-[10px] leading-relaxed text-ink-2">
          <b className="text-win">S5 閘門結果：</b>
          三軌集成（Elo／入球模型／天喜LGB 喺對數空間加權）＋校準（向量標度或逐類保序，兩者互比揀贏嘅）。
          權重同校準器<b>只用測試季之前兩季嘅季外預測</b>擬合，測試季賽果從未參與；賠率仍然零權重。
          同一批 149,890 場：RPS 0.2098、log-loss 1.0203、命中率 49.04%，三項全勝 S4（0.2105／1.0242／48.66%）、S3（0.2138）、S2（0.2117）。
          <b>校準誤差由 1.36% 降到 0.30%</b>——講幾成就真係幾成，價值注可以直接用呢個機率。逐季 RPS 0.2081–0.2133，最差係空場嘅 2020 季。
          兩樣照實講：和局召回率由 2.9% 跌到 0.3%（集成更尖銳，和局幾乎唔會做首選）；
          但和局機率<b>本身準</b>——講 27.5% 實際 27.6%、講 23.2% 實際 23.7%，所以和局改用「機率對賠率」嘅價值注玩法，
          召回率降為診斷指標，主指標改為和局分區可靠度。離市場去水線仲差 0.0051，要靠 xG、賽前陣容同傷停（v1）追，唔會加賠率入模去偷。
        </p>
      </Card>

      <Card title="四條鐵律" en="Ground Rules">
        <div className="grid gap-2 sm:grid-cols-2">
          {RULES.map((r) => (
            <div key={r.title} className="rounded-[8px] border border-hairline bg-paper px-2.5 py-2">
              <p className="font-serif-tc text-[12px] font-bold text-deep">{r.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-ink-2">{r.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="數據源同授權狀態" en="Data Sources">
        <Scroller>
          <Table head={["來源", "角色", "授權／狀態"]}>
            {SOURCES.map((s) => (
              <tr key={s.name} className="border-t border-hairline">
                <Td className="whitespace-normal font-bold text-ink">{s.name}</Td>
                <Td mono={false} className="whitespace-normal">
                  {s.role}
                </Td>
                <Td>
                  <Pill tone={s.tone}>{s.license}</Pill>
                </Td>
              </tr>
            ))}
          </Table>
        </Scroller>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          原則：唔爬付費網站嘅輸出、唔長期依賴第三方鏡射倉。所有採集由官方或開放源頭落地，每日自動更新，
          失敗時保留上一份有效資料（同賽馬「壞咗都照有貨」同一做法）。
        </p>
      </Card>

      <Disclaimer extra="足球預測引擎仍在興建階段，本頁所有數字為歷史回測基準，不構成任何投注建議。" />
    </AppShell>
  );
}
