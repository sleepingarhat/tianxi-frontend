import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { CrestScoreboard, FingerprintChip, ProbBars } from "@/components/tx/FootballMatchUI";
import { Card, Empty, ErrorNote, Loading, Pill, Seg, Stat, StatGrid } from "@/components/tx/ui";
import { useCrests } from "@/lib/footballCrests";
import { hkDateKey, hkDateTime, hkDayLabel } from "@/lib/hkTime";
import { type LiveResult, matchLive, rpsOf } from "@/lib/footballLiveResults";
import { dualPick } from "@/lib/footballDualEngine";
import { teamZh } from "@/lib/teamZh";

/** 比分字串 → 賽果分區 */
function resOfScore(score: string): "home" | "draw" | "away" {
  const [h, a] = score.split("-").map(Number);
  const hh = h ?? 0;
  const aa = a ?? 0;
  return hh > aa ? "home" : hh === aa ? "draw" : "away";
}

/** S13 逐場凍結帳：一場一條，鎖後預測欄永不改；完場只 join 賽果，禁止用最新模型重打。 */

type Agg = {
  n: number;
  rps_avg: number;
  argmax_hit_rate: number;
  ece: number;
  cs_top1: number;
  cs_top3: number;
  cs_top8: number;
  cs_logloss?: number | null;
  fingerprints: string[];
} | null;

type HitRate = {
  generated_at: string;
  scope: { big5: string[]; green_status: string[]; note: string };
  baselines: { prior_asof: number; market_devig: number; s5_backtest: number };
  green: Agg;
  diagnostic_big5_all_lights: Agg;
  diagnostic_all_leagues: Agg;
  unmatched_count: number;
};

type CsCell = { score: string; p: number; res?: string };

type LogRec = {
  match_key: string;
  div: string;
  league_zh?: string;
  home: string;
  away: string;
  kickoff_utc?: string;
  locked_at?: string | null;
  status?: string;
  track?: string;
  fingerprint?: string;
  p?: number[];
  lambda?: number[];
  cs?: { top8?: CsCell[]; exp?: number[] };
  result?: {
    ft_h: number;
    ft_a: number;
    ftr: string;
    rps?: number;
    argmax_hit?: number;
    p_actual?: number;
    cs_rank?: number | null;
  } | null;
  /** 賽果由即時源先行結算（上游週批檔未出），純展示層標記 */
  live_source?: string;
};

type LogFile = { matches: Record<string, LogRec> };

/** 用即時源賽果為一條未結算凍結列補上結算欄位；凍結機率、λ、矩陣、指紋一律照抄唔改 */
function settleWithLive(r: LogRec, m: LiveResult): LogRec {
  const p = r.p ?? [];
  const score = `${m.ft_h}-${m.ft_a}`;
  const top8 = r.cs?.top8 ?? [];
  const idx = top8.findIndex((c) => c.score === score);
  const actualIdx = { home: 0, draw: 1, away: 2 }[m.ftr];
  const three = p.length === 3;
  return {
    ...r,
    live_source: m.source,
    result: {
      ft_h: m.ft_h,
      ft_a: m.ft_a,
      ftr: m.ftr,
      ...(three ? { rps: rpsOf([p[0]!, p[1]!, p[2]!], m.ftr) } : {}),
      ...(three ? { p_actual: p[actualIdx]! } : {}),
      cs_rank: idx >= 0 ? idx + 1 : null,
    },
  };
}

const pc = (v: number | undefined, d = 1) => (v == null ? "—" : `${(v * 100).toFixed(d)}%`);
const RES_ZH: Record<string, string> = { home: "主勝", draw: "和局", away: "客勝" };
const BIG5 = ["E0", "D1", "SP1", "I1", "F1"];
const isGreen = (r: LogRec) => r.status !== "fallback" && !!r.locked_at;

/**
 * 同一張卡四個狀態：未開賽 → 進行中（唔顯示即時比分）→ 待賽果入帳（開賽逾 3 小時仍未 join 到
 * 90 分鐘賽果，即上游賽果檔未更新）→ 已結算。凍結預測一律唔改寫。
 */
type Phase = "upcoming" | "live" | "awaiting" | "done";
/** 一場 90 分鐘＋補時＋半場，3 小時後仍無賽果即當上游未更新 */
const SETTLE_GRACE_MS = 3 * 60 * 60 * 1000;
function phaseOf(r: LogRec): Phase {
  if (r.result) return "done";
  const ko = r.kickoff_utc ? Date.parse(r.kickoff_utc) : NaN;
  if (!Number.isFinite(ko)) return "upcoming";
  const now = Date.now();
  if (now >= ko + SETTLE_GRACE_MS) return "awaiting";
  if (now >= ko) return "live";
  return "upcoming";
}
/** 全站一律香港時間（UTC+8） */
const hkTime = (iso?: string) => hkDateTime(iso);

function monthKey(offset = 0) {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + offset);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function readJson<T>(query: string): Promise<T> {
  const res = await fetch(`/api/public/football-predictions?${query}`);
  if (!res.ok) throw new Error(`載入失敗 ${res.status}`);
  return (await res.json()) as T;
}

/** 一場一卡：左邊凍結預測（已鎖），右邊 90 分鐘賽果，同一張矩陣出 1X2 同波膽。 */
function MatchCard({ r, crestOf }: { r: LogRec; crestOf: (div: string, team: string) => string | null | undefined }) {
  const res = r.result ?? null;
  const phase = phaseOf(r);
  const p = r.p ?? [];
  const green = isGreen(r);
  const inLedger = green && BIG5.includes(r.div);
  const actualIdx = res ? ({ home: 0, draw: 1, away: 2 }[res.ftr] ?? -1) : -1;
  const exp = r.cs?.exp ?? r.lambda ?? [];
  const dp = dualPick(p, exp);
  const predIdx = dp.idx;
  const actualScore = res ? `${res.ft_h}-${res.ft_a}` : "";
  const top8 = r.cs?.top8 ?? [];
  const hitCell = top8.find((c) => c.score === actualScore);
  const topCell = top8[0] ?? null;
  const modeHit = !!res && !!topCell && topCell.score === actualScore;
  const phasePill =
    phase === "done"
      ? { tone: "gold" as const, label: r.live_source ? "已結算 · 即時源" : "已結算" }
      : phase === "awaiting"
        ? { tone: "ink" as const, label: "待賽果入帳" }
        : phase === "live"
          ? { tone: "gold" as const, label: "進行中 · 預測已鎖定" }
          : { tone: "ink" as const, label: `未開賽 · ${hkTime(r.kickoff_utc)}（港）` };

  const hit1x2 = res && predIdx >= 0 ? predIdx === actualIdx : null;
  return (
    <article className="rounded-[10px] border border-hairline bg-paper px-2.5 py-2.5">
      {/* 計分板：與「賽前預測」「球隊頁」共用同一排版 */}
      <CrestScoreboard
        rows={[
          { name: teamZh(r.div, r.home), crest: crestOf(r.div, r.home) ?? null, value: res ? res.ft_h : "–" },
          { name: teamZh(r.div, r.away), crest: crestOf(r.div, r.away) ?? null, value: res ? res.ft_a : "–" },
        ]}
        badge={
          <span
            className={`w-[4.25rem] rounded-[6px] px-1 py-1.5 text-center text-[11px] font-bold ${
              hit1x2 == null ? "bg-hairline/50 text-ink-3" : hit1x2 ? "bg-win/15 text-win" : "bg-hairline/60 text-ink-3"
            }`}
          >
            {hit1x2 == null ? "未結算" : hit1x2 ? "● 中" : "○ 未中"}
          </span>
        }
      />

      <header className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <Pill tone="ink">{r.league_zh ?? r.div}</Pill>
        <Pill tone={green ? "win" : "lose"}>{green ? "綠燈 · 已鎖" : "紅燈 · 熱身不足"}</Pill>
        <Pill tone={phasePill.tone}>{phasePill.label}</Pill>
        {inLedger ? null : <Pill tone="ink">唔入戰績</Pill>}
      </header>

      <div className="mt-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
        {/* 左：凍結預測 */}
        <div className="min-w-0 rounded-[8px] border border-hairline bg-paper-2 px-2 py-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">
            凍結預測（開波前已鎖）
          </p>
          <div className="mt-1.5">
            <ProbBars p={p} mark={actualIdx} tone="win" digits={0} showDot />
          </div>

          {predIdx >= 0 ? (
            <div className="mt-2 rounded-[7px] border border-hairline bg-paper px-2 py-1.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">
                {dp.isDual ? "雙引擎預測（dual-v1）" : "預測（缺 λ · 凍結三格最高）"}
              </p>
              <p className="mt-0.5 font-serif-tc text-[20px] font-bold leading-none text-deep">
                {RES_ZH[["home", "draw", "away"][predIdx]!]}
                <span className="tabnum ml-1.5 font-mono-tx text-[10px] font-normal text-ink-2">
                  {pc(dp.pf[predIdx] ?? 0, 1)}
                </span>
                {res ? (
                  <span className={`ml-1.5 text-[11px] ${predIdx === actualIdx ? "text-win" : "text-ink-3"}`}>
                    {predIdx === actualIdx ? "● 中" : "○ 唔中"}
                  </span>
                ) : null}
              </p>
              <p className="tabnum mt-1 font-mono-tx text-[9px] text-ink-3">
                主客機率距離 {pc(Math.abs((p[0] ?? 0) - (p[2] ?? 0)), 1)}
                {exp.length === 2 ? `｜預期入球 ${exp[0]!.toFixed(2)}–${exp[1]!.toFixed(2)}` : ""}
              </p>
              {top8.length > 0 ? (
                <details className="mt-1.5">
                  <summary className="cursor-pointer text-[9px] font-bold text-ink-3">
                    展開波膽格（只作診斷，對帳與訓練一律用全格）
                  </summary>
                  <p className="tabnum mt-1 font-mono-tx text-[10px] text-ink-2">
                    最高格 {topCell ? topCell.score.replace("-", ":") : "—"}
                    {topCell ? `（${pc(topCell.p, 1)}）` : ""}
                    {res ? (modeHit ? " · 眾數中" : " · 眾數唔中") : ""}
                  </p>
                  <ul className="mt-1 grid grid-cols-4 gap-1">
                    {top8.map((c) => (
                      <li
                        key={c.score}
                        className={`rounded-[5px] border px-1 py-1 text-center ${
                          c.score === actualScore
                            ? "border-win/60 bg-win/10"
                            : "border-hairline bg-paper-2"
                        }`}
                      >
                        <p className="tabnum font-mono-tx text-[10px] font-bold text-ink">
                          {c.score.replace("-", ":")}
                        </p>
                        <p className="tabnum font-mono-tx text-[9px] text-ink-3">{pc(c.p, 1)}</p>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              <p className="mt-1.5 text-[9px] leading-relaxed text-ink-3">
                主／和／客係同一張凍結矩陣加總（P_H、P_D、P_A），預測字取最高者；波膽只係同一張矩陣嘅單格，收起唔對外報。
              </p>
            </div>
          ) : null}
          <FingerprintChip values={[r.fingerprint]} label="指紋" note={`軌 ${r.track ?? "—"}`} />

        </div>

        {/* 右：90 分鐘賽果（未完場只顯示狀態，唔顯示即時比分） */}
        <div className="min-w-0 rounded-[8px] border border-hairline bg-paper-2 px-2 py-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">
            90 分鐘賽果（加時／點球另計）
          </p>
          {res ? (
            <>
              <p className="tabnum mt-1.5 font-mono-tx text-[20px] font-bold leading-none text-deep">
                {actualScore}
                <span className="ml-1.5 text-[10px] font-normal text-ink-2">{RES_ZH[res.ftr]}</span>
              </p>
              <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono-tx text-[10px]">
                <span className="text-ink-3">本場 RPS ↓</span>
                <span className="tabnum text-right text-ink">{res.rps?.toFixed(4) ?? "—"}</span>
                <span className="text-ink-3">賽果落咗幾多機率</span>
                <span className="tabnum text-right text-ink">{pc(res.p_actual, 1)}</span>
                <span className="text-ink-3">波膽第幾格</span>
                <span className="tabnum text-right text-ink">
                  {res.cs_rank ? `第 ${res.cs_rank} 格` : "跌出頭八格"}
                </span>
                <span className="text-ink-3">該格凍結機率</span>
                <span className="tabnum text-right text-ink">{hitCell ? pc(hitCell.p, 1) : "—"}</span>
              </div>
              <p className="mt-1.5">
                <Pill tone={res.cs_rank ? "win" : "ink"}>
                  {res.cs_rank ? `頭八格內中（第 ${res.cs_rank}）` : "頭八格外"}
                </Pill>
              </p>
              {r.live_source ? (
                <p className="mt-1 text-[9px] leading-relaxed text-ink-3">
                  即時賽果源（{r.live_source}）90 分鐘完場比分先行結算；週批官方檔到齊後會覆核一次，
                  凍結預測欄唔會因此改寫。
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="mt-1.5 font-serif-tc text-[15px] font-bold leading-tight text-ink-2">
                {phase === "awaiting"
                  ? "待賽果入帳"
                  : phase === "live"
                    ? "進行中 · 預測已鎖定"
                    : "未開賽"}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-ink-3">
                {phase === "awaiting"
                  ? "已完場，但即時賽果源同週批官方檔都仲未出呢場嘅 90 分鐘比分，所以未入帳。比分一到就自動結算（通常完場一小時內）；凍結預測唔會因為遲入帳而改寫，亦唔會補算。"
                  : phase === "live"
                    ? "比賽進行期間唔顯示即時比分：對帳單位係 90 分鐘完場賽果，凍結機率永遠唔會賽中更新。完場並結算後，呢張卡會自動轉「已結算」。"
                    : `開賽時間 ${hkTime(r.kickoff_utc)}（香港）。${
                        r.locked_at ? "已鎖定，開賽前 6 小時定案。" : "開賽前 6 小時鎖定，鎖定前預測發布中。"
                      }`}
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function FootballLedger() {
  const [day, setDay] = useState("all");
  const [lg, setLg] = useState("big5");
  const [ph, setPh] = useState<Phase | "all">("all");

  const hit = useQuery<HitRate>({
    queryKey: ["footballHitRate"],
    queryFn: () => readJson<HitRate>("file=hit_rate"),
    staleTime: 300_000,
  });

  const months = [monthKey(0), monthKey(-1)];
  const log = useQuery<LogRec[]>({
    queryKey: ["footballLedger", months.join(",")],
    queryFn: async () => {
      const [files, upcoming] = await Promise.all([
        Promise.all(
          months.map(async (m) => {
            try {
              return await readJson<LogFile>(`file=log&month=${m}`);
            } catch {
              return { matches: {} } as LogFile;
            }
          }),
        ),
        readJson<{ matches: any[] }>("file=predictions"),
      ]);
      const logs = files.flatMap((f) => Object.values(f.matches ?? {}) as LogRec[]);
      const up = (upcoming.matches ?? []).map((m) => ({
        ...m,
        status: "ok",
        locked_at: m.locked ? m.kickoff_utc : null,
      }));
      const keys = new Set(logs.map((l) => l.match_key));
      return [...logs, ...up.filter((u) => !keys.has(u.match_key))];
    },
    staleTime: 300_000,
  });

  // 即時賽果專用通道：完場一小時內就有官方 90 分鐘比分，唔需要等週批 CSV
  const liveRes = useQuery<{ matches?: LiveResult[] }>({
    queryKey: ["footballLiveResults"],
    queryFn: async () => {
      const res = await fetch("/api/public/football-live-results");
      if (!res.ok) throw new Error(`載入失敗 ${res.status}`);
      return (await res.json()) as { matches?: LiveResult[] };
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
    retry: 1,
  });

  const all = useMemo(() => {
    const pool = liveRes.data?.matches ?? [];
    return (log.data ?? [])
      .map((r) => {
        if (r.result || !pool.length) return r;
        const m = matchLive(r, pool);
        return m ? settleWithLive(r, m) : r;
      })
      .sort((a, b) => (b.kickoff_utc ?? "").localeCompare(a.kickoff_utc ?? ""));
  }, [log.data, liveRes.data]);
  const done = useMemo(() => all.filter((r) => r.result), [all]);
  const live = useMemo(() => all.filter((r) => phaseOf(r) === "live"), [all]);
  const awaiting = useMemo(() => all.filter((r) => phaseOf(r) === "awaiting"), [all]);
  const liveSettled = useMemo(() => all.filter((r) => r.live_source).length, [all]);
  const pending = all.filter((r) => !r.result);
  const lockedCount = all.filter((r) => r.locked_at).length;

  // 日期一律用香港日曆日（UTC+8）分組，歐洲深夜場唔會錯歸前一日
  const days = useMemo(
    () => Array.from(new Set(all.map((r) => hkDateKey(r.kickoff_utc)).filter(Boolean))),
    [all],
  );
  const leagues = useMemo(() => {
    const m = new Map<string, string>();
    all.forEach((r) => m.set(r.div, r.league_zh ?? r.div));
    return Array.from(m, ([value, label]) => ({ value, label }));
  }, [all]);

  const crestOf = useCrests(Array.from(new Set(all.map((r) => r.div))));
  const shown = all.filter(
    (r) =>
      (day === "all" || hkDateKey(r.kickoff_utc) === day) &&
      (lg === "all" ? true : lg === "big5" ? BIG5.includes(r.div) : r.div === lg) &&
      (ph === "all" || phaseOf(r) === ph),
  );

  const green = hit.data?.green ?? null;
  const diag = hit.data?.diagnostic_big5_all_lights ?? null;

  return (
    <>
      <Card title="逐場凍結帳（S13）" en="Frozen Ledger">
        {hit.isLoading ? (
          <Loading label="讀取凍結帳" />
        ) : hit.error ? (
          <ErrorNote error={hit.error} />
        ) : (
          <>
            <StatGrid cols={3}>
              <Stat
                label="平均 RPS ↓（入帳場次）"
                value={green ? green.rps_avg.toFixed(4) : "未開帳"}
                sub={`基準 ${hit.data?.baselines.prior_asof ?? 0.2261}／市場去水 ${
                  hit.data?.baselines.market_devig ?? 0.2047
                }`}
              />
              <Stat
                label="1X2 校準"
                value={green ? pc(green.ece, 2) : "未開帳"}
                sub="模型講幾成，實際幾成"
              />
              <Stat
                label="入帳樣本"
                value={green ? green.n.toLocaleString() : "0"}
                sub={
                  <span
                    className="block max-w-full overflow-x-auto whitespace-nowrap pb-0.5 [scrollbar-width:thin]"
                    title={green?.fingerprints?.join("、")}
                  >
                    {green?.fingerprints?.length ? `指紋 ${green.fingerprints.join("、")}` : "指紋：待綠燈"}
                  </span>
                }
              />
            </StatGrid>
            <details className="mt-2 rounded-[8px] border border-hairline bg-paper px-2.5 py-2">
              <summary className="cursor-pointer text-[10px] font-bold text-ink-2">
                波膽對帳（眾數命中率＋頭八格覆蓋＋實際格 log-loss，摺疊）
              </summary>
              <div className="mt-1.5 grid gap-1 font-mono-tx text-[10px] sm:grid-cols-2">
                <span className="text-ink-3">
                  眾數命中率（展示用）{" "}
                  <b className="tabnum text-ink">{green ? pc(green.cs_top1, 1) : "未開帳"}</b>
                </span>
                <span className="text-ink-3">
                  頭三格中 <b className="tabnum text-ink">{green ? pc(green.cs_top3, 1) : "未開帳"}</b>
                </span>
                <span className="text-ink-3">
                  頭八格中 <b className="tabnum text-ink">{green ? pc(green.cs_top8, 1) : "未開帳"}</b>
                </span>
                <span className="text-ink-3">
                  實際格 log-loss ↓{" "}
                  <b className="tabnum text-ink">
                    {green?.cs_logloss != null ? green.cs_logloss.toFixed(3) : "未開帳"}
                  </b>
                </span>
              </div>
              <p className="mt-1 text-[9px] leading-relaxed text-ink-3">
                眾數命中率（我哋出嗰個最可能比分中唔中）只作展示戰績，永遠唔會回寫落模型參數；調參一律睇全格
                機率——「實際格 log-loss」同「頭八格覆蓋」。實際比分跌出頭八格時，以頭八格最細機率一半作罰分底。
              </p>
            </details>
            <p className="mt-2 text-[10px] leading-relaxed text-ink-2">
              入帳範圍：五大聯賽（{(hit.data?.scope.big5 ?? []).join("、")}）、綠燈且已鎖場次。逐場鎖定＝
              <b className="text-deep">開賽前 6 小時</b>；綠燈＝已鎖命中、紅燈＝未中或退回基準軌，鎖定前只標「預測發布中」。已鎖場次
              <b className="text-deep">永遠跟當時指紋</b>，重訓只影響之後未鎖場次，新模型想改已鎖場只會寫入審計並被拒。
              每日凍結軌已接入 S5 三軌集成（S4 天喜足球LGB ＋ S3 入球模型 ＋ S2 天喜足球ELO），過三項閘門先算綠燈。
              權重唔係固定常數：當季約 LGB 0.65、入球模型 0.10、天喜ELO 0.25，每季用過去兩季季外預測重擬合；
              熱身場數不足嘅場次維持紅燈基準軌，只作診斷。上面三格要等綠燈場次有咗完場賽果才會出實數，
              喺此之前一律寫「未開帳」，唔會借回測數字充當實戰成績。
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <Stat label="帳內場次" value={(log.data?.length ?? 0).toLocaleString()} sub={`已鎖 ${lockedCount}`} />
              <Stat
                label="已完場對帳"
                value={done.length.toLocaleString()}
                sub={`即時源 ${liveSettled}｜待入帳 ${awaiting.length}｜進行中 ${live.length}｜未開賽 ${
                  pending.length - live.length - awaiting.length
                }`}
              />
              <Stat
                label="診斷軌 RPS（紅燈五大）"
                value={diag ? diag.rps_avg.toFixed(4) : "—"}
                sub={diag ? `${diag.n} 場 · 首選中 ${pc(diag.argmax_hit_rate)}` : "尚無完場樣本"}
              />
            </div>
          </>
        )}
      </Card>

      <Card title="預測 vs 賽果（只讀凍結列）" en="Prediction vs Result">
        {log.isLoading ? (
          <Loading label="讀取逐場對帳" />
        ) : log.error ? (
          <ErrorNote error={log.error} />
        ) : all.length === 0 ? (
          <Empty label="帳內尚無場次（凍結器每日跑，賽程入庫後補）" />
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">聯賽</span>
                  <select
                    value={lg}
                    onChange={(e) => setLg(e.target.value)}
                    className="min-w-0 rounded-[8px] border border-hairline bg-paper px-2 py-2 text-[12px] font-bold text-ink"
                  >
                    <option value="big5">五大聯賽</option>
                    <option value="all">全部聯賽</option>
                    {leagues.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">日期（港）</span>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="min-w-0 rounded-[8px] border border-hairline bg-paper px-2 py-2 text-[12px] font-bold text-ink"
                  >
                    <option value="all">全部日期</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {hkDayLabel(d)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="flex items-center justify-between text-[10px] text-ink-3">
                <span>
                  符合 <b className="tabnum text-ink">{shown.length}</b> 場
                  {shown.length > 40 ? "（顯示頭 40 場）" : ""}
                </span>
                {lg !== "big5" || day !== "all" || ph !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLg("big5");
                      setDay("all");
                      setPh("all");
                    }}
                    className="font-bold text-gold hover:underline"
                  >
                    重設篩選
                  </button>
                ) : null}
              </p>
              <Seg
                value={ph}
                onChange={setPh}
                options={[
                  { value: "all" as const, label: "全部狀態" },
                  { value: "done" as const, label: `已結算 ${done.length}` },
                  { value: "awaiting" as const, label: `待賽果入帳 ${awaiting.length}` },
                  { value: "live" as const, label: `進行中 ${live.length}` },
                  {
                    value: "upcoming" as const,
                    label: `未開賽 ${pending.length - live.length - awaiting.length}`,
                  },
                ]}
              />
            </div>
            {shown.length === 0 ? (
              <div className="mt-2">
                <Empty label="呢個篩選冇場次" />
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {shown.slice(0, 40).map((r) => (
                  <MatchCard key={r.match_key} r={r} crestOf={crestOf} />
                ))}
              </div>
            )}
          </>
        )}
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          呢張帳只 join 凍結列，唔會用最新模型重打已完場；差預測同虧損期一律不刪不改。主數字係賽果落咗幾多機率
          同該場 RPS，首選中唔中只係次指標；波膽大字出一個最可能比分並標眾數中唔中，但對帳同調參一律用全格
          （實際格排第幾、實際格 log-loss），眾數命中率只讀、唔回寫參數。加時同點球另計，唔入
          90 分鐘對帳。紅燈（熱身不足）場次照顯示賽果但標「唔入戰績」，唔會同綠燈場合併計數。市場去水賠率只作診斷對照，
          永不入模（market_beta = 0）。同一張卡由「未開賽」→「進行中 · 預測已鎖定」→「已結算」，賽事進行期間唔顯示即時
          比分，亦唔會預先畫 ✓。
        </p>
      </Card>
    </>
  );
}
