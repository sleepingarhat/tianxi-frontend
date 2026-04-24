/**
 * 天喜 API client · 三端共用
 *
 * 數據來源：
 *   - 公開 CSV artefacts: raw.githubusercontent.com/sleepingarhat/tianxi-database/main/data/...
 *   - Manifest: data/index.json (Option 2 產物)
 *   - 實時賠率: HKJC GraphQL endpoint
 *   - AI 對話: 後端 SSE streaming（待部署）
 */

export const endpoints = {
  githubRawBase:
    "https://raw.githubusercontent.com/sleepingarhat/tianxi-database/main",
  manifest: "/data/index.json",
  hkjcGraphql: "https://info.cld.hkjc.com/graphql/base/",
  aiChat: "/api/chat",         // 將來後端部署
  waitlist: "/api/waitlist",   // CF Workers + D1
} as const;

export type DataCategory =
  | "results"
  | "commentary"
  | "dividends"
  | "sectional_times"
  | "video_links"
  | "horse_profiles"
  | "horse_form_records"
  | "horse_trackwork"
  | "horse_injury"
  | "trainer_profiles"
  | "trainer_records"
  | "jockey_profiles"
  | "jockey_records"
  | "trial_results"
  | "trial_sessions"
  | "entries_upcoming"
  | "fixtures"
  | "elo_horse"
  | "elo_jockey"
  | "elo_trainer";

/** 攞公開 CSV · 三端都用 fetch */
export async function fetchCsv(path: string): Promise<string> {
  const url = `${endpoints.githubRawBase}${path.startsWith("/") ? path : "/" + path}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetchCsv ${path}: ${resp.status}`);
  return resp.text();
}

/** 攞 manifest · 得知 categories + 最新 file paths */
export async function fetchManifest(): Promise<unknown> {
  const resp = await fetch(
    `${endpoints.githubRawBase}${endpoints.manifest}`,
  );
  if (!resp.ok) throw new Error(`manifest: ${resp.status}`);
  return resp.json();
}
