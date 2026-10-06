// 內部回測代理：檔位因子倍數掃描（唯讀，token 只存在伺服器端）
import { createFileRoute } from "@tanstack/react-router";

const WORKER_BASE = "https://tianxi-backend.tianxi-entertainment.workers.dev";

export const Route = createFileRoute("/api/public/draw-tune")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const from = url.searchParams.get("from") ?? "";
        const to = url.searchParams.get("to") ?? "";
        const scales = url.searchParams.get("scales") ?? "";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
          return Response.json({ error: "from/to 格式錯" }, { status: 400 });
        }
        if (!/^[0-9,]{1,60}$/.test(scales)) {
          return Response.json({ error: "scales 格式錯" }, { status: 400 });
        }
        const token = process.env["TIANXI_ADMIN_TOKEN"];
        const res = await fetch(
          `${WORKER_BASE}/api/analyze/draw-tune?from=${from}&to=${to}&scales=${scales}`,
          {
            headers: {
              "user-agent": "tianxi-web-admin",
              ...(token ? { authorization: `Bearer ${token}` } : {}),
            },
          },
        );
        const text = await res.text();
        return new Response(text, {
          status: res.status,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
