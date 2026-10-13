import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MemberAccountStats = {
  total: number;
  confirmed: number;
  last7: number;
  last30: number;
};


type RpcClient = {
  rpc: (name: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
};
type AuthContext = { supabase: RpcClient; userId: string };

/** 監控端專用：真實登記帳戶人數。DB 函數本身亦會再驗一次 admin，雙重把關。 */
export const getMemberAccountStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthContext;
    const { data: isAdmin, error: roleError } = await ctx.supabase.rpc("has_role", {
      _user_id: ctx.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Forbidden：此帳號未獲授權進入監控端");

    const { data, error } = await ctx.supabase.rpc("member_account_stats");
    if (error) throw new Error("無法讀取會員人數");

    const row = (data ?? {}) as Partial<MemberAccountStats>;
    return {
      total: Number(row.total ?? 0),
      confirmed: Number(row.confirmed ?? 0),
      last7: Number(row.last7 ?? 0),
      last30: Number(row.last30 ?? 0),
    } satisfies MemberAccountStats;
  });
