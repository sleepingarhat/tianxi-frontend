import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildFootballSeasonReport, footballReportCsv, type FootballEvaluationRow } from "@/lib/football-season-report";

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

const reportSchema = z.object({ format: z.enum(["json", "csv"]).default("json") });

export const getFootballSeasonReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => reportSchema.parse(input))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AdminContext;
    await assertAdmin(ctx);
    const ledger: Omit<FootballEvaluationRow, "ftr">[] = [];
    for (let from = 0; ; from += 1000) {
      const result = await ctx.supabase
        .from("football_dual_ledger")
        .select("match_key,version,kickoff_utc,prediction,p_final,pick_odds,stake")
        .order("kickoff_utc", { ascending: false })
        .range(from, from + 999);
      if (result.error) throw new Error("無法讀取足球鎖定帳");
      const page = (result.data ?? []) as Omit<FootballEvaluationRow, "ftr">[];
      ledger.push(...page);
      if (page.length < 1000) break;
    }
    const token = process.env["GITHUB_TOKEN"];
    if (!token) throw new Error("未設定足球賽果讀取權限");
    const months = [...new Set(ledger.map((row) => row.kickoff_utc.slice(0, 7)))];
    const results: Record<string, { result?: { ftr?: FootballEvaluationRow["ftr"] } | null }> = {};
    await Promise.all(months.map(async (month) => {
      const path = `data/predictions/log/${month}.json`;
      const response = await fetch(`https://api.github.com/repos/sleepingarhat/tianxi-football/contents/${path}`, {
        headers: { Accept: "application/vnd.github.raw+json", Authorization: `Bearer ${token}`, "User-Agent": "tianxi-web-admin" },
      });
      if (response.status === 404) return;
      if (!response.ok) throw new Error(`足球賽果 ${month} 回應 ${response.status}`);
      const payload = await response.json() as { matches?: typeof results };
      Object.assign(results, payload.matches ?? {});
    }));
    const rows = ledger.map((row) => ({ ...row, ftr: results[row.match_key]?.result?.ftr ?? null }));
    const report = buildFootballSeasonReport(rows);
    const generatedAt = new Date().toISOString();
    return data.format === "csv"
      ? { format: "csv" as const, generatedAt, content: footballReportCsv(report) }
      : { format: "json" as const, generatedAt, rows: report };
  });
