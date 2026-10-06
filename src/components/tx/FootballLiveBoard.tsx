import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useCrests } from "@/lib/footballCrests";
import { teamZh } from "@/lib/teamZh";
import { CrestScoreboard, SIDE_ZH } from "@/components/tx/FootballMatchUI";
import { OverflowTicker } from "@/components/tx/OverflowTicker";
import { Card, Pill } from "@/components/tx/ui";
import { nameScore } from "@/lib/footballLiveResults";
import { supabase } from "@/integrations/supabase/client";

import type { LiveEvent, LiveMatch } from "@/routes/api/public/football-live";

type Payload = {
  configured: boolean;
  note?: string;
  error?: string;
  stale?: boolean;
  matches: LiveMatch[];
  generated_at: string;
};

type LogRec = {
  match_key: string;
  div: string;
  home: string;
  away: string;
  kickoff_utc: string;
  p_final: number[];
  prediction: "home" | "draw" | "away";
};

const PERIOD_ZH: Record<string, string> = {
  FIRST_HALF: "上半場",
  HALF_TIME: "半場",
  SECOND_HALF: "下半場",
  EXTRA_TIME: "加時",
  FINISHED: "完場",
};

function eventIcon(t: LiveEvent["type"]) {
  return t === "goal" ? "⚽" : t === "sub" ? "🔁" : "🟨";
}

function eventZh(e: LiveEvent) {
  const who = e.player ?? e.team ?? "";
  if (e.type === "goal") return `${who} 入球`;
  if (e.type === "sub") return `換人 ${who}${e.detail ? `（${e.detail}）` : ""}`;
  if (e.type === "card") return `黃牌 ${who}`;
  return e.detail ?? who;
}

/**
 * 即時戰況畫板（文字直播）：GOAL API 即時比分＋入球／換人事件。
 * 只展示能同正式 dual-v1 鎖定帳配對嘅場次，避免同名聯賽被錯誤歸類。
 */
export function FootballLiveBoard() {
  const q = useQuery<Payload>({
    queryKey: ["footballLive"],
    queryFn: async () => {
      const r = await fetch("/api/public/football-live");
      if (!r.ok) throw new Error(`載入失敗 ${r.status}`);
      return (await r.json()) as Payload;
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const logs = useQuery<LogRec[]>({
    queryKey: ["footballDualLedgerForLive"],
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
      const { data, error } = await supabase
        .from("football_dual_ledger")
        .select("match_key,div,home,away,kickoff_utc,p_final,prediction")
        .gte("kickoff_utc", since)
        .order("kickoff_utc", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LogRec[];
    },
    staleTime: 300_000,
  });

  const matches = q.data?.matches ?? [];
  const crestOf = useCrests([...new Set(matches.map((m) => m.div))]);

  const matchesWithPred = useMemo(() => {
    return matches.map((m) => {
      const pred = logs.data?.find((r) => {
        if (r.div !== m.div) return false;
        if (r.kickoff_utc && m.kickoff_utc) {
          const dt = Math.abs(Date.parse(r.kickoff_utc) - Date.parse(m.kickoff_utc));
          if (dt > 30 * 60 * 60 * 1000) return false;
        }
        return Math.min(nameScore(r.home, m.home), nameScore(r.away, m.away)) >= 0.6;
      });
      
      if (!pred) return null;
      const idx = ["home", "draw", "away"].indexOf(pred.prediction);
      return { ...m, dual: { idx, pf: pred.p_final } };
    }).filter((m): m is NonNullable<typeof m> => m !== null);
  }, [matches, logs.data]);

  if (!q.data?.configured || matchesWithPred.length === 0) return null;

  return (
    <Card title="即時戰況" en="Live">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Pill tone="lose">
          <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-lose" />
          直播緊 {matchesWithPred.length} 場
        </Pill>
        <Pill tone="ink">每 30 秒更新</Pill>
        {q.data.stale ? <Pill tone="ink">上游抖緊，顯示舊一拍</Pill> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {matchesWithPred.map((m) => {
          const period = m.period ? (PERIOD_ZH[m.period] ?? m.period) : "進行中";
          const homeZh = teamZh(m.div, m.home);
          const awayZh = teamZh(m.div, m.away);
          
          return (
            <article 
              key={m.id} 
              className="group min-w-0 overflow-hidden rounded-[10px] border border-hairline bg-paper transition-shadow hover:shadow-sm"
            >
              <div className="px-3 py-3">
                <CrestScoreboard
                  crestSize={30}
                  rows={[
                    { 
                      name: homeZh, 
                      crest: crestOf(m.div, m.home), 
                      value: <span className="text-[18px]">{m.home_score}</span> 
                    },
                    { 
                      name: awayZh, 
                      crest: crestOf(m.div, m.away), 
                      value: <span className="text-[18px]">{m.away_score}</span> 
                    },
                  ]}
                  badge={
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="w-[4.5rem] shrink-0 rounded-[6px] bg-lose/15 px-1 py-1.5 text-center text-[11px] font-bold text-lose">
                        {m.elapsed != null ? `${m.elapsed}′` : period}
                      </span>
                      {m.dual && m.dual.idx >= 0 && (
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-bold text-ink-3">DUAL-V1</span>
                          <span className="rounded-[4px] bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-ink">
                            {SIDE_ZH[m.dual.idx]}
                          </span>
                        </div>
                      )}
                    </div>
                  }
                />
                
                <div className="mt-2 flex items-center border-t border-hairline pt-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-ink-3">
                    <span className="font-bold text-ink-2">{m.league_zh}</span>
                    <span>·</span>
                    <span>{period}</span>
                  </div>
                </div>

                {m.events.length > 0 ? (
                  <ul className="mt-2 space-y-[4px] rounded-[8px] bg-paper-2 p-2">
                    {m.events.slice(0, 5).map((e, i) => (
                      <li key={i} className="flex items-baseline gap-2 text-[10px] leading-tight text-ink-2">
                        <span className="tabnum w-6 shrink-0 text-right font-mono-tx text-ink-3">
                          {e.minute != null ? `${e.minute}′` : "—"}
                        </span>
                        <span className="shrink-0" aria-hidden>{eventIcon(e.type)}</span>
                        <OverflowTicker className="flex-1">{eventZh(e)}</OverflowTicker>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-4 text-[10px] leading-relaxed text-ink-3">
        只顯示已配對正式鎖定帳嘅直播場次；即時比分同事件只作展示，雙引擎預測以開賽前 6 小時數據為準，唔會隨賽況更新。
      </p>
    </Card>
  );
}
