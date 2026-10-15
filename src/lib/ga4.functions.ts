import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Ga4TrafficReport } from "@/lib/ga4.server";

type AuthContext = {
  supabase: { rpc: (name: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> };
  userId: string;
};

/** 監控端專用：Google Analytics 4 流量報告。只有 admin 可以讀取。 */
export const getGa4Traffic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Ga4TrafficReport> => {
    const ctx = context as unknown as AuthContext;
    const { data: isAdmin, error: roleError } = await ctx.supabase.rpc("has_role", {
      _user_id: ctx.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Forbidden：此帳號未獲授權進入監控端");

    const { fetchGa4Traffic } = await import("@/lib/ga4.server");
    return fetchGa4Traffic();
  });
