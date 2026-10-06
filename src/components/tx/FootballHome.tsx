import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FootballCrest } from "@/components/tx/FootballCrest";
import { OverflowTicker } from "@/components/tx/OverflowTicker";
import { useCrests } from "@/lib/footballCrests";
import { argmaxSide, SIDE_ZH_3 } from "@/lib/footballTeams";
import { hkDateTime } from "@/lib/hkTime";
import { teamZh } from "@/lib/teamZh";
import { dualEngine } from "@/lib/footballDualEngine";
import { matchLive, rpsOf, type LiveResult } from "@/lib/footballLiveResults";
import { supabase } from "@/integrations/supabase/client";

/** 正式預測＝雙引擎 dual-v1（凍結 p＋λ 推算，同鎖定帳本同一公式）；缺 λ 先退回凍結三格。 */
function dual(p: number[], lambda?: number[]) {
  if (p.length === 3 && lambda?.length === 2) {
    const r = dualEngine(p as [number, number, number], lambda as [number, number]);
    return { pf: r.pFinal as number[], pick: ["home", "draw", "away"].indexOf(r.pick) };
  }
  return { pf: p, pick: argmaxSide(p) };
}

/** 足球首頁精簡版：只讀現有公開 API，唔改任何凍結欄位。 */

type Fx = {
  match_key: string;
  div: string;
  league_zh: string;
  home: string;
  away: string;
  kickoff_utc: string;
  locked: boolean;
  p: [number, number, number];
  lambda: [number, number];
  over25: number;
  btts: number;
  top_score: { score: string; p: number };
};

type Rec = {
  match_key: string;
  div: string;
  league_zh?: string;
  home: string;
  away: string;
  kickoff_utc?: string;
  locked_at?: string | null;
  status?: string;
  p?: number[];
  lambda?: number[];
  result?: { ft_h: number; ft_a: number; ftr: string; rps?: number; cs_rank?: number | null } | null;
};

type DualLock = {
  match_key: string;
  locked_at: string;
  p_final: number[];
  lambda: number[];
};

const pc = (v?: number) => (v == null ? "—" : `${Math.round(v * 100)}%`);
const toMs = (iso?: string) => {
  if (!iso) return 0;
  const t = Date.parse(iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`);
  return Number.isNaN(t) ? 0 : t;
};
const RES_IDX: Record<string, number> = { home: 0, draw: 1, away: 2, H: 0, D: 1, A: 2 };

function ProbBar({ p, pick }: { p: number[]; pick: number }) {
  const tones = ["bg-deep", "bg-ink-3", "bg-gold"];
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-hairline">
      {p.map((v, i) => (
        <span
          key={i}
          className={`${tones[i]} ${i === pick ? "opacity-100" : "opacity-40"} transition-all duration-500`}
          style={{ width: `${(v ?? 0) * 100}%` }}
        />
      ))}
    </div>
  );
}

function RowSkeleton({ n = 5 }: { n?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-[10px]" />
      ))}
    </div>
  );
}

function SectionHead({ title, en, to, cta }: { title: string; en: string; to: string; cta: string }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-2">
      <h2 className="font-serif-tc text-[15px] font-bold text-ink">
        {title}
        <small className="ml-2 font-mono-tx text-[9px] font-bold uppercase tracking-[0.2em] text-ink-3">{en}</small>
      </h2>
      <Link to={to} className="shrink-0 text-[11px] font-bold text-gold hover:underline">
        {cta} →
      </Link>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-hairline bg-paper px-2.5 py-2">
      <p className="text-[10px] text-ink-3">{label}</p>
      <p className="tabnum mt-1 font-mono-tx text-[15px] font-bold text-ink">{value}</p>
    </div>
  );
}

export function CompactFixtures() {
  const [open, setOpen] = useState<Fx | null>(null);
  const q = useQuery<{ matches: Fx[] }>({
    queryKey: ["footballPredictions"],
    queryFn: async () => {
      const r = await fetch("/api/public/football-predictions");
      if (!r.ok) throw new Error(`載入失敗 ${r.status}`);
      return r.json();
    },
    staleTime: 300_000,
  });
  const now = Date.now();
  const allFx = q.data?.matches ?? [];
  const upcoming = allFx
    .filter((m) => toMs(m.kickoff_utc) > now - 2 * 3600_000)
    .sort((a, b) => toMs(a.kickoff_utc) - toMs(b.kickoff_utc));
  const rows = (upcoming.length
    ? upcoming
    : [...allFx].sort((a, b) => toMs(b.kickoff_utc) - toMs(a.kickoff_utc))
  ).slice(0, 6);
  const crestOf = useCrests(rows.map((m) => m.div));

  return (
    <section className="mx-4 my-3 rounded-[8px] border border-hairline bg-paper-2 p-3 shadow-sm">
      <SectionHead title="近期賽程" en="Fixtures" to="/football/fixtures" cta="全部賽程" />
      {q.isLoading ? (
        <RowSkeleton />
      ) : !rows.length ? (
        <p className="py-4 text-center text-[11px] text-ink-3">暫時未有未來賽程</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {!upcoming.length ? (
            <li className="text-[10px] text-ink-3">未有新一批賽程，先列最近一批凍結預測</li>
          ) : null}
          {rows.map((m) => {
            const { pf, pick } = dual(m.p, m.lambda);
            return (
              <li key={m.match_key}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(m)}
                  className="group flex h-auto w-full flex-col gap-2 rounded-[8px] border-hairline bg-paper px-3 py-2.5 text-left font-normal hover:border-gold-strong/50 hover:bg-paper hover:shadow-md"
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[9px] font-bold text-gold">{m.league_zh || m.div}</span>
                    <span className="tabnum shrink-0 font-mono-tx text-[10px] leading-none text-ink-3">
                      {hkDateTime(m.kickoff_utc)}
                    </span>
                  </span>
                  <span className="flex w-full items-center justify-center gap-1.5 text-[11px] font-bold text-ink">
                    <span className="flex min-w-0 items-center justify-end gap-1">
                      <span className="min-w-0 truncate">{teamZh(m.div, m.home)}</span>
                      <FootballCrest name={teamZh(m.div, m.home)} src={crestOf(m.div, m.home)} size={18} />
                    </span>
                    <span className="shrink-0 font-mono-tx text-[9px] font-normal text-ink-3">vs</span>
                    <span className="flex min-w-0 items-center gap-1">
                      <FootballCrest name={teamZh(m.div, m.away)} src={crestOf(m.div, m.away)} size={18} />
                      <span className="min-w-0 truncate">{teamZh(m.div, m.away)}</span>
                    </span>
                  </span>
                  <span className="flex w-full items-center gap-2">
                    <span className="min-w-0 flex-1">
                      <ProbBar p={pf} pick={pick} />
                    </span>
                    <span className="flex shrink-0 items-baseline gap-1">
                      <span className="rounded-[4px] bg-deep px-1.5 py-[2px] text-[10px] font-bold text-deep-fg">
                        {SIDE_ZH_3[pick]}
                      </span>
                      <span className="tabnum font-mono-tx text-[10px] text-ink-3">{pc(pf[pick])}</span>
                    </span>
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-md">
          {open ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif-tc">
                  {teamZh(open.div, open.home)} vs {teamZh(open.div, open.away)}
                </DialogTitle>
                <p className="text-[11px] text-ink-3">
                  {open.league_zh} · {hkDateTime(open.kickoff_utc)}（港）· {open.locked ? "已鎖" : "未鎖"}
                </p>
              </DialogHeader>
              <ProbBar p={dual(open.p, open.lambda).pf} pick={dual(open.p, open.lambda).pick} />
              <div className="grid grid-cols-3 gap-2">
                <Detail label="主勝" value={pc(dual(open.p, open.lambda).pf[0]!)} />
                <Detail label="和局" value={pc(dual(open.p, open.lambda).pf[1]!)} />
                <Detail label="客勝" value={pc(dual(open.p, open.lambda).pf[2]!)} />
                <Detail label="預期入球" value={`${open.lambda[0].toFixed(2)}–${open.lambda[1].toFixed(2)}`} />
                <Detail label="大 2.5" value={pc(open.over25)} />
                <Detail label="最可能比分" value={open.top_score.score} />
              </div>
              <Link to="/football/fixtures" className="text-center text-[12px] font-bold text-gold hover:underline">
                睇完整預測卡 →
              </Link>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function monthKey(offset = 0) {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + offset);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function CompactLedger() {
  const [open, setOpen] = useState<Rec | null>(null);
  const months = [monthKey(0), monthKey(-1)];

  const liveRes = useQuery<{ matches?: LiveResult[] }>({
    queryKey: ["footballLiveResults"],
    queryFn: async () => {
      const r = await fetch("/api/public/football-live-results");
      if (!r.ok) return { matches: [] };
      return r.json();
    },
    staleTime: 120_000,
  });

  const dualLocks = useQuery<DualLock[]>({
    queryKey: ["footballDualLocksCompact"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_dual_ledger")
        .select("match_key,locked_at,p_final,lambda")
        .order("kickoff_utc", { ascending: false })
        .limit(120);
      if (error) throw error;
      return (data ?? []) as DualLock[];
    },
    staleTime: 300_000,
  });

  const q = useQuery<Rec[]>({
    queryKey: ["footballLedgerCompact", months.join(",")],
    queryFn: async () => {
      const [logFiles, upcoming] = await Promise.all([
        Promise.all(
          months.map(async (m) => {
            const r = await fetch(`/api/public/football-predictions?file=log&month=${m}`);
            if (!r.ok) return { matches: {} };
            return (await r.json()) as { matches?: Record<string, Rec> };
          }),
        ),
        fetch("/api/public/football-predictions").then((r) => r.json()) as Promise<{ matches: Fx[] }>,
      ]);

      const logs = logFiles.flatMap((f) => Object.values(f.matches ?? {}));
      const upRecs: Rec[] = (upcoming.matches ?? []).map((m) => ({
        ...m,
        status: "ok",
        locked_at: m.locked ? m.kickoff_utc : null,
      }));

      const logKeys = new Set(logs.map((l) => l.match_key));
      return [...logs, ...upRecs.filter((u) => !logKeys.has(u.match_key))];
    },
    staleTime: 300_000,
  });

  const all = useMemo(() => {
    const pool = liveRes.data?.matches ?? [];
    const locks = new Map((dualLocks.data ?? []).map((r) => [r.match_key, r]));
    return (q.data ?? []).map((r) => {
      const lock = locks.get(r.match_key);
      const frozen = lock ? { ...r, locked_at: lock.locked_at, p: lock.p_final, lambda: lock.lambda } : r;
      if (frozen.result || !pool.length) return frozen;
      const m = matchLive(frozen, pool);
      if (m) {
        const result: NonNullable<Rec["result"]> = {
          ft_h: m.ft_h,
          ft_a: m.ft_a,
          ftr: m.ftr,
          ...(frozen.p ? { rps: rpsOf(frozen.p as [number, number, number], m.ftr) } : {}),
        };
        return {
          ...frozen,
          result,
        };
      }
      return frozen;
    });
  }, [q.data, liveRes.data, dualLocks.data]);

  const rows = all
    .filter((r) => r.result && r.p?.length === 3 && r.locked_at && r.status !== "fallback")
    .sort((a, b) => toMs(b.kickoff_utc) - toMs(a.kickoff_utc))
    .slice(0, 6);
  const crestOf = useCrests(rows.map((r) => r.div));
  const hits = rows.filter((r) => dual(r.p!, r.lambda).pick === RES_IDX[r.result!.ftr]).length;

  return (
    <section className="mx-4 my-3 rounded-[8px] border border-hairline bg-paper-2 p-3 shadow-sm">
      <SectionHead title="預測 vs 賽果" en="Latest Settled" to="/football/prediction-vs-result" cta="逐場對帳" />
      {q.isLoading || dualLocks.isLoading ? (
        <RowSkeleton />
      ) : !rows.length ? (
        <p className="py-4 text-center text-[11px] text-ink-3">暫時未有已結算綠燈場</p>
      ) : (
        <>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] text-ink-3">
            最近 {rows.length} 場 · 雙引擎預測命中
            <b className="tabnum font-mono-tx text-ink">
              {hits}/{rows.length}
            </b>
            <span className="ml-auto flex gap-0.5">
              {rows.map((r) => (
                <span
                  key={r.match_key}
                  className={`h-2 w-2 rounded-full ${dual(r.p!, r.lambda).pick === RES_IDX[r.result!.ftr] ? "bg-win" : "bg-hairline"}`}
                />
              ))}
            </span>
          </p>
          <ul className="flex flex-col gap-1.5">
            {rows.map((r) => {
              const { pf, pick } = dual(r.p!, r.lambda);
              const hit = pick === RES_IDX[r.result!.ftr];
              return (
                <li key={r.match_key}>
                   <Button
                    type="button"
                     variant="outline"
                    onClick={() => setOpen(r)}
                     className="grid h-auto min-h-[5rem] w-full grid-cols-[minmax(0,1fr)_3rem_3.2rem] items-center gap-2 rounded-[8px] border-hairline bg-paper px-2.5 py-2 text-left font-normal hover:border-gold-strong/50 hover:bg-paper hover:shadow-md"
                  >
                    <span className="min-w-0 text-center">
                      {(["home", "away"] as const).map((side) => (
                        <span key={side} className="grid h-8 min-w-0 grid-cols-[1.9rem_minmax(0,1fr)_1.5rem] items-center gap-2">
                          <span className="grid h-7 w-7 shrink-0 place-items-center">
                            <FootballCrest name={teamZh(r.div, r[side])} src={crestOf(r.div, r[side])} size={26} />
                          </span>
                          <OverflowTicker className="text-center text-[14px] font-bold text-ink">{teamZh(r.div, r[side])}</OverflowTicker>
                          <span className="tabnum text-right font-mono-tx text-[13px] font-bold text-ink-2">
                            {side === "home" ? r.result!.ft_h : r.result!.ft_a}
                          </span>
                        </span>
                      ))}
                      <span className="tabnum mt-0.5 block text-center font-mono-tx text-[9px] text-ink-3">
                        {r.league_zh ?? r.div} · {hkDateTime(r.kickoff_utc)}
                      </span>
                    </span>
                    <span className="flex flex-col items-end text-[10px] text-ink-2">
                      <span className="font-bold">{SIDE_ZH_3[pick]}</span>
                      <span className="tabnum font-mono-tx text-ink-3">{pc(pf[pick]!)}</span>
                    </span>
                    <span
                      className={`rounded-[6px] px-1 py-1 text-center text-[11px] font-bold ${
                        hit ? "bg-win/15 text-win" : "bg-hairline/60 text-ink-3"
                      }`}
                    >
                      {hit ? "● 中" : "○ 未中"}
                    </span>
                   </Button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-md">
          {open?.result && open.p ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-center gap-2 font-serif-tc">
                  <FootballCrest
                    name={teamZh(open.div, open.home)}
                    src={crestOf(open.div, open.home)}
                    size={28}
                  />
                  <span className="min-w-0 text-center">
                    {teamZh(open.div, open.home)} {open.result.ft_h}–{open.result.ft_a} {teamZh(open.div, open.away)}
                  </span>
                  <FootballCrest
                    name={teamZh(open.div, open.away)}
                    src={crestOf(open.div, open.away)}
                    size={28}
                  />
                </DialogTitle>
                <p className="text-[11px] text-ink-3">
                  {open.league_zh ?? open.div} · {hkDateTime(open.kickoff_utc)}（港）· 凍結於{" "}
                  {hkDateTime(open.locked_at ?? undefined)}
                </p>
              </DialogHeader>
              <ProbBar p={dual(open.p, open.lambda).pf} pick={dual(open.p, open.lambda).pick} />
              <div className="grid grid-cols-3 gap-2">
                <Detail label="主勝（凍結）" value={pc(open.p[0])} />
                <Detail label="和局（凍結）" value={pc(open.p[1])} />
                <Detail label="客勝（凍結）" value={pc(open.p[2])} />
                <Detail label="雙引擎預測" value={SIDE_ZH_3[dual(open.p, open.lambda).pick]!} />
                <Detail label="本場 RPS" value={open.result.rps != null ? open.result.rps.toFixed(4) : "—"} />
                <Detail label="波膽格排名" value={open.result.cs_rank ? `第 ${open.result.cs_rank}` : "八格外"} />
              </div>
              <Link
                to="/football/prediction-vs-result"
                className="text-center text-[12px] font-bold text-gold hover:underline"
              >
                睇完整凍結帳 →
              </Link>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
