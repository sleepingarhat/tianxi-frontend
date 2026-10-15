import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type DataScale = { meetings: number; races: number; rows: number; first: string | null; last: string | null; synced_at: string | null };

export const getRacingDataScale = createServerFn({ method: "GET" }).handler(async (): Promise<DataScale | null> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
  const { data, error } = await sb.rpc("racing_data_scale");
  if (error || !data) return null;
  return data as unknown as DataScale;
});
