// 天喜 · 內部監控台：伺服器端代理到 tianxi-backend Worker 的 /admin/api/*
// ADMIN_TOKEN 只存在伺服器端（TIANXI_ADMIN_TOKEN 密鑰），永不落到瀏覽器。
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const WORKER_BASE = "https://tianxi-backend.tianxi-entertainment.workers.dev";

// 只允許監控台實際用到的路徑（含讀取與寫入操作）
const ALLOWED_GET = [
  "/admin/api/ping",
  "/admin/api/status",
  "/admin/api/gaps",
  "/admin/api/coverage",
  "/admin/api/feature-audit",
  "/admin/api/alerts",
  "/admin/api/runs",
  "/admin/api/meetings",
  "/admin/api/lgb-predictions",
  "/admin/api/d1-maintenance",
  "/admin/api/entries-upcoming-export",
  "/admin/api/jockey-elo-debug",
  "/admin/api/seed-missing-jockey-elo",
];

const ALLOWED_POST = [
  "/admin/api/dispatch",
  "/admin/api/d1-maintenance",
  "/admin/api/set-alpha",
  "/admin/api/sql-read",
  "/admin/api/refresh-race-dividends",
  "/admin/api/fix-dividend-pool-swap",
  "/admin/api/seed-missing-jockey-elo",
  "/admin/api/elo-backfill-from-results",
  "/admin/api/cleanup-duplicate-meetings",
  "/admin/api/data-housekeeping",
  "/admin/api/migrate-prediction-log-lgb",
  "/admin/api/migrate-entries-post-time",
  "/admin/api/lgb-predictions",
];

function splitPath(raw: string) {
  const qIndex = raw.indexOf("?");
  return {
    pathname: qIndex === -1 ? raw : raw.slice(0, qIndex),
    search: qIndex === -1 ? "" : raw.slice(qIndex),
  };
}

function assertAllowed(raw: string, allowed: string[]) {
  const { pathname, search } = splitPath(raw);
  if (!allowed.includes(pathname)) throw new Error(`路徑未允許：${pathname}`);
  if (search.length > 400) throw new Error("查詢字串過長");
  return pathname + search;
}

type AdminContext = { supabase: { from: (t: string) => any }; userId: string };

async function assertAdmin(context: AdminContext) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("無法驗證管理員身份");
  if (!data) throw new Error("Forbidden：此帳號未獲授權進入監控台");
}

async function callWorker(path: string, init?: RequestInit) {
  const token = process.env["TIANXI_ADMIN_TOKEN"];
  if (!token) throw new Error("伺服器未設定 TIANXI_ADMIN_TOKEN");
  const res = await fetch(WORKER_BASE + path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      authorization: `Bearer ${token}`,
      "user-agent": "tianxi-web-admin",
    },
  });
  const text = await res.text();
  let payload: Record<string, any> | null = null;
  try {
    payload = JSON.parse(text) as Record<string, any>;
  } catch {
    payload = { raw: text.slice(0, 2000) };
  }
  return { status: res.status, ok: res.ok, payload: payload as Record<string, any> };
}

/** 目前登入者是否為管理員（用於 UI 顯示） */
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context as unknown as AdminContext).supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", (context as unknown as AdminContext).userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: Boolean(data) };
  });

export const adminGet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { path: string }) => {
    if (!data || typeof data.path !== "string") throw new Error("path 必填");
    return { path: data.path };
  })
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AdminContext;
    await assertAdmin(ctx);
    return callWorker(assertAllowed(data.path, ALLOWED_GET));
  });

export const adminPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { path: string; body?: unknown }) => {
    if (!data || typeof data.path !== "string") throw new Error("path 必填");
    return { path: data.path, body: data.body ?? {} };
  })
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AdminContext;
    await assertAdmin(ctx);
    return callWorker(assertAllowed(data.path, ALLOWED_POST), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data.body ?? {}),
    });
  });
