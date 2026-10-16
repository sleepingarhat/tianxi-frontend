import { cached, CACHE_TTL } from "./computed-cache.server";
import { createServerFn } from "@tanstack/react-start";
import { completeAuditRace, coverageRows, parseResultsCsv, type AuditMeeting, type CoverageRow } from "./racing-visibility";
import { TX_BASE } from "./tx-api";

export const getCoverageAudit = createServerFn({ method: "GET" })
  .inputValidator((input: { days?: number }) => ({ days: Math.min(365, Math.max(30, Math.round(Number(input.days) || 180))) }))
  .handler(async ({ data }) => cached(`coverage:${data.days}`, CACHE_TTL, async () => {
    const readJson = async (url: string) => {
      const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error("賽果資料暫時未能讀取");
      return response.json();
    };
    const roll = await readJson(`${TX_BASE}/api/analyze/hit-rate-rollup?days=${data.days}`) as { perMeeting?: { date: string; venue: string }[]; from?: string; to?: string };
    const dates = [...new Map((roll.perMeeting ?? []).map(m => [m.date, m])).values()];
    const meetings: AuditMeeting[] = [], rows: CoverageRow[] = [], failed: string[] = [], missingOdds: string[] = [];
    let excluded = 0;
    // Bounded concurrency keeps the existing data service usable for other pages.
    for (let offset = 0; offset < dates.length; offset += 4) {
      await Promise.all(dates.slice(offset, offset + 4).map(async m => {
        try {
          const [payload, csv] = await Promise.all([
            readJson(`${TX_BASE}/api/analyze/hit-rate?date=${m.date}`),
            fetch(`https://raw.githubusercontent.com/sleepingarhat/tianxi-racing/main/data/${m.date.slice(0, 4)}/results_${m.date}.csv`, { signal: AbortSignal.timeout(15_000) })
              .then(r => r.ok ? r.text() : "").catch(() => ""),
          ]);
          const j = payload as Partial<AuditMeeting>;
          const meeting: AuditMeeting = { date: m.date, venue: j.venue ?? m.venue, races: (j.races ?? []).filter(completeAuditRace) };
          excluded += (j.races ?? []).length - meeting.races.length;
          if (!csv) missingOdds.push(m.date);
          if (meeting.races.length) { meetings.push(meeting); rows.push(...coverageRows(meeting, parseResultsCsv(csv))); }
        } catch { failed.push(m.date); }
      }));
    }
    meetings.sort((a, b) => b.date.localeCompare(a.date));
    rows.sort((a, b) => b.date.localeCompare(a.date) || a.raceNo - b.raceNo);
    return { from: roll.from ?? null, to: meetings[0]?.date ?? null, checkedAt: new Date().toISOString(), meetings, rows, failed, missingOdds, excluded };
  }));
/** 引擎價值對照：由當前凍結版本首次使用日起，只讀凍結四揀與收市賠率。 */
export const getValueComparison = createServerFn({ method: "GET" })
  .inputValidator((input: { from: string }) => ({ from: /^\d{4}-\d{2}-\d{2}$/.test(input.from) ? input.from : "2099-01-01" }))
  .handler(async ({ data }) => cached(`value-cmp:${data.from}`, CACHE_TTL, async () => {
    const { valueRace, summarizeValue } = await import("./racing-visibility");
    const readJson = async (url: string) => {
      const r = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!r.ok) throw new Error("賽果資料暫時未能讀取");
      return r.json();
    };
    const days = Math.min(365, Math.max(30, Math.ceil((Date.now() - Date.parse(data.from)) / 86_400_000) + 2));
    const roll = await readJson(`${TX_BASE}/api/analyze/hit-rate-rollup?days=${days}`) as { perMeeting?: { date: string }[] };
    const dates = [...new Set((roll.perMeeting ?? []).map(m => m.date))].filter(d => d >= data.from).sort();
    const perDay: { date: string; rows: ReturnType<typeof valueRace>[] }[] = [];
    for (let i = 0; i < dates.length; i += 4) {
      await Promise.all(dates.slice(i, i + 4).map(async date => {
        try {
          const [j, csv] = await Promise.all([
            readJson(`${TX_BASE}/api/analyze/hit-rate?date=${date}`) as Promise<Partial<AuditMeeting>>,
            fetch(`https://raw.githubusercontent.com/sleepingarhat/tianxi-racing/main/data/${date.slice(0, 4)}/results_${date}.csv`, { signal: AbortSignal.timeout(15_000) }).then(r => r.ok ? r.text() : "").catch(() => ""),
          ]);
          if (!csv) return;
          const res = parseResultsCsv(csv);
          perDay.push({ date, rows: (j.races ?? []).filter(completeAuditRace).map(r => valueRace(r, res.get(r.raceNumber) ?? [])) });
        } catch { /* 該日略過 */ }
      }));
    }
    perDay.sort((a, b) => a.date.localeCompare(b.date));
    const all: NonNullable<ReturnType<typeof valueRace>>[] = [];
    const trend = perDay.map(d => { all.push(...d.rows.filter((r): r is NonNullable<typeof r> => !!r)); const s = summarizeValue(all); return { date: d.date, engineOdds: s.engineOdds, marketOdds: s.marketOdds, engineHits: s.engineHits, marketHits: s.marketHits }; });
    return { from: data.from, to: perDay.at(-1)?.date ?? null, meetings: perDay.length, summary: summarizeValue(all), trend };
  }));
