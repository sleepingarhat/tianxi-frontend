// 每日解釋（唯讀）：所有日期讀現行凍結 hit-rate；完整已結算場次可即日顯示。
// 只讀已鎖四揀同已入帳頭4，唔重算排名、唔寫任何紀錄。
import { useQuery } from "@tanstack/react-query";

import { type ExplainMeeting, type ExplainRace } from "@/lib/explain-data";
import { completeAuditRace } from "@/lib/racing-visibility";
import { txApi } from "@/lib/tx-api";

const bandOf = (d: number | null) => (d == null ? null : d <= 1200 ? "短途" : d <= 1650 ? "一哩" : d <= 2000 ? "中長" : "長途");

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapHitRate(date: string, j: any): ExplainMeeting | null {
  const races: any[] = Array.isArray(j?.races) ? j.races : [];
  const ok = races.filter(completeAuditRace);
  if (!ok.length) return null;
  return {
    date,
    venue: j?.venue ?? null,
    races: ok.map(
      (r): ExplainRace => ({
        date,
        venue: j?.venue ?? null,
        raceNumber: r.raceNumber,
        distance: r.distance ?? null,
        going: r.going ?? j?.trackCondition ?? null,
        band: bandOf(r.distance ?? null),
        overlap4: r.top4IntersectCount ?? null,
        src: r.scoreSource ?? null,
        sixup_leg: null,
        qin3: r.quinellaHit ?? null,
        qpl3: r.qpHit ?? null,
        place3_hits: r.top3IntersectCount ?? null,
        picks: r.predictedTop4.map((p: any) => ({
          rank: p.rank,
          horseNumber: p.horseNumber ?? null,
          nameCh: p.nameCh ?? null,
          horseId: p.horseId ?? null,
          hitTop4: !!p.hit,
          pWin: null,
          reason: null,
          scoreSource: p.scoreSource ?? null,
          shapTop5: null,
        })),
        actualTop4: r.actualTop4.slice(0, 4).map((a: any) => ({
          position: a.position,
          horseNumber: a.horseNumber ?? null,
          nameCh: a.nameCh ?? null,
          horseId: a.horseId ?? null,
          winOdds: a.winOdds ?? null,
          inPicks: !!a.hit,
        })),
      }),
    ),
  };
}

/** 每個日期都先讀現行凍結對帳，不再優先固定 JSON 或排除今日已結算場次。 */
export function useExplainMeeting(date: string) {
  const eligible = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const q = useQuery({ queryKey: ["explainLive", date], enabled: eligible,
    queryFn: async () => mapHitRate(date, await txApi.hitRate(date)), staleTime: 300_000, refetchInterval: 300_000,
  });
  return { meeting: q.data ?? undefined, loading: eligible && q.isLoading, live: Boolean(q.data), error: q.error };
}

