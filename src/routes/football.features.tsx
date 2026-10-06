import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { FootballNav } from "@/components/tx/FootballNav";
import { FootballCrest } from "@/components/tx/FootballCrest";
import { Card, Disclaimer, Empty, PageHead, SkeletonRows } from "@/components/tx/ui";
import { supabase } from "@/integrations/supabase/client";
import { teamZh } from "@/lib/teamZh";
import { hkDateTime } from "@/lib/hkTime";
import { useCrests } from "@/lib/footballCrests";
import { FACTORS, fmtFactor, type Led, type Snap } from "@/lib/footballFactors";

export const Route = createFileRoute("/football/features")({
  head: () => ({
    meta: [
      { title: "足球因子特徵表 · 天喜 TIANXI" },
      { name: "description", content: "逐場列出天喜凍結機率、外部模型、天氣、球證、長途、對賽往績、陣容同開盤價等因子，可自選排序。" },
      { property: "og:title", content: "足球因子特徵表 · 天喜 TIANXI" },
      { property: "og:description", content: "三十個賽前因子逐場排序，研究展示、唔改凍結預測。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const DEFAULT = ["pD", "gap", "lamT", "bD", "h2hD", "refY", "travel", "unav"];
const hkDay = (iso: string) => new Date(Date.parse(iso) + 8 * 3600_000).toISOString().slice(5, 10);

function Page() {
  const q = useQuery({
    queryKey: ["fbFeatures"],
    queryFn: async () => {
      const since = new Date(Date.now() - 14 * 86400_000).toISOString();
      const [led, snap] = await Promise.all([
        supabase.from("football_dual_ledger").select("match_key,div,home,away,kickoff_utc,p_final,p_a,p_b_d,lambda,prediction").gte("kickoff_utc", since).order("kickoff_utc"),
        supabase.from("football_lineup_snapshots").select("match_key,context,unavailable,lineups,bsd_prediction").gte("kickoff_utc", since),
      ]);
      const sm = new Map((snap.data ?? []).map((s) => [s.match_key, s]));
      return (led.data ?? []).map((l) => ({ ...l, snap: (sm.get(l.match_key) ?? null) as Snap }));
    },
  });
  const rows = q.data ?? [];
  const days = useMemo(() => [...new Set(rows.map((r) => hkDay(r.kickoff_utc)))].reverse(), [rows]);
  const [day, setDay] = useState<string | null>(null);
  const cur = day ?? days[0] ?? null;
  const [sel, setSel] = useState<string[]>(DEFAULT);
  const [sortKey, setSortKey] = useState("score");
  const getCrest = useCrests([...new Set(rows.map((r) => r.div))]);

  const list = rows.filter((r) => hkDay(r.kickoff_utc) === cur);
  const chosen = FACTORS.filter((f) => sel.includes(f.key));
  const vals = list.map((r) => Object.fromEntries(chosen.map((f) => [f.key, f.get(r as unknown as Led, r.snap)])) as Record<string, number | null>);
  // 綜合分：已選因子逐項標準化平均（只作排序，唔係預測）
  const stats = Object.fromEntries(chosen.map((f) => {
    const xs = vals.map((v) => v[f.key]).filter((x): x is number => x != null);
    const m = xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length || 1)) || 1;
    return [f.key, { m, sd }];
  }));
  const score = vals.map((v) => {
    const zs = chosen.map((f) => (v[f.key] == null ? null : (v[f.key]! - stats[f.key]!.m) / stats[f.key]!.sd)).filter((z): z is number => z != null);
    return zs.length ? zs.reduce((a, b) => a + b, 0) / zs.length : null;
  });
  const order = list.map((_, i) => i).sort((a, b) => {
    const va = sortKey === "score" ? score[a] : vals[a]![sortKey];
    const vb = sortKey === "score" ? score[b] : vals[b]![sortKey];
    return (vb ?? -1e9) - (va ?? -1e9);
  });
  const groups = [...new Set(FACTORS.map((f) => f.group))];

  return (
    <AppShell page="football">
      <FootballNav />
      <PageHead en="Factor Ranking" title="因子特徵表" desc="逐場列出天喜凍結機率、外部模型、天氣、球證、長途、對賽往績、陣容同開盤價；可自選因子即場排序。全部屬賽前資料，研究展示，權重 0。" />

      <Card title="選擇賽日" en="Select date">
        {days.length ? (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {days.map((d) => (
              <button key={d} onClick={() => setDay(d)} className={`shrink-0 rounded-[8px] border px-3 py-1.5 font-mono-tx text-[12px] ${d === cur ? "border-gold-strong bg-gold-bg font-bold text-ink" : "border-hairline bg-paper text-ink-2"}`}>{d}</button>
            ))}
          </div>
        ) : q.isLoading ? <SkeletonRows rows={1} /> : <Empty label="近 14 日未有鎖定場次" />}
      </Card>

      <Card title="因子選項" en="Factors">
        <p className="mb-2 text-[11px] text-ink-3">撳一下加入／移除；綜合分＝已選因子標準化平均，只用嚟排序，唔係預測。已選 {sel.length}/{FACTORS.length}</p>
        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-1 text-[10px] font-bold tracking-[0.12em] text-ink-3">{g}</p>
              <div className="flex flex-wrap gap-1.5">
                {FACTORS.filter((f) => f.group === g).map((f) => {
                  const on = sel.includes(f.key);
                  return (
                    <button key={f.key} onClick={() => setSel(on ? sel.filter((k) => k !== f.key) : [...sel, f.key])}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${on ? "border-gold-strong bg-gold-bg text-ink" : "border-hairline bg-paper text-ink-3"}`}>
                      {f.label}{on ? " ×" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="逐場排序" en={`${list.length} matches`}>
        {q.isLoading ? <SkeletonRows rows={5} /> : list.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[12px]">
              <thead>
                <tr className="border-b border-hairline text-[10px] text-ink-3">
                  <th className="sticky left-0 bg-paper py-2 text-left">場次</th>
                  {[{ key: "score", label: "綜合分" }, ...chosen].map((f) => (
                    <th key={f.key} className="px-1.5 py-2 text-right">
                      <button onClick={() => setSortKey(f.key)} className={sortKey === f.key ? "font-bold text-ink" : ""}>{f.label}{sortKey === f.key ? " ▼" : ""}</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.map((i) => {
                  const r = list[i]!;
                  const h = teamZh(r.div, r.home), a = teamZh(r.div, r.away);
                  return (
                    <tr key={r.match_key} className="border-b border-hairline last:border-0">
                      <td className="sticky left-0 max-w-[10rem] bg-paper py-1.5 pr-2">
                        <Link to="/football/match/$matchKey" params={{ matchKey: r.match_key }} className="block">
                          <span className="flex items-center gap-1"><FootballCrest name={h} src={getCrest(r.div, r.home)} size={14} /><b className="truncate text-ink">{h}</b></span>
                          <span className="flex items-center gap-1"><FootballCrest name={a} src={getCrest(r.div, r.away)} size={14} /><b className="truncate text-ink">{a}</b></span>
                          <small className="text-[9px] text-ink-3">{r.div} · {hkDateTime(r.kickoff_utc)}</small>
                        </Link>
                      </td>
                      <td className="px-1.5 text-right tabnum font-mono-tx font-bold text-ink">{score[i] == null ? "–" : score[i]!.toFixed(2)}</td>
                      {chosen.map((f) => <td key={f.key} className="px-1.5 text-right tabnum font-mono-tx text-ink-2">{fmtFactor(f, vals[i]![f.key] ?? null)}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-[10px] text-ink-3">外部、情境、球證、對賽、陣容欄由 2026-09-30 起 T−60 快照累積，舊場次顯示「–」。開盤價只記帳，唔入模型。</p>
      </Card>
      <Disclaimer extra="因子表屬研究展示，唔改凍結預測、指紋或正式戰績。唔提供投注建議。" />
    </AppShell>
  );
}
