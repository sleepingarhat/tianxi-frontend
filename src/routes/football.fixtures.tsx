import { useQuery } from "@tanstack/react-query";
import { useCrests } from "@/lib/footballCrests";
import { hkDateKey, hkDateTime, hkDayLabel } from "@/lib/hkTime";
import { argmaxSide } from "@/lib/footballTeams";
import { DUAL_ENGINE, dualEngine, OUTCOME_LABEL, OUTCOMES } from "@/lib/footballDualEngine";
import { teamZh } from "@/lib/teamZh";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { FootballNav } from "@/components/tx/FootballNav";
import { FootballLiveBoard } from "@/components/tx/FootballLiveBoard";
import { AppShell } from "@/components/tx/AppShell";
import { CrestScoreboard, FingerprintChip, ProbBars } from "@/components/tx/FootballMatchUI";
import { Card, Disclaimer, PageHead, Pill, Stat, StatGrid } from "@/components/tx/ui";
import { TxBar } from "@/components/tx/viz";

export const Route = createFileRoute("/football/fixtures")({
  head: () => ({
    meta: [
      { title: "足球賽前預測 · 凍結機率與版本指紋 · 天喜 TIANXI" },
      {
        name: "description",
        content:
          "天喜足球逐場賽前凍結預測：主客和機率、預期入球、每場一個最可能波膽（附四球以上合計機率）、大細與兩隊入球，附三軌引擎口徑同市場去水對照，賠率零權重。",
      },
      { property: "og:title", content: "足球賽前預測 · 天喜 TIANXI" },
      { property: "og:description", content: "逐場機率賽前凍結，附版本指紋，賽後全部公開對帳。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FootballFixturesPage,
});

type Match = {
  match_key: string;
  div: string;
  league_zh: string;
  home: string;
  away: string;
  kickoff_utc: string;
  time_uk: string;
  track: string;
  status: string;
  locked: boolean;
  p: [number, number, number];
  p_dc?: [number, number, number];
  p_elo?: [number, number, number];
  lambda: [number, number];
  over25: number;
  btts: number;
  top_score: { score: string; p: number };
  scores?: { score: string; p: number; res: "home" | "draw" | "away" }[];
  p_s5?: [number, number, number] | null;
  p_lgb?: [number, number, number] | null;
  s5_warm?: boolean;
  cs?: {
    top8: { score: string; p: number; res: "home" | "draw" | "away" }[];
    cond: Partial<Record<"home" | "draw" | "away", { score: string; p: number; p_cond: number }>>;
    exp: [number, number];
    tails: { win_by_3plus: number; home_4plus: number; away_clean_sheet: number };
  } | null;
  elo_diff: number;
  market: [number, number, number] | null;
  edge: [number, number, number] | null;
  warm: { home: number; away: number };
};

type Payload = {
  meta: {
    generated_at: string;
    engine: string;
    fingerprint: string;
    history_matches: number;
    history_last_date: string;
    fixtures_count: number;
    fixtures_stale: boolean;
    weights: { dc: number; elo: number };
    lock_minutes: number;
    status_note: string;
    s5?: {
      ready: boolean;
      reason: string | null;
      fingerprint: string | null;
      trained_at: string | null;
      alpha: { lgb: number; dc: number; elo: number } | null;
      gate: { passed: boolean; checks: Record<string, boolean>; best_single_track_rps: number } | null;
      backtest: { n: number; rps: number; logloss: number; acc: number; ece: number } | null;
      green_matches: number;
    } | null;
  };
  matches: Match[];
};

const p1 = (v: number) => `${(v * 100).toFixed(1)}%`;

const SIDE_ZH: Record<"home" | "draw" | "away", string> = { home: "主勝", draw: "和局", away: "客勝" };

/** 全站一律香港時間（UTC+8）：MM-DD HH:mm */
function hk(iso: string) {
  return hkDateTime(iso);
}

function kickoffMs(iso: string) {
  const t = Date.parse(iso.endsWith("Z") ? iso : `${iso.replace("+00:00", "")}Z`);
  return Number.isNaN(t) ? 0 : t;
}

/**
 * 比分矩陣以球隊實力為主：先由 λ 派生 0-0 至 8-8 格，
 * 再按三軌集成（Elo 實力 + 入球模型）嘅主／和／客機率，逐個賽果分區重新加權，
 * 令矩陣嘅主／和／客邊際等於引擎實力判斷，然後才揀最可能一格。
 */
function scoreTop(lambda: [number, number], p: [number, number, number]) {
  const RES: ("home" | "draw" | "away")[] = ["home", "draw", "away"];
  const MAX = 8;
  const pois = (lam: number, k: number) => {
    let f = 1;
    for (let i = 2; i <= k; i += 1) f *= i;
    return (Math.exp(-lam) * lam ** k) / f;
  };
  const hp = Array.from({ length: MAX + 1 }, (_, k) => pois(lambda[0], k));
  const ap = Array.from({ length: MAX + 1 }, (_, k) => pois(lambda[1], k));
  const resOf = (a: number, b: number) => (a > b ? 0 : a === b ? 1 : 2);

  // 原始（純入球平均）邊際
  const raw: [number, number, number] = [0, 0, 0];
  for (let a = 0; a <= MAX; a += 1) {
    for (let b = 0; b <= MAX; b += 1) raw[resOf(a, b)] += (hp[a] ?? 0) * (ap[b] ?? 0);
  }
  // 實力權重：把每個賽果分區縮放到集成機率
  const w = raw.map((r, i) => (r > 1e-9 ? (p[i] ?? r) / r : 1)) as [number, number, number];

  let bigP = 0;
  let total = 0;
  const cells: { a: number; b: number; pr: number }[] = [];
  for (let a = 0; a <= MAX; a += 1) {
    for (let b = 0; b <= MAX; b += 1) {
      const pr = (hp[a] ?? 0) * (ap[b] ?? 0) * (w[resOf(a, b)] ?? 1);
      total += pr;
      cells.push({ a, b, pr });
    }
  }
  // 每個賽果分區各自最可能一格：主選＝三區之中機率最高者，其餘兩區做備選
  const zoneBest: { score: string; p: number; res: "home" | "draw" | "away"; cond: number }[] = RES.map((res) => ({
    score: "—",
    p: 0,
    res,
    cond: 0,
  }));
  // 尾部桶同期望比分：一律由同一張重新加權矩陣派生，唔另開公式
  let egH = 0;
  let egA = 0;
  let winBy3 = 0;
  let h4plus = 0;
  let awayZero = 0;
  const norm: { score: string; p: number; res: "home" | "draw" | "away" }[] = [];
  for (const c of cells) {
    const pr = total > 0 ? c.pr / total : 0;
    if (c.a + c.b >= 4) bigP += pr;
    egH += pr * c.a;
    egA += pr * c.b;
    if (c.a - c.b >= 3) winBy3 += pr;
    if (c.a >= 4) h4plus += pr;
    if (c.b === 0) awayZero += pr;
    const zi = resOf(c.a, c.b);
    norm.push({ score: `${c.a}-${c.b}`, p: pr, res: RES[zi]! });
    const z = zoneBest[zi]!;
    if (pr > z.p) {
      z.score = `${c.a}-${c.b}`;
      z.p = pr;
    }
  }
  for (let i = 0; i < 3; i += 1) {
    const z = zoneBest[i]!;
    const zp = p[i] ?? 0;
    z.cond = zp > 1e-9 ? z.p / zp : 0; // 該賽果成立嘅前提下，呢個比分嘅機率
  }
  const top8 = [...norm].sort((a, b) => b.p - a.p).slice(0, 8);
  const sorted = [...zoneBest].sort((a, b) => b.p - a.p);
  const best = sorted[0]!;
  const alts = sorted.slice(1);
  return {
    ...best,
    bigP,
    zones: zoneBest,
    alts,
    top8,
    exp: [egH, egA] as [number, number],
    tails: { winBy3, h4plus, awayZero },
  };
}


function MatchCard({
  m,
  weights,
  crestOf,
  hkjc = false,
}: {
  m: Match;
  weights: { dc: number; elo: number };
  crestOf: (div: string, name: string) => string | null;
  hkjc?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const top = argmaxSide(m.p);
  const derived = useMemo(() => scoreTop(m.lambda, m.p), [m.lambda, m.p]);
  // 只讀凍結值：有凍結波膽（S5 分區重加權後嘅矩陣）就用凍結嗰張，冇才由 λ 同機率派生
  const csAll = useMemo(() => {
    const f = m.cs;
    if (!f) return derived;
    const RES: ("home" | "draw" | "away")[] = ["home", "draw", "away"];
    const zones = RES.map((res) => {
      const z = f.cond[res];
      return { score: z?.score ?? "—", p: z?.p ?? 0, res, cond: z?.p_cond ?? 0 };
    });
    const sorted = [...zones].sort((a, b) => b.p - a.p);
    return {
      ...sorted[0]!,
      bigP: f.top8.reduce((acc, c) => {
        const [a, b] = c.score.split("-").map(Number);
        return acc + ((a ?? 0) + (b ?? 0) >= 4 ? c.p : 0);
      }, 0),
      zones,
      alts: sorted.slice(1),
      top8: f.top8,
      exp: f.exp,
      tails: { winBy3: f.tails.win_by_3plus, h4plus: f.tails.home_4plus, awayZero: f.tails.away_clean_sheet },
    };
  }, [m.cs, derived]);
  // 波膽大字出全矩陣最可能一格，唔跟 1X2 傾向分區
  const cs = csAll.top8[0]
    ? { ...csAll.top8[0], bigP: csAll.bigP }
    : { score: "—", p: 0, res: "draw" as const, bigP: csAll.bigP };
  const edgeMax = m.edge ? Math.max(...m.edge) : null;
  const edgeIdx = m.edge ? m.edge.indexOf(Math.max(...m.edge)) : -1;
  const side = ["主勝", "和局", "客勝"];
  const eloRatio = Math.min(1, Math.abs(m.elo_diff) / 400);
  

  return (
    <article className="rounded-[10px] border border-hairline bg-paper px-2.5 py-2.5">
      {/* 計分板：隊徽＋隊名＋預期入球 λ 各自一直行（同「預測 vs 賽果」同一排版） */}
      <CrestScoreboard
        rows={[
          { name: teamZh(m.div, m.home), crest: crestOf(m.div, m.home), value: m.lambda[0].toFixed(2) },
          { name: teamZh(m.div, m.away), crest: crestOf(m.div, m.away), value: m.lambda[1].toFixed(2) },
        ]}
        valueWidth="2.1rem"
        valueClass="text-[12px] text-ink-2"
        badge={
          <span
            className={`w-[4.25rem] shrink-0 rounded-[6px] px-1 py-1.5 text-center text-[11px] font-bold ${
              m.status === "final" ? "bg-win/15 text-win" : "bg-hairline/60 text-ink-3"
            }`}
          >
            {m.status === "final"
              ? m.locked
                ? "綠燈 · 已鎖"
                : "綠燈 · 未鎖"
              : m.locked
                ? "紅燈 · 已鎖"
                : "紅燈 · 基準"}
          </span>
        }
      />
      <p className="mt-0.5 text-[9px] leading-tight text-ink-3">
        右欄數字＝預期入球 λ（同對帳頁計分板同一位置）
      </p>
      <header className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <Pill tone="ink">{m.league_zh}</Pill>
        <Pill tone="ink">開賽 {hk(m.kickoff_utc)}</Pill>
        {hkjc ? <Pill tone="win">馬會有盤</Pill> : null}
        <Pill tone={m.locked ? "win" : "lose"}>{m.locked ? "預測已鎖" : "預測發布中 · 開賽前 6 小時定案"}</Pill>
      </header>


      {/* 賽果預測：三條機率（主／和／客）齊列，最高者標金 */}
      <div className="mt-1.5 rounded-[8px] border border-gold-strong/40 bg-gold-bg px-2 py-1.5">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">
          主／和／客機率
        </p>
        <ProbBars p={m.p} mark={top} tone="gold" digits={1} />

        <p className="mt-1 text-[9px] leading-tight text-ink-3">
          和局歷史上只佔約四分一，三條凍結機率齊列（引擎 A）；正式預測以下面雙引擎為準。
        </p>
      </div>

      {/* 對外預測：天喜雙引擎 dual-v1（凍結三格＋和局引擎，加權投票） */}
      {(() => {
        const dual = dualEngine(m.p, m.lambda);
        return (
          <div className="mt-1.5 rounded-[8px] border border-hairline bg-paper-2 px-2.5 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-3">
              雙引擎預測 · {DUAL_ENGINE.version}
            </p>
            <p className="mt-0.5 font-serif-tc text-[20px] font-bold leading-none text-deep">
              {OUTCOME_LABEL[dual.pick]}
              <span className="tabnum ml-1.5 font-mono-tx text-[10px] font-normal text-ink-2">
                {p1(dual.pFinal[OUTCOMES.indexOf(dual.pick)] ?? 0)}
              </span>
            </p>
            <p className="mt-1 tabnum font-mono-tx text-[9px] leading-tight text-ink-3">
              和局：引擎 A {p1(m.p[1])} · 引擎 B {p1(dual.pBDraw)} · 混合 {p1(dual.pFinal[1])}
            </p>
          </div>
        );
      })()}


      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Pill tone="ink">
          預期入球 {m.lambda[0].toFixed(2)} ／ {m.lambda[1].toFixed(2)}
        </Pill>
        <Pill tone="ink">大細 2.5 · 大 {p1(m.over25)}</Pill>
        <Pill tone="ink">兩隊入球 {p1(m.btts)}</Pill>
        {edgeMax !== null ? (
          <Pill tone={edgeMax >= 0.05 ? "win" : "ink"}>
            價值差 {side[edgeIdx]} {edgeMax >= 0 ? "+" : "−"}
            {(Math.abs(edgeMax) * 100).toFixed(1)} 個百分點
          </Pill>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 w-full rounded-[7px] border border-hairline bg-paper-2 px-2 py-1.5 text-[10px] font-bold text-ink-2"
      >
        {open ? "收起引擎口徑 ▲" : "睇引擎口徑同特徵 ▼"}
      </button>

      {open ? (
        <div className="mt-2 space-y-2 rounded-[8px] border border-hairline bg-paper-2 px-2 py-2">
          <div>
            <p className="flex items-center justify-between text-[10px] font-bold text-ink-2">
              <span>Elo 分差（主場視角）</span>
              <span className="tabnum font-mono-tx text-ink">
                {m.elo_diff >= 0 ? "+" : "−"}
                {Math.abs(m.elo_diff).toFixed(1)}
              </span>
            </p>
            <span className="mt-1 block">
              <TxBar ratio={eloRatio} tone={m.elo_diff >= 0 ? "gold" : "ink"} height={5} />
            </span>
            <p className="mt-1 text-[9px] leading-relaxed text-ink-3">
              主客獨立評分，逐場迭代、跨季回歸，只用開賽前已完成嘅場次。
            </p>
          </div>

          <div className="rounded-[7px] border border-hairline bg-paper px-2 py-1.5">
            <p className="mb-1 flex items-center justify-between text-[10px] font-bold text-ink-2">
              <span>整張比分矩陣 · 頭八格</span>
              <span className="tabnum font-mono-tx text-ink">
                期望比分 {csAll.exp[0].toFixed(2)} : {csAll.exp[1].toFixed(2)}
              </span>
            </p>
            <ul className="grid grid-cols-4 gap-1">
              {csAll.top8.map((c) => (
                <li
                  key={c.score}
                  className={`rounded-[5px] border px-1 py-1 text-center ${
                    c.score === cs.score ? "border-gold-strong/50 bg-gold-bg" : "border-hairline bg-paper-2"
                  }`}
                >
                  <p className="tabnum font-mono-tx text-[11px] font-bold text-ink">{c.score.replace("-", ":")}</p>
                  <p className="tabnum font-mono-tx text-[9px] text-ink-3">{p1(c.p)}</p>
                </li>
              ))}
            </ul>
            <ul className="mt-1.5 space-y-[3px] font-mono-tx text-[10px] text-ink-2">
              {csAll.zones.map((z) => (
                <li key={z.res} className="flex justify-between gap-2">
                  <span>{SIDE_ZH[z.res]}格內最可能比分</span>
                  <span className="tabnum">
                    {z.score.replace("-", ":")} · 該賽果成立下 {p1(z.cond)}
                  </span>
                </li>
              ))}
              <li className="flex justify-between gap-2 text-ink-3">
                <span>主隊贏三球或以上</span>
                <span className="tabnum">{p1(csAll.tails.winBy3)}</span>
              </li>
              <li className="flex justify-between gap-2 text-ink-3">
                <span>主隊入四球或以上</span>
                <span className="tabnum">{p1(csAll.tails.h4plus)}</span>
              </li>
              <li className="flex justify-between gap-2 text-ink-3">
                <span>客隊零封（零入球）</span>
                <span className="tabnum">{p1(csAll.tails.awayZero)}</span>
              </li>
            </ul>
            <p className="mt-1 text-[9px] leading-relaxed text-ink-3">
              公開波膽只出一格（全矩陣機率最高者），呢張表係同一張矩陣嘅完整分佈，唔係另一套預測。
              泊松方差等於均值，大比分先天偏瘦；肥尾同把 Elo 分差注入 λ 仍屬研究軌，未過三項閘唔會入凍結。
            </p>
          </div>


          <div className="rounded-[7px] border border-hairline bg-paper px-2 py-1.5">
            <p className="mb-1 text-[10px] font-bold text-ink-2">三軌各自口徑（主／和／客）</p>
            <ul className="space-y-[3px] font-mono-tx text-[10px] text-ink-2">
              <li className="flex justify-between gap-2">
                <span>天喜足球ELO（權重 {weights.elo.toFixed(2)}）</span>
                <span className="tabnum">{m.p_elo ? m.p_elo.map((v) => p1(v)).join(" / ") : "—"}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span>入球模型 Dixon-Coles（權重 {weights.dc.toFixed(2)}）</span>
                <span className="tabnum">{m.p_dc ? m.p_dc.map((v) => p1(v)).join(" / ") : "—"}</span>
              </li>
              <li className="flex justify-between gap-2 font-bold text-ink">
                <span>對數空間加權集成（本頁採用）</span>
                <span className="tabnum">{m.p.map((v) => p1(v)).join(" / ")}</span>
              </li>
              <li className="flex justify-between gap-2 text-ink-3">
                <span>市場去水（權重 0，只作對照）</span>
                <span className="tabnum">{m.market ? m.market.map((v) => p1(v)).join(" / ") : "—"}</span>
              </li>
            </ul>
          </div>

          <p className="text-[9px] leading-relaxed text-ink-3">
            採用因子：Elo 主客評分同分差、入球模型 λ 與攻守係數、近十場滾動（得分／入失球／射門／角球／牌）、
            休息日與場次密度、對賽往績、聯賽同主場優勢基線。未採用：任何賠率、賽中統計、數據集自帶 ExpectedGoals。
          </p>
          <Link to="/football/engine" className="inline-block text-[10px] font-bold text-gold">
            睇完整八步流程同 54 項特徵 →
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function FootballFixturesPage() {
  const q = useQuery<Payload>({
    queryKey: ["footballPredictions"],
    queryFn: async () => {
      const res = await fetch("/api/public/football-predictions");
      if (!res.ok) throw new Error(`載入失敗 ${res.status}`);
      return (await res.json()) as Payload;
    },
    staleTime: 300_000,
  });

  const [league, setLeague] = useState<string>("全部");
  const [onlyValue, setOnlyValue] = useState(false);
  const onlyHkjc = true; // 嚴格：只出馬會有盤
  const [showPast, setShowPast] = useState(false);
  const [sort, setSort] = useState<"time" | "value" | "conf">("time");

  // 馬會有盤清單（公開只讀接口；失敗回空陣列，篩選自動失效）
  const hkjcQ = useQuery({
    queryKey: ["football-hkjc-list"],
    queryFn: async () => {
      const res = await fetch("/api/public/football-hkjc-list");
      if (!res.ok) throw new Error("hkjc list failed");
      return (await res.json()) as { pairs: { home: string; away: string }[] };
    },
    staleTime: 10 * 60_000,
    retry: 1,
  });
  const normName = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
  const hkjcPairs = hkjcQ.data?.pairs ?? [];
  const hasHkjc = (m: Match) => {
    if (!hkjcPairs.length) return false;
    const h = normName(m.home), a = normName(m.away);
    return hkjcPairs.some((x) => (x.home.includes(h) || h.includes(x.home)) && (x.away.includes(a) || a.includes(x.away)));
  };

  const all = q.data?.matches ?? [];
  const now = Date.now();
  const matches = useMemo(
    () => (showPast ? all : all.filter((m) => kickoffMs(m.kickoff_utc) > now - 2 * 3600 * 1000)).filter((m) => hasHkjc(m)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, showPast, hkjcQ.data],
  );
  const pastCount = all.length - all.filter((m) => kickoffMs(m.kickoff_utc) > now - 2 * 3600 * 1000).length;
  const leagues = useMemo(() => {
    const s = new Map<string, number>();
    for (const m of matches) s.set(m.league_zh, (s.get(m.league_zh) ?? 0) + 1);
    return [...s.entries()].sort((a, b) => b[1] - a[1]);
  }, [matches]);

  const rows = useMemo(() => {
    const list = matches
      .filter((m) => league === "全部" || m.league_zh === league)
      .filter((m) => !onlyValue || (m.edge ? Math.max(...m.edge) >= 0.05 : false))
      .filter((m) => !onlyHkjc || hasHkjc(m));
    if (sort === "value") {
      return [...list].sort((a, b) => (b.edge ? Math.max(...b.edge) : -9) - (a.edge ? Math.max(...a.edge) : -9));
    }
    if (sort === "conf") return [...list].sort((a, b) => Math.max(...b.p) - Math.max(...a.p));
    return [...list].sort((a, b) => kickoffMs(a.kickoff_utc) - kickoffMs(b.kickoff_utc));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, league, onlyValue, onlyHkjc, sort, hkjcQ.data]);

  /** 排序按時間時，逐日分組（香港日期）方便掃讀 */
  const groups = useMemo(() => {
    if (sort !== "time") return [{ day: "", items: rows }];
    const out: { day: string; items: Match[] }[] = [];
    for (const m of rows) {
      const day = hkDayLabel(hkDateKey(m.kickoff_utc));
      const last = out[out.length - 1];
      if (last && last.day === day) last.items.push(m);
      else out.push({ day, items: [m] });
    }
    return out;
  }, [rows, sort]);

  const crestOf = useCrests(matches.map((m) => m.div));

  const meta = q.data?.meta;
  const valueCount = matches.filter((m) => m.edge && Math.max(...m.edge) >= 0.05).length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hkjcKeys = useMemo(() => new Set(matches.filter((m) => hasHkjc(m)).map((m) => m.match_key)), [matches, hkjcQ.data]);
  const chip = (active: boolean, tone: "gold" | "win" = "gold") =>
    `rounded-[5px] border px-2 py-1 text-[10px] font-bold ${
      active
        ? tone === "win"
          ? "border-win/40 bg-win/10 text-win"
          : "border-gold-strong/40 bg-gold-bg text-gold"
        : "border-hairline bg-paper text-ink-2"
    }`;

  return (
    <AppShell
      page="football"
      ticker={
        meta
          ? `TX-Football 賽前預測 · ${meta.fixtures_count} 場 · 指紋 ${meta.fingerprint} · 歷史 ${meta.history_matches.toLocaleString()} 場前推 · 賠率零權重 · 現階段一律紅燈（退回基準）`
          : "TX-Football 賽前預測 · 載入中"
      }
    >
      <PageHead
        en="Pre-match Frozen Predictions"
        title="足球賽前預測"
        desc={
          <>
            每場開賽前出機率並保存版本指紋，賽後逐場公開對帳。所有輸入只用開賽前已存在嘅歷史賽果，
            賠率一項都冇入模——只放喺卡內做去水對照同價值判斷。
          </>
        }
      />
      <FootballNav />
      <FootballLiveBoard />

      {q.isPending ? (
        <div className="mx-4 my-3 flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[14px] border border-hairline bg-paper-2" />
          ))}
        </div>
      ) : q.isError || !meta ? (
        <Card title="讀唔到預測檔" en="Unavailable">
          <p className="text-[11px] leading-relaxed text-ink-2">
            暫時讀唔到已凍結嘅預測檔（{q.error instanceof Error ? q.error.message : "未知錯誤"}）。
            採集器每 6 小時重跑一次，過陣再睇。
          </p>
        </Card>
      ) : (
        <>
          <Card title="本批預測" en="This Batch">
            <StatGrid cols={3}>
              <Stat
                label="未開賽場次"
                value={String(matches.length)}
                sub={`${leagues.length} 個聯賽 · 本批共 ${meta.fixtures_count}`}
              />
              <Stat label="歷史前推" value={meta.history_matches.toLocaleString()} sub={`最後賽果 ${meta.history_last_date}`} />
              <Stat label="版本指紋" value={meta.fingerprint.slice(0, 8)} sub="腳本＋資料＋場次數" />
            </StatGrid>
            <FingerprintChip
              values={[meta.fingerprint]}
              note={`腳本＋資料＋場次數 · ${meta.history_matches.toLocaleString()} 場前推`}
            />

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {meta.s5?.ready ? (
                <Pill tone="win">綠燈 · S5 集成已接入（{meta.s5.green_matches} 場）</Pill>
              ) : (
                <Pill tone="lose">紅燈 · 退回基準軌</Pill>
              )}
              <Pill tone="ink">生成 {hk(meta.generated_at)}（香港時間）</Pill>
              <Pill tone={meta.fixtures_stale ? "lose" : "win"}>{meta.fixtures_stale ? "賽程係舊貨" : "賽程新鮮"}</Pill>
              <Pill tone="ink">
                混合權重 入球模型 {meta.weights.dc.toFixed(2)} ／ Elo {meta.weights.elo.toFixed(2)}
              </Pill>
              <Pill tone="ink">開賽前 {meta.lock_minutes} 分鐘鎖定</Pill>
            </div>
            {meta.s5?.ready ? (
              <p className="mt-2 rounded-[8px] border border-gold-strong/40 bg-gold-bg px-2.5 py-2 text-[10px] leading-relaxed text-ink-2">
                <b className="text-gold">照實講：</b>
                {meta.status_note}
                {meta.s5.backtest ? (
                  <>
                    {" "}呢個模型上線之前要過三項閘門：最近三個完整賽季共 {meta.s5.backtest.n.toLocaleString()} 場季外測試，
                    排序分數 RPS {meta.s5.backtest.rps.toFixed(4)}、校準偏差 {(meta.s5.backtest.ece * 100).toFixed(2)}%，
                    都要贏最佳單軌（RPS {meta.s5.gate?.best_single_track_rps.toFixed(4)}）先准入凍結軌。
                  </>
                ) : null}
                {" "}紅燈場次係熱身場數不足（雙方各要 40 場歷史）而退回基準軌，只作診斷，唔入公開帳。
              </p>
            ) : (
              <p className="mt-2 rounded-[8px] border border-lose/30 bg-lose/5 px-2.5 py-2 text-[10px] leading-relaxed text-ink-2">
                <b className="text-lose">照實講：</b>
                {meta.status_note}換句話講，呢批機率係 S2 天喜足球ELO 加 S3 入球模型嘅在線混合，未經 S5 校準，
                唔可以當最終預測用。{meta.s5?.reason ? `未就緒原因：${meta.s5.reason}。` : ""}
              </p>
            )}
          </Card>

          <Card title="逐場預測" en="Match List">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => setLeague("全部")} className={chip(league === "全部")}>
                全部 {matches.length}
              </button>
              {leagues.map(([name, n]) => (
                <button key={name} type="button" onClick={() => setLeague(name)} className={chip(league === name)}>
                  {name} {n}
                </button>
              ))}
              <button type="button" onClick={() => setOnlyValue((v) => !v)} className={chip(onlyValue, "win")}>
                只睇價值差 ≥5 個百分點 {valueCount}
              </button>
              <span className={chip(true, "win")}>
                {hkjcQ.isPending ? "核對馬會有盤中…" : hkjcPairs.length ? `只顯示馬會有盤 ${hkjcKeys.size}` : "暫時讀唔到馬會盤口，暫不列出場次"}
              </span>
              {pastCount > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowPast((v) => !v);
                    setLeague("全部");
                  }}
                  className={chip(showPast)}
                >
                  {showPast ? "隱藏已開賽" : `連已開賽一齊睇 +${pastCount}`}
                </button>
              ) : null}
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-1.5 border-t border-hairline pt-2">
              <span className="font-mono-tx text-[9px] font-bold uppercase tracking-[0.2em] text-ink-3">排序</span>
              {(
                [
                  ["time", "開賽時間"],
                  ["value", "價值差最大"],
                  ["conf", "引擎最有信心"],
                ] as const
              ).map(([k, label]) => (
                <button key={k} type="button" onClick={() => setSort(k)} className={chip(sort === k)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.day || "all"}>
                  {g.day ? (
                    <p className="mb-1.5 flex items-center gap-2 border-b border-hairline pb-1 font-mono-tx text-[10px] font-bold text-ink-2">
                      {g.day}
                      <span className="text-ink-3">{g.items.length} 場</span>
                    </p>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {g.items.map((m) => (
                      <MatchCard key={m.match_key} m={m} weights={meta.weights} crestOf={crestOf} hkjc={hkjcKeys.has(m.match_key)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>


            {rows.length === 0 ? (
              <div className="mt-3 rounded-[12px] border border-hairline bg-paper-2 px-4 py-6 text-center">
                <p className="font-serif-tc text-[14px] font-bold text-ink">呢個篩選之下冇場次</p>
                <p className="mt-1 text-[12px] text-ink-3">試吓轉聯賽；本頁只列馬會有盤場次。</p>
                <button
                  type="button"
                  onClick={() => { setOnlyValue(false); setLeague("全部"); }}
                  className="mt-3 rounded-full border border-gold-strong/60 bg-gold-bg px-4 py-1.5 text-[12px] font-bold text-gold"
                >
                  清除全部篩選
                </button>
              </div>
            ) : null}
            <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
              波膽點計出嚟（卜瓦松分佈 × 球隊實力）：第一步用五大聯賽實力模型（Dixon-Coles 攻守係數＋主場優勢，
              時間半衰期 180 日、每兩星期滾動重訓）算出雙方預期入球 λ，再以卜瓦松公式
              P(X=k) = λ^k · e^(−λ) ／ k! 分別計主客入 k 球機率，兩邊相乘派生 0-0 至 8-8 完整比分矩陣，
              並對低比分格（0-0／1-0／0-1／1-1）做 Dixon-Coles 相關修正。
              第二步，亦係決定性嘅一步，用三軌集成（天喜足球ELO 實力 ＋ 入球模型）嘅主／和／客機率，
              將矩陣按賽果分區重新加權，令主勝／和局／客勝三個區嘅合計機率同引擎嘅實力判斷完全一致，
              然後才揀格：主選＝三區之中機率最高一格，另外兩區各出一個分區備選（同時列全場機率同「該賽果成立之下」嘅條件機率），
              所以強隊唔會再因為「平均入球細」而被拉去和局格。
              比分本質仍然分散：兩隊 λ 多數落 1.0–1.8，低比分格最厚，所以主選通常仍係
              1-0／2-1／2-0；大比數（例如 4-1）單一機率一般只有 1%–2%。因此我哋同時列出
              「四球或以上合計機率」，等你睇到大比數整體幾大機會，唔會被單一比分誤導。
              賠率係唯一唔會用嚟校正模型嘅資料：市場只作對照線同價值判斷，權重永遠零。
              大細同兩隊入球同出一個矩陣，各盤口機率永遠互相一致。「市場去水」係賽前平均賠率去掉水錢後嘅隱含機率，
              權重零，只作對照；「價值差」＝模型機率減市場機率。隊徽先用官方來源，對唔到就用站內後備圖
              （五大聯賽歷史球隊＋西乙、英甲、英乙、德乙、意乙、法乙），再冇先用按隊名派生嘅識別標；
               隊名用繁體中文／港式譯名對照表；英文原名只保留作內部資料配對，唔會直接放上卡面。
            </p>

          </Card>

          <Card title="呢頁未有嘅嘢" en="Not Yet">
            <ul className="ml-4 list-disc space-y-1 text-[10px] leading-relaxed text-ink-2">
              <li>
                黃燈（開賽前刷新中）暫時未細分：現時只有綠燈（S5 集成、已過三項閘門）同紅燈（熱身不足退回基準軌）。
              </li>
              <li>機率區間（信賴帶）同逐場前幾大特徵貢獻（SHAP）未上線，已入路線圖。</li>
              <li>賽後逐場對帳紀錄要等呢批凍結預測有咗賽果之後才會出現。</li>
              <li>xG、官方首發陣容、傷停係 v1 特徵，未上線；次級聯賽六個聯賽 191 隊已全部有真徽（南蒂羅爾取自維基百科）。</li>
            </ul>
            <p className="mt-2">
              <Link
                to="/football/results"
                className="inline-flex items-center gap-1 rounded-[6px] border border-gold-strong/40 bg-gold-bg px-2.5 py-1.5 text-[11px] font-bold text-gold"
              >
                睇引擎公開對帳 →
              </Link>
            </p>
          </Card>
        </>
      )}

      <Disclaimer
        extra={
          meta?.s5?.ready
            ? "綠燈場次為 S5 集成校準後嘅賽前凍結機率，紅燈場次為未校準基準軌，全部僅作研究對照，不構成任何投注建議。"
            : "本頁機率為未校準嘅基準軌輸出，僅作研究對照，不構成任何投注建議。"
        }
      />
    </AppShell>
  );
}
