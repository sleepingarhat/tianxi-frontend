import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const querySchema = z.object({
  days: z.number().int().min(1).max(365).default(30),
  limit: z.number().int().min(1).max(1000).default(500),
});

type AdminContext = { supabase: { from: (table: string) => any }; userId: string };

async function assertAdmin(context: AdminContext) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden：此帳號未獲授權進入監控端");
}

export const getOpsEventHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => querySchema.parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AdminContext;
    await assertAdmin(ctx);
    const since = new Date(Date.now() - data.days * 86_400_000).toISOString();
    const result = await ctx.supabase
      .from("ops_event_history")
      .select("id,event_key,occurred_at,kind,severity,source,route,status_code,message,model_version,gate_key,gate_status,metadata")
      .gte("occurred_at", since)
      .order("occurred_at", { ascending: false })
      .limit(data.limit);
    if (result.error) throw new Error("無法讀取持久日誌");
    return result.data ?? [];
  });
