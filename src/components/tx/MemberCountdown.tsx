import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FREE_STAGE_GOAL_MEMBERS } from "@/lib/freeStage";

/** 開閘倒數：以已註冊人數計，滿 500 人即開閘。 */
export function MemberCountdown() {
  const { data: total } = useQuery({
    queryKey: ["public-member-count"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("public_member_count");
      if (error) throw error;
      return Number(data ?? 0);
    },
    refetchInterval: 60_000,
  });
  if (total === undefined) return <div className="h-[52px]" aria-hidden />;
  const remaining = Math.max(0, FREE_STAGE_GOAL_MEMBERS - total);
  const pct = Math.min(100, (total / FREE_STAGE_GOAL_MEMBERS) * 100);
  return (
    <div className="mt-4 max-w-md" aria-live="polite">
      <div className="flex items-baseline justify-between gap-3 text-[12px]">
        <span>已註冊 <strong className="tabnum text-[16px] text-gold-strong">{total.toLocaleString()}</strong> ／ {FREE_STAGE_GOAL_MEMBERS} 人</span>
        <span className="whitespace-nowrap font-bold text-gold-strong">{remaining > 0 ? `尚欠 ${remaining} 人開閘` : "收費閘已開"}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-deep-fg/15">
        <div className="h-full rounded-full bg-gold-strong transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
