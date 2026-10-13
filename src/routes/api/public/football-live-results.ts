import { createFileRoute } from "@tanstack/react-router";

/**
 * 即時賽果專用通道（只讀 90 分鐘完場比分，唔寫入、唔改凍結預測、唔升指紋）。
 * 來源一：football-data.org v4（五大＋英冠）；來源二：ESPN 公開比分（覆蓋鎖定帳全部 22 個聯賽）。
 * 一個來源未出就用另一個補，唔使等 football-data.co.uk 週批 CSV。
 */
const COMP_TO_DIV: Record<string, string> = {
  PL: "E0", ELC: "E1", BL1: "D1", SA: "I1", PD: "SP1", FL1: "F1", DED: "N1", PPL: "P1",
};

const ESPN_TO_DIV: Record<string, string> = {
  "eng.1": "E0", "eng.2": "E1", "eng.3": "E2", "eng.4": "E3", "eng.5": "EC",
  "ger.1": "D1", "ger.2": "D2", "esp.1": "SP1", "esp.2": "SP2", "ita.1": "I1", "ita.2": "I2",
  "fra.1": "F1", "fra.2": "F2", "ned.1": "N1", "por.1": "P1", "bel.1": "B1", "tur.1": "T1",
  "gre.1": "G1", "sco.1": "SC0", "sco.2": "SC1", "sco.3": "SC2", "sco.4": "SC3",
};

type Out = { div: string; kickoff_utc: string; home: string; away: string; ft_h: number; ft_a: number; ftr: "home" | "draw" | "away"; source: string };
const ftrOf = (h: number, a: number) => (h > a ? "home" : h === a ? "draw" : "away") as Out["ftr"];

const json = (body: unknown, status = 200, cache?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      ...(cache ? { "cache-control": cache } : {}),
    },
  });

const hkToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Hong_Kong" }).format(new Date());
const shift = (key: string, days: number) =>
  new Date(Date.parse(`${key}T04:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

async function fromFootballDataOrg(from: string, to: string): Promise<Out[]> {
  const token = process.env["FOOTBALL_DATA_ORG_TOKEN"];
  if (!token) return [];
  try {
    const qs = new URLSearchParams({ competitions: Object.keys(COMP_TO_DIV).join(","), dateFrom: from, dateTo: to });
    const res = await fetch(`https://api.football-data.org/v4/matches?${qs}`, { headers: { "X-Auth-Token": token } });
    if (!res.ok) return [];
    const data = (await res.json()) as { matches?: any[] };
    const out: Out[] = [];
    for (const m of data.matches ?? []) {
      const div = COMP_TO_DIV[m?.competition?.code ?? ""];
      const h = m?.score?.fullTime?.home;
      const a = m?.score?.fullTime?.away;
      if (m?.status !== "FINISHED" || !div || h == null || a == null) continue;
      out.push({
        div, kickoff_utc: m.utcDate,
        home: m.homeTeam?.shortName ?? m.homeTeam?.name ?? "",
        away: m.awayTeam?.shortName ?? m.awayTeam?.name ?? "",
        ft_h: h, ft_a: a, ftr: ftrOf(h, a), source: "football-data.org",
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function fromEspn(from: string, to: string): Promise<Out[]> {
  const days: string[] = [];
  for (let d = from; d <= to && days.length < 10; d = shift(d, 1)) days.push(d.replace(/-/g, ""));
  const jobs = Object.entries(ESPN_TO_DIV).flatMap(([lg, div]) => days.map((day) => ({ lg, div, day })));
  const res = await Promise.all(
    jobs.map(async ({ lg, div, day }) => {
      try {
        const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${lg}/scoreboard?dates=${day}`);
        if (!r.ok) return [];
        const d = (await r.json()) as { events?: any[] };
        const out: Out[] = [];
        for (const e of d.events ?? []) {
          // 只收 90 分鐘完場；加時／點球唔收
          if (e?.status?.type?.name !== "STATUS_FULL_TIME") continue;
          const cs: any[] = e?.competitions?.[0]?.competitors ?? [];
          const H = cs.find((c) => c.homeAway === "home");
          const A = cs.find((c) => c.homeAway === "away");
          const h = Number(H?.score);
          const a = Number(A?.score);
          if (!H || !A || !Number.isFinite(h) || !Number.isFinite(a)) continue;
          out.push({
            div, kickoff_utc: e.date, home: H.team?.displayName ?? "", away: A.team?.displayName ?? "",
            ft_h: h, ft_a: a, ftr: ftrOf(h, a), source: "espn",
          });
        }
        return out;
      } catch {
        return [];
      }
    }),
  );
  return res.flat();
}

export const Route = createFileRoute("/api/public/football-live-results")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const today = hkToday();
        const dateTo = url.searchParams.get("to") ?? shift(today, 1);
        const dateFrom = url.searchParams.get("from") ?? shift(today, -7);
        try {
          const [a, b] = await Promise.all([fromFootballDataOrg(dateFrom, dateTo), fromEspn(dateFrom, dateTo)]);
          // football-data.org 優先，ESPN 補其餘
          const matches = [...a, ...b];
          return json(
            { ok: true, from: dateFrom, to: dateTo, count: matches.length, sources: { "football-data.org": a.length, espn: b.length }, fetched_at: new Date().toISOString(), matches },
            200,
            "public, max-age=120, s-maxage=300, stale-while-revalidate=900",
          );
        } catch (err) {
          return json({ ok: false, error: err instanceof Error ? err.message : "unknown", matches: [] }, 200, "no-store");
        }
      },
    },
  },
});
