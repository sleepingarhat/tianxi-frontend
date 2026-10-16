import { createFileRoute } from "@tanstack/react-router";

const ORIGIN = "https://tianxi.racing";
const PATHS = [
  "/", "/predictor", "/results", "/schedule", "/track-record", "/value-trend", "/prediction-vs-result",
  "/strategy-pnl", "/freeze-ledger", "/racing-health", "/explain", "/engine", "/engine/audit",
  "/engine/backtest", "/engine/features", "/engine/monitor", "/engine/residuals", "/pool-odds",
  "/horse", "/race", "/encyclopedia", "/manual", "/features", "/membership", "/dev-log", "/media-credits",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PATHS.map((p) => `  <url><loc>${ORIGIN}${p}</loc></url>`).join("\n")}\n</urlset>\n`;
        return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
