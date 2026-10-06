import { useQuery } from "@tanstack/react-query";

import { Card, Stat, StatGrid } from "@/components/tx/ui";
import { supabase } from "@/integrations/supabase/client";

type Snap = { bsd_latency_ms: number | null; lineups: { home?: { players?: unknown[] }; away?: { players?: unknown[] } } | null; error: string | null };

/** BSD 陣容快照穩定性：回應時間、陣容完整度、完場對比準確率（每 5 分鐘更新） */
export function BsdMonitorCard() {
  const q = useQuery({
    queryKey: ["bsdMonitor"],
    refetchInterval: 300_000,
    queryFn: async () => {
      const [s, t] = await Promise.all([
        supabase.from("football_lineup_snapshots").select("bsd_latency_ms,lineups,error").order("captured_at", { ascending: false }).limit(500),
        supabase.from("football_lineup_settle").select("home_hits,away_hits,home_formation_ok,away_formation_ok").limit(1000),
      ]);
      return { snaps: (s.data ?? []) as unknown as Snap[], settle: t.data ?? [] };
    },
  });
  const snaps = q.data?.snaps ?? [];
  const lat = snaps.map((x) => x.bsd_latency_ms).filter((v): v is number => v != null).sort((a, b) => a - b);
  const med = lat.length ? lat[Math.floor(lat.length / 2)] : null;
  const full = snaps.filter((x) => (x.lineups?.home?.players?.length ?? 0) >= 11 && (x.lineups?.away?.players?.length ?? 0) >= 11).length;
  const set = q.data?.settle ?? [];
  const hits = set.reduce((a, r) => a + (r.home_hits ?? 0) + (r.away_hits ?? 0), 0);
  const form = set.reduce((a, r) => a + (r.home_formation_ok ? 1 : 0) + (r.away_formation_ok ? 1 : 0), 0);
  return (
    <Card title="BSD 陣容快照監控" en="Snapshot health · research">
      <StatGrid cols={2}>
        <Stat label="快照場數" value={`${snaps.length}`} sub={`失敗 ${snaps.filter((x) => x.error).length}`} />
        <Stat label="回應時間中位" value={med != null ? `${med} ms` : "–"} sub={lat.length ? `最慢 ${lat[lat.length - 1]} ms` : "未有樣本"} />
        <Stat label="陣容完整度" value={snaps.length ? `${Math.round((full / snaps.length) * 100)}%` : "–"} sub="主客各 11 人" />
        <Stat label="正選命中率" value={set.length ? `${((hits / (set.length * 22)) * 100).toFixed(1)}%` : "–"} sub={set.length ? `${set.length} 場 · 陣式啱 ${Math.round((form / (set.length * 2)) * 100)}%` : "等完場對比"} />
      </StatGrid>
      <p className="mt-2 text-[10px] text-ink-3">研究軌：T−6h 存快照、完場兩個鐘後對官方正選。儲夠一季先跑「預計缺陣主力」研究閘，唔入正式戰績。</p>
    </Card>
  );
}
