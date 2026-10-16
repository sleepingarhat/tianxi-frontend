/** 伺服器專用：重型公開計算結果暫存（只存可公開嘅衍生數據）。過期先重算，失敗時用舊結果。 */
export async function cached<T>(key: string, ttlMs: number, compute: () => Promise<T>): Promise<T> {
  let admin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"] | null = null;
  let stale: T | null = null;
  try {
    admin = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
    const { data } = await admin.from("computed_cache").select("payload, computed_at").eq("key", key).maybeSingle();
    if (data) {
      stale = data.payload as T;
      if (Date.now() - new Date(data.computed_at).getTime() < ttlMs) return stale;
    }
  } catch { /* 暫存讀取失敗就直接計 */ }
  try {
    const fresh = await compute();
    if (admin) await admin.from("computed_cache").upsert({ key, payload: fresh as never, computed_at: new Date().toISOString() }).then(() => undefined, () => undefined);
    return fresh;
  } catch (e) {
    if (stale !== null) return stale;
    throw e;
  }
}
export const CACHE_TTL = 3 * 60 * 60 * 1000;
