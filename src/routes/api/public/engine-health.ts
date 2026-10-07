import { createFileRoute } from "@tanstack/react-router";

// 引擎健康公開代理：主站自訂網域 → Worker /api/analyze/engine-health。
// 純轉發，唔改內容、唔碰凍結預測。
const WORKER_BASE = "https://tianxi-backend.tianxi-entertainment.workers.dev";

export const Route = createFileRoute("/api/public/engine-health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await fetch(`${WORKER_BASE}/api/analyze/engine-health`, {
            headers: { Accept: "application/json" },
          });
          const text = await res.text();
          if (res.ok) {
            try {
              const payload = JSON.parse(text) as Record<string, any>;
              const { recordModelGates } = await import("@/lib/ops-history.server");
              await recordModelGates(payload);
            } catch {
              // 健康回應仍照常回傳；歷史寫入失敗不可阻塞監控。
            }
          } else {
            const { writeOpsEvent } = await import("@/lib/ops-history.server");
            await writeOpsEvent({ eventKey: `api:engine-health:${res.status}:${new Date().toISOString().slice(0, 13)}`, kind: "api_error", severity: "error", source: "engine-health", route: "/api/public/engine-health", statusCode: res.status, message: `上游回應 ${res.status}` });
          }
          return new Response(text, {
            status: res.status,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "public, max-age=60, s-maxage=120",
            },
          });
        } catch (err) {
          const { safeErrorMessage, writeOpsEvent } = await import("@/lib/ops-history.server");
          await writeOpsEvent({ eventKey: `api:engine-health:network:${new Date().toISOString().slice(0, 13)}`, kind: "api_error", severity: "error", source: "engine-health", route: "/api/public/engine-health", statusCode: 502, message: safeErrorMessage(err) });
          return new Response(
            JSON.stringify({ ok: false, error: "engine health upstream unavailable" }),
            { status: 502, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
