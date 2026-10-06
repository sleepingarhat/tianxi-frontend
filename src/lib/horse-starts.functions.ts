// 天喜 · 馬匹出賽次數（少仗紅燈用）
// 只讀後端馬匹檔嘅 totalStarts，唔碰模型、唔改任何預測數值。
import { createServerFn } from "@tanstack/react-start";

const WORKER_BASE = "https://tianxi-backend.tianxi-entertainment.workers.dev";

export const getHorseStarts = createServerFn({ method: "POST" })
  .inputValidator((data: { ids?: unknown } | undefined) => {
    const raw = Array.isArray(data?.ids) ? data!.ids : [];
    const ids = Array.from(
      new Set(
        raw
          .map((v) => String(v))
          .filter((v) => /^horse_[A-Za-z0-9]+$/.test(v)),
      ),
    ).slice(0, 60);
    return { ids };
  })
  .handler(async ({ data }) => {
    const entries = await Promise.all(
      data.ids.map(async (id) => {
        try {
          const res = await fetch(`${WORKER_BASE}/api/horses/${encodeURIComponent(id)}`, {
            headers: { "user-agent": "tianxi-web" },
          });
          if (!res.ok) return [id, null] as const;
          const json: any = await res.json();
          const n = Number(json?.totalStarts);
          return [id, Number.isFinite(n) ? n : null] as const;
        } catch {
          return [id, null] as const;
        }
      }),
    );
    const starts: Record<string, number | null> = {};
    for (const [id, n] of entries) starts[id] = n;
    return { starts };
  });
