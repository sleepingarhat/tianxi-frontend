import { createFileRoute } from "@tanstack/react-router";

// H-R2 研究報告公開代理：tianxi-backend 倉 reports/research/h-r2/latest.json。
// 純轉發唯讀研究報告（凍結 p vs 扣水 q、closeGap 分位樣本），唔改任何預測。
const REPORT = "https://raw.githubusercontent.com/sleepingarhat/tianxi-backend/main/reports/research/h-r2/latest.json";

export const Route = createFileRoute("/api/public/horse-hr2")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await fetch(REPORT, { headers: { Accept: "application/json" } });
          const text = await res.text();
          return new Response(text, {
            status: res.status,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "public, max-age=300, s-maxage=600",
            },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ ok: false, error: "h-r2 report unavailable", detail: String(err) }),
            { status: 502, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
