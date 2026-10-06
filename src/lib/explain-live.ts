// 解釋層即場延伸（唯讀）：靜態凍結窗截到 EXPLAIN_GLOBAL.window.to，之後嘅賽日即場讀 hit-rate API。
// 只讀已鎖四揀同已入帳頭 4，唔重算排名、唔寫任何紀錄。今日（港時）未完場一律唔出。
import { useQuery } from "@tanstack/react-query";

import { EXPLAIN_GLOBAL, explainMeeting, type ExplainMeeting, type ExplainRace, type OverlapStats } from "@/lib/explain-data";
import { hkToday } from "@/lib/hkTime";
import { txApi } from "@/lib/tx-api";

const bandOf = (d: number | null) => (d == null ? null : d <= 1200 ? "短途" : d <= 1650 ? "一哩" : d <= 2000 ? "中途" : "長途");

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapHitRate(date: string, j: any): ExplainMeeting | null {
  const races: any[] = Array.isArray(j?.races) ? j.races : [];
  const ok = races.filter((r) => Array.isArray(r.predictedTop4) && r.predictedTop4.length && Array.isArray(r.actualTop4) && r.actualTop4.length >= 4);
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

/** 逐場：靜態凍結有就用靜態；否則過咗今日（港時）先讀 API。 */
export function useExplainMeeting(date: string) {
  const local = explainMeeting(date);
  const eligible = !local && /^\d{4}-\d{2}-\d{2}$/.test(date) && date < hkToday();
  const q = useQuery({
    queryKey: ["explainLive", date],
    enabled: eligible,
    queryFn: async () => mapHitRate(date, await txApi.hitRate(date)),
    staleTime: 300_000,
  });
  return { meeting: local ?? q.data ?? undefined, loading: eligible && q.isLoading, live: !local && !!q.data };
}

export type LiveExtension = {
  meetings: { date: string; venue: string | null; races: number; avg: number }[];
  counts: number[]; // 只中 0..4
  combined: OverlapStats;
  to: string;
};

/** 靜態窗之後嘅已完結賽日，逐日讀 hit-rate，合併入全窗主尺。 */
export function useLiveExtension() {
  return useQuery({
    queryKey: ["explainLiveExt", EXPLAIN_GLOBAL.window.to],
    staleTime: 300_000,
    queryFn: async (): Promise<LiveExtension> => {
      const roll = await txApi.hitRateRollup(120);
      const today = hkToday();
      const dates: string[] = (roll?.perMeeting ?? [])
        .map((m: any) => m.date as string)
        .filter((d: string) => d > EXPLAIN_GLOBAL.window.to && d < today)
        .sort();
      const metas = await Promise.all(dates.map(async (d) => mapHitRate(d, await txApi.hitRate(d).catch(() => null))));
      const counts = [0, 0, 0, 0, 0];
      const meetings: LiveExtension["meetings"] = [];
      for (const m of metas) {
        if (!m) continue;
        const ov = m.races.map((r) => r.overlap4).filter((x): x is number => x != null);
        ov.forEach((x) => (counts[Math.max(0, Math.min(4, x))]! += 1));
        meetings.push({ date: m.date, venue: m.venue, races: ov.length, avg: ov.length ? ov.reduce((a, b) => a + b, 0) / ov.length : 0 });
      }
      const base = EXPLAIN_GLOBAL.headlineOverlap;
      const all = [0, 1, 2, 3, 4].map((k) => (base.exactly[String(k)]?.count ?? 0) + counts[k]!);
      const n = all.reduce((a, b) => a + b, 0);
      const sum = all.reduce((a, c, k) => a + c * k, 0);
      const exactly: OverlapStats["exactly"] = {};
      all.forEach((c, k) => (exactly[String(k)] = { count: c, rate: n ? c / n : 0 }));
      return {
        meetings,
        counts,
        combined: { n, avgOverlap: n ? sum / n : 0, exactly },
        to: meetings.length ? meetings[meetings.length - 1]!.date : EXPLAIN_GLOBAL.window.to,
      };
    },
  });
}
