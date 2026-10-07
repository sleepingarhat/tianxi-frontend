// 監控端資料讀取：只讀現有公開接口同資料庫，唔改任何凍結資料
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { getRacingHealth } from "@/lib/racingOps.functions";
import { txApi } from "@/lib/tx-api";

const getJson = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} 回應 ${r.status}`);
  return (await r.json()) as T;
};

export const REFRESH_KEY = "tx-admin-refresh-sec";
export function refreshMs() {
  if (typeof window === "undefined") return 60_000;
  const v = Number(window.localStorage.getItem(REFRESH_KEY));
  return Number.isFinite(v) && v >= 15 ? v * 1000 : 60_000;
}

export const useRacingHealth = () =>
  useQuery({ queryKey: ["admin", "racing-health"], queryFn: () => getRacingHealth(), refetchInterval: refreshMs() });

export const useEngineHealth = () =>
  useQuery({ queryKey: ["admin", "engine-health"], queryFn: () => getJson<any>("/api/public/engine-health"), refetchInterval: refreshMs() });

export const useFootballIngest = () =>
  useQuery({ queryKey: ["admin", "football-ingest"], queryFn: () => getJson<any>("/api/public/football-ingest-status"), refetchInterval: refreshMs() });

export const useLockState = () =>
  useQuery({ queryKey: ["admin", "lock-state"], queryFn: () => getJson<any>("/api/public/lock-state"), refetchInterval: refreshMs() });

export const useMarksixLatest = () =>
  useQuery({ queryKey: ["admin", "m6-latest"], queryFn: () => getJson<any>("/api/public/marksix-data?kind=history"), staleTime: 10 * 60_000 });

export const useRollup = () =>
  useQuery({ queryKey: ["admin", "rollup90"], queryFn: () => txApi.hitRateRollup(90), staleTime: 10 * 60_000 });

export const useRacingPnl = () =>
  useQuery({ queryKey: ["admin", "racing-pnl"], queryFn: () => txApi.strategyPnl(), staleTime: 10 * 60_000 });

export type VersionRow = { version: string; engine: string; fingerprint: string | null; released_at: string; status: string; notes: string | null };
export const useModelVersions = () =>
  useQuery({
    queryKey: ["admin", "model-versions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("model_versions")
        .select("version,engine,fingerprint,released_at,status,notes")
        .order("released_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VersionRow[];
    },
  });

export type LedgerRow = {
  match_key: string; version: string; div: string; home: string; away: string; kickoff_utc: string; locked_at: string;
  prediction: "home" | "draw" | "away"; p_final: number[]; odds_source: string; pick_odds: number | null; stake: number;
  ftr: "home" | "draw" | "away" | null; score: string | null;
};

/** 足球鎖定帳（全部版本）＋ 賽果 join */
export const useFootballLedger = () =>
  useQuery({
    queryKey: ["admin", "football-ledger"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_dual_ledger")
        .select("match_key,version,div,home,away,kickoff_utc,locked_at,prediction,p_final,odds_source,pick_odds,stake")
        .order("kickoff_utc", { ascending: false })
        .limit(2000);
      if (error) throw error;
      const rows = (data ?? []) as Omit<LedgerRow, "ftr" | "score">[];
      const months = [...new Set(rows.map((r) => r.kickoff_utc.slice(0, 7)))];
      const res: Record<string, { result?: { ftr: LedgerRow["ftr"]; ft_h: number; ft_a: number } | null }> = {};
      await Promise.all(
        months.map(async (m) => {
          try {
            const j = await getJson<{ matches?: typeof res }>(`/api/public/football-predictions?file=log&month=${m}`);
            Object.assign(res, j.matches ?? {});
          } catch { /* 該月未有賽果 */ }
        }),
      );
      return rows.map((r) => {
        const x = res[r.match_key]?.result;
        return { ...r, ftr: x?.ftr ?? null, score: x ? `${x.ft_h}-${x.ft_a}` : null } as LedgerRow;
      });
    },
    staleTime: 5 * 60_000,
  });

export const ago = (iso?: string | null) => {
  if (!iso) return "—";
  const m = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (!Number.isFinite(m)) return "—";
  if (m < 1) return "啱啱";
  if (m < 60) return `${m} 分鐘前`;
  if (m < 48 * 60) return `${Math.round(m / 60)} 小時前`;
  return `${Math.round(m / 1440)} 日前`;
};
