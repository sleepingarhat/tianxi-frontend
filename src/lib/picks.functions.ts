// 天喜 · 全日預測（所有場次）
// 後端 /api/analyze/today-picks 對未認證訪客只回第一場，全日預測需帶管理員 token。
// Token 只存在伺服器端（TIANXI_ADMIN_TOKEN），永不落到瀏覽器。
import { createServerFn } from "@tanstack/react-start";

const WORKER_BASE = "https://tianxi-backend.tianxi-entertainment.workers.dev";

// 暫存：純轉發結果放記憶體，唔改內容。60 秒內直接回；60 秒–15 分鐘先回舊資料、背景更新。
const FRESH_MS = 60_000;
const STALE_MS = 15 * 60_000;
let picksCache: { at: number; data: any } | null = null;
let picksInflight: Promise<any> | null = null;

async function fetchTodayPicksUpstream() {
  const token = process.env["TIANXI_ADMIN_TOKEN"];
  const url = `${WORKER_BASE}/api/analyze/today-picks`;
  const res = await fetch(url, {
    headers: {
      "user-agent": "tianxi-web",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`預測服務回應異常（${res.status}）`);
  }
  if (json?.error && /賽馬日記錄不存在/.test(String(json.error))) {
    // 今日未有賽馬日：屬正常狀態，回空場次而唔係報錯
    const empty = { races: [], noMeeting: true, message: String(json.error) };
    picksCache = { at: Date.now(), data: empty };
    return empty;
  }
  if (!res.ok || json?.error) throw new Error(json?.error || `預測服務錯誤 ${res.status}`);
  picksCache = { at: Date.now(), data: json };
  return json;
}

function refreshPicks() {
  if (!picksInflight) {
    picksInflight = fetchTodayPicksUpstream().finally(() => {
      picksInflight = null;
    });
  }
  return picksInflight;
}

export const getTodayPicksAll = createServerFn({ method: "GET" }).handler(async () => {
  const age = picksCache ? Date.now() - picksCache.at : Infinity;
  if (picksCache && age < FRESH_MS) return picksCache.data as any;
  if (picksCache && age < STALE_MS) {
    refreshPicks().catch(() => {});
    return picksCache.data as any;
  }
  return (await refreshPicks()) as any;
});

/** 監控台用：可選強制重新運算（fresh=1，忽略快取） */
export const getOraclePicks = createServerFn({ method: "POST" })
  .inputValidator((data: { fresh?: boolean } | undefined) => ({ fresh: Boolean(data?.fresh) }))
  .handler(async ({ data }) => {
    const token = process.env["TIANXI_ADMIN_TOKEN"];
    const url = `${WORKER_BASE}/api/analyze/today-picks${data.fresh ? "?fresh=1" : ""}`;
    const res = await fetch(url, {
      headers: {
        "user-agent": "tianxi-web-admin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`預測服務回應異常（${res.status}）`);
    }
    if (!res.ok || json?.error) throw new Error(json?.error || `預測服務錯誤 ${res.status}`);
    return json as any;
  });

/** 回測工具：檔位因子倍數掃描（唯讀，唔會寫入生產設定） */
export const runDrawTune = createServerFn({ method: "POST" })
  .inputValidator((data: { from: string; to: string; scales: string }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data?.from ?? "")) throw new Error("from 格式錯");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data?.to ?? "")) throw new Error("to 格式錯");
    if (!/^[0-9,]{1,60}$/.test(data?.scales ?? "")) throw new Error("scales 格式錯");
    return data;
  })
  .handler(async ({ data }) => {
    const token = process.env["TIANXI_ADMIN_TOKEN"];
    const url = `${WORKER_BASE}/api/analyze/draw-tune?from=${data.from}&to=${data.to}&scales=${data.scales}`;
    const res = await fetch(url, {
      headers: {
        "user-agent": "tianxi-web-admin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`draw-tune 回應異常（${res.status}）`);
    }
    if (!res.ok || json?.error) throw new Error(json?.error || `draw-tune 錯誤 ${res.status}`);
    return json as any;
  });
