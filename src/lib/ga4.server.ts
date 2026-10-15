/**
 * Google Analytics 4 Data API 讀取層（server-only）。
 * 用服務帳戶 JSON 金鑰簽 RS256 JWT 換 access token，再呼叫 runReport。
 * 金鑰只存喺 GA4_SERVICE_ACCOUNT_JSON secret，永不入 client bundle。
 */

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

export type Ga4DailyPoint = { date: string; users: number; sessions: number; views: number };
export type Ga4Source = { source: string; users: number; sessions: number; avgDurationSec: number; bounceRate: number };
export type Ga4Page = { path: string; title: string; views: number; users: number; avgDurationSec: number };

export type Ga4TrafficReport = {
  today: { users: number; sessions: number; views: number };
  last7: { users: number; sessions: number; views: number; avgDurationSec: number; bounceRate: number };
  last30: { users: number; sessions: number; views: number; avgDurationSec: number; bounceRate: number };
  daily: Ga4DailyPoint[];
  sources: Ga4Source[];
  pages: Ga4Page[];
  realtimeUsers: number | null;
  /** 近 30 日：首頁訪客、註冊頁訪客、各轉換事件次數 */
  funnel: { homeUsers: number; authUsers: number; events: Record<string, number> };
  fetchedAt: string;
};

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: sa.token_uri ?? "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${payload}`));
  const jwt = `${header}.${payload}.${base64url(sig)}`;

  const resp = await fetch(sa.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  if (!resp.ok) throw new Error(`Google 授權失敗 [${resp.status}]：${await resp.text()}`);
  const json = (await resp.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Google 授權回應缺少 access_token");
  return json.access_token;
}

type RunReportRow = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };

async function runReport(
  propertyId: string,
  token: string,
  body: Record<string, unknown>,
): Promise<RunReportRow[]> {
  const resp = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`GA4 報告失敗 [${resp.status}]：${await resp.text()}`);
  const json = (await resp.json()) as { rows?: RunReportRow[] };
  return json.rows ?? [];
}

async function runRealtimeReport(propertyId: string, token: string): Promise<number | null> {
  try {
    const resp = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ metrics: [{ name: "activeUsers" }], dimensionFilter: HOST_FILTER }),
    });
    if (!resp.ok) return null;
    const json = (await resp.json()) as { rows?: RunReportRow[] };
    return Number(json.rows?.[0]?.metricValues?.[0]?.value ?? 0);
  } catch {
    return null;
  }
}

const num = (row: RunReportRow, i: number) => Number(row.metricValues?.[i]?.value ?? 0);

/** 只計正式站網域，避免同一 GA4 資源入面其他網站嘅數據混入 */
const HOST_FILTER = {
  filter: { fieldName: "hostName", inListFilter: { values: ["tianxi.racing", "www.tianxi.racing"] } },
};

function summarize(rows: Ga4DailyPoint[]) {
  return {
    users: rows.reduce((a, r) => a + r.users, 0),
    sessions: rows.reduce((a, r) => a + r.sessions, 0),
    views: rows.reduce((a, r) => a + r.views, 0),
  };
}

export async function fetchGa4Traffic(): Promise<Ga4TrafficReport> {
  const raw = process.env["GA4_SERVICE_ACCOUNT_JSON"];
  const propertyId = process.env["GA4_PROPERTY_ID"];
  if (!raw || !propertyId) throw new Error("未設定 GA4 服務帳戶金鑰或資源 ID");
  const sa = JSON.parse(raw) as ServiceAccount;
  const token = await getAccessToken(sa);

  const dailyRows = await runReport(propertyId, token, {
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
    dimensionFilter: HOST_FILTER,
    limit: 40,
  });
  const daily: Ga4DailyPoint[] = dailyRows.map((r) => ({
    date: r.dimensionValues?.[0]?.value ?? "",
    users: num(r, 0),
    sessions: num(r, 1),
    views: num(r, 2),
  }));

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const sevenDaysAgoStr = new Date(Date.now() - 6 * 86400_000).toISOString().slice(0, 10).replace(/-/g, "");

  const engRows = await runReport(propertyId, token, {
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "averageSessionDuration" }, { name: "bounceRate" }],
    dimensionFilter: HOST_FILTER,
    limit: 40,
  });
  const engByDate = new Map(engRows.map((r) => [r.dimensionValues?.[0]?.value ?? "", { dur: num(r, 0), bounce: num(r, 1) }]));
  const avgOver = (from: string) => {
    const sel = daily.filter((d) => d.date >= from);
    const w = sel.reduce((a, d) => a + d.sessions, 0);
    if (!w) return { avgDurationSec: 0, bounceRate: 0 };
    let dur = 0, bounce = 0;
    for (const d of sel) {
      const e = engByDate.get(d.date);
      dur += (e?.dur ?? 0) * d.sessions;
      bounce += (e?.bounce ?? 0) * d.sessions;
    }
    return { avgDurationSec: dur / w, bounceRate: bounce / w };
  };

  const sourceRows = await runReport(propertyId, token, {
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "sessionSourceMedium" }],
    metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "averageSessionDuration" }, { name: "bounceRate" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    dimensionFilter: HOST_FILTER,
    limit: 10,
  });
  const sources: Ga4Source[] = sourceRows.map((r) => ({
    source: r.dimensionValues?.[0]?.value ?? "(不明)",
    users: num(r, 0),
    sessions: num(r, 1),
    avgDurationSec: num(r, 2),
    bounceRate: num(r, 3),
  }));

  const pageRows = await runReport(propertyId, token, {
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "averageSessionDuration" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    dimensionFilter: HOST_FILTER,
    limit: 15,
  });
  const pages: Ga4Page[] = pageRows.map((r) => ({
    path: r.dimensionValues?.[0]?.value ?? "/",
    title: r.dimensionValues?.[1]?.value ?? "",
    views: num(r, 0),
    users: num(r, 1),
    avgDurationSec: num(r, 2),
  }));

  const realtimeUsers = await runRealtimeReport(propertyId, token);

  const eventRows = await runReport(propertyId, token, {
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      andGroup: {
        expressions: [
          HOST_FILTER,
          { filter: { fieldName: "eventName", inListFilter: { values: ["sign_up_start", "sign_up", "login", "begin_checkout", "purchase"] } } },
        ],
      },
    },
  });
  const events: Record<string, number> = {};
  for (const r of eventRows) events[r.dimensionValues?.[0]?.value ?? ""] = num(r, 0);
  const pathUsers = await runReport(propertyId, token, {
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "activeUsers" }],
    dimensionFilter: {
      andGroup: {
        expressions: [
          HOST_FILTER,
          { filter: { fieldName: "pagePath", inListFilter: { values: ["/", "/auth"] } } },
        ],
      },
    },
  });
  const usersAt = (path: string) => num(pathUsers.find((r) => r.dimensionValues?.[0]?.value === path) ?? {}, 0);

  const sumRange = (from: string) => summarize(daily.filter((d) => d.date >= from));
  return {
    today: sumRange(todayStr),
    last7: { ...sumRange(sevenDaysAgoStr), ...avgOver(sevenDaysAgoStr) },
    last30: { ...summarize(daily), ...avgOver("00000000") },
    daily,
    sources,
    pages,
    realtimeUsers,
    funnel: { homeUsers: usersAt("/"), authUsers: usersAt("/auth"), events },
    fetchedAt: new Date().toISOString(),
  };
}
