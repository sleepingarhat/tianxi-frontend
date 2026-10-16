/** Read-only audit and historical position summaries; never writes predictions. */
export type AuditPick = { horseNumber: number; rank?: number; nameCh?: string; horseId?: string; hit?: boolean };
export type AuditRace = { raceNumber: number; distance?: number; scoreSource?: string; predictedTop4?: AuditPick[]; actualTop4?: { horseNumber: number; position: number; nameCh?: string; winOdds?: number; horseId?: string }[] };
export type AuditMeeting = { date: string; venue: string; races: AuditRace[] };
export type ClosingRunner = { no: number; odds: number | null; place: number | null };
export type CoverageRow = { date: string; venue: string; raceNo: number; band: string; model: number; market: number | null };
export const DISTANCE_BANDS = ["短途", "一哩", "中長", "長途"] as const;
export function distanceBand(distance: number) {
  return distance <= 1200 ? "短途" : distance <= 1650 ? "一哩" : distance <= 2000 ? "中長" : "長途";
}
export function completeAuditRace(r: AuditRace) {
  const picks = new Set(r.predictedTop4?.slice(0, 4).map(p => p.horseNumber));
  const actual = new Set(r.actualTop4?.filter(p => p.position >= 1 && p.position <= 4).map(p => p.horseNumber));
  return picks.size === 4 && actual.size === 4 && Boolean(r.scoreSource?.includes("frozen"));
}
export function marketCoverage(race: AuditRace, runners: ClosingRunner[]): number | null {
  // Complete closing prices are required; a tie straddling fourth place is ambiguous.
  const starters = runners.filter(r => r.place != null);
  if (starters.length < 4 || starters.some(r => r.odds == null || r.odds <= 0)) return null;
  const sorted = starters.slice().sort((a, b) => (a.odds ?? Infinity) - (b.odds ?? Infinity) || a.no - b.no);
  if (sorted[3]?.odds === sorted[4]?.odds) return null;
  const actual = new Set(race.actualTop4?.map(r => r.horseNumber));
  return sorted.slice(0, 4).filter(r => actual.has(r.no)).length;
}
export function coverageRows(m: AuditMeeting, results: Map<number, ClosingRunner[]>): CoverageRow[] {
  return m.races.filter(completeAuditRace).map(r => ({
    date: m.date, venue: m.venue, raceNo: r.raceNumber,
    band: r.distance && r.distance > 0 ? distanceBand(r.distance) : "未提供途程",
    model: (r.predictedTop4 ?? []).slice(0, 4).filter(p => r.actualTop4?.some(a => a.horseNumber === p.horseNumber)).length,
    market: marketCoverage(r, results.get(r.raceNumber) ?? []),
  }));
}
export function summarizeCoverage(rows: CoverageRow[]) {
  const pairs = rows.filter(r => r.market != null);
  const average = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  return { n: rows.length, paired: pairs.length, missing: rows.length - pairs.length,
    model: average(rows.map(r => r.model)), pairedModel: average(pairs.map(r => r.model)),
    market: average(pairs.map(r => r.market ?? 0)),
    counts: [0, 1, 2, 3, 4].map(k => rows.filter(r => r.model === k).length) };
}
export function parseResultsCsv(text: string): Map<number, ClosingRunner[]> {
  const records: string[][] = []; let row: string[] = [], value = "", quoted = false;
  const csv = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (c === '"') { if (quoted && csv[i + 1] === '"') { value += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(value); value = ""; }
    else if (c === '\n' && !quoted) { row.push(value.replace(/\r$/, "")); records.push(row); row = []; value = ""; }
    else value += c;
  }
  if (value || row.length) { row.push(value); records.push(row); }
  const head = records.shift() ?? [];
  const ir = head.indexOf("race_no"), ino = head.indexOf("horse_no"), io = head.indexOf("win_odds"), ip = head.indexOf("place");
  const result = new Map<number, ClosingRunner[]>();
  if ([ir, ino, io, ip].some(i => i < 0)) return result;
  for (const c of records) {
    const race = Number(c[ir]), no = Number(c[ino]), odds = Number(c[io]);
    const rawPlace = c[ip]?.trim() ?? "";
    const place = /^\d+$/.test(rawPlace) ? Number(rawPlace) : null;
    if (!race || !no) continue;
    const rows = result.get(race) ?? [];
    rows.push({ no, odds: Number.isFinite(odds) && odds > 0 ? odds : null, place: place && place > 0 ? place : null });
    result.set(race, rows);
  }
  return result;
}
export type PositionForm = { date: string; distance?: number; runningPosition?: string | null };
export function historicalPositions(form: PositionForm[], beforeDate: string, distance: number) {
  const eligible = form.filter(r => r.date < beforeDate && /^\d+(?:\s+\d+)+$/.test(r.runningPosition?.trim() ?? ""))
    .sort((a, b) => b.date.localeCompare(a.date));
  const sameBand = eligible.filter(r => r.distance && distanceBand(r.distance) === distanceBand(distance));
  const selected = (sameBand.length ? sameBand : eligible).slice(0, 8);
  const stages = [0, 0.5, 1].map(fraction => {
    const values = selected.map(r => {
      // Exclude final finishing position: this is a running-position guide, not a win prediction.
      const ps = (r.runningPosition ?? "").trim().split(/\s+/).map(Number).slice(0, -1);
      return ps[Math.round((ps.length - 1) * fraction)] ?? 0;
    }).filter(p => p > 0).sort((a, b) => a - b);
    const quantile = (q: number) => {
      const index = (values.length - 1) * q, lo = Math.floor(index), a = values[lo];
      return a == null ? null : a + ((values[Math.ceil(index)] ?? a) - a) * (index - lo);
    };
    return { mid: quantile(0.5), low: quantile(0.25), high: quantile(0.75) };
  });
  return { n: selected.length, sameBand: sameBand.length > 0, last: selected[0]?.date ?? null, stages };
}