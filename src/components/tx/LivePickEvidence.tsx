import { useQuery } from "@tanstack/react-query";
import { txApi } from "@/lib/tx-api";
import { Empty, Pill } from "./ui";

export function LivePickEvidence({ raceId, horseId, name }: { raceId?: string; horseId?: string; name: string }) {
  const q = useQuery({ queryKey: ["live-pick-evidence", raceId, horseId], enabled: Boolean(raceId && horseId), staleTime: 300_000,
    queryFn: () => txApi.explain(raceId ?? "", horseId ?? ""),
  });
  // The current API only returns rank and probabilities, not locked Elo/factor contributions.
  return <details className="border-b border-hairline py-2">
    <summary className="cursor-pointer text-[12px] font-bold text-ink">{name} <span className="float-right text-[10px] text-gold">解釋資料 ＋</span></summary>
    <div className="mt-2 space-y-2 text-[11px] leading-relaxed text-ink-2">
      <Pill>即時接口 · 非凍結因子</Pill>
      {q.isLoading ? <p>讀取解釋資料…</p> : q.error ? <p className="text-lose">逐匹解釋暫時未能讀取；凍結四揀不受影響。</p> : !raceId ? <Empty label="排位資料未有正式場次識別，解釋待提供" /> : <p>現有解釋接口只返回排名及機率，未提供馬／騎師／練馬師 Elo（0.7／0.2／0.1）與檔位、負磅的鎖點貢獻。唔以賽後 Elo 或代理分數補作凍結理由。</p>}
    </div>
  </details>;
}