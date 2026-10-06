import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://raw.githubusercontent.com/sleepingarhat/hk-mark-six-2002-now/main/data/";

const FILES: Record<string, string> = {
  latest: "latest.json",
  history: "mark-six.json",
};

export const Route = createFileRoute("/api/public/marksix-data")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("file") ?? "latest";
        const file = FILES[key];
        if (!file) {
          return new Response(JSON.stringify({ ok: false, error: "unknown file" }), {
            status: 400,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        }
        try {
          const res = await fetch(BASE + file, {
            headers: { "user-agent": "tianxi-site" },
          });
          if (!res.ok) throw new Error(`upstream ${res.status}`);
          let text = await res.text();
          if (key === "history") {
            // 前端統計只用到期數、日期同號碼；剪走其餘欄位可省一大半流量（手機網絡易斷）
            const rows = JSON.parse(text) as Array<{
              date?: string;
              draw?: string;
              numbers?: number[];
              special?: number | null;
            }>;
            text = JSON.stringify(
              rows
                .filter((r) => r && r.date && Array.isArray(r.numbers))
                .map((r) => ({
                  date: r.date,
                  draw: r.draw ?? "",
                  numbers: r.numbers,
                  special: r.special ?? null,
                })),
            );
          }
          return new Response(text, {
            headers: {
              "content-type": "application/json; charset=utf-8",
              // edge/browser cached so repeat visits skip the ~1MB GitHub download
              "cache-control": "public, max-age=600, s-maxage=1800, stale-while-revalidate=86400",
              "access-control-allow-origin": "*",
            },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "unknown" }),
            {
              status: 502,
              headers: {
                "content-type": "application/json; charset=utf-8",
                "access-control-allow-origin": "*",
              },
            },
          );
        }
      },
    },
  },
});
