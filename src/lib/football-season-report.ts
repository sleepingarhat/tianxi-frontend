export type FootballEvaluationRow = {
  match_key: string;
  version: string;
  kickoff_utc: string;
  prediction: "home" | "draw" | "away";
  p_final: number[];
  pick_odds: number | null;
  stake: number;
  ftr: "home" | "draw" | "away" | null;
};

export type FootballSeasonReport = {
  season: string;
  version: string;
  stake: number;
  locked: number;
  settled: number;
  hitRate: number | null;
  homeHit: string;
  drawHit: string;
  awayHit: string;
  staked: number;
  payout: number;
  pnl: number;
  roi: number | null;
  rps: number | null;
  logloss: number | null;
  brier: number | null;
  ece: number | null;
};

const OUTCOMES = ["home", "draw", "away"] as const;

export function footballSeason(iso: string) {
  const date = new Date(iso);
  const year = date.getUTCFullYear();
  const start = date.getUTCMonth() >= 7 ? year : year - 1;
  return `${start}/${String(start + 1).slice(-2)}`;
}

export function buildFootballSeasonReport(rows: FootballEvaluationRow[]): FootballSeasonReport[] {
  const groups = new Map<string, FootballEvaluationRow[]>();
  for (const row of rows) {
    const key = `${footballSeason(row.kickoff_utc)}|${row.version}|${row.stake}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.values()].map((all) => {
    const done = all.filter((row) => row.ftr && row.p_final.length === 3);
    let hits = 0, staked = 0, payout = 0, rps = 0, ll = 0, brier = 0;
    const bins = Array.from({ length: 10 }, () => ({ n: 0, conf: 0, hit: 0 }));
    const byOutcome = Object.fromEntries(OUTCOMES.map((outcome) => [outcome, { hit: 0, n: 0 }])) as Record<(typeof OUTCOMES)[number], { hit: number; n: number }>;
    for (const row of done) {
      const actual = OUTCOMES.indexOf(row.ftr as (typeof OUTCOMES)[number]);
      const p = row.p_final.map((value) => Math.min(1 - 1e-6, Math.max(1e-6, Number(value))));
      const predicted = OUTCOMES.indexOf(row.prediction);
      const hit = predicted === actual ? 1 : 0;
      hits += hit;
      byOutcome[row.prediction].n += 1;
      byOutcome[row.prediction].hit += hit;
      ll += -Math.log(p[actual] ?? 1e-6);
      brier += p.reduce((sum, value, i) => sum + (value - (i === actual ? 1 : 0)) ** 2, 0);
      const cumulativeActual: [number, number] = [actual === 0 ? 1 : 0, actual <= 1 ? 1 : 0];
      rps += (((p[0] ?? 0) - cumulativeActual[0]) ** 2 + ((p[0] ?? 0) + (p[1] ?? 0) - cumulativeActual[1]) ** 2) / 2;
      const confidence = p[predicted] ?? 0;
      const bin = bins[Math.min(9, Math.floor(confidence * 10))];
      if (bin) { bin.n += 1; bin.conf += confidence; bin.hit += hit; }
      if (row.pick_odds != null) {
        staked += row.stake;
        if (hit) payout += row.stake * row.pick_odds;
      }
    }
    const n = done.length;
    const ece = n ? bins.reduce((sum, bin) => sum + (bin.n ? (bin.n / n) * Math.abs(bin.hit / bin.n - bin.conf / bin.n) : 0), 0) : null;
    const fmtOutcome = (outcome: (typeof OUTCOMES)[number]) => `${byOutcome[outcome].hit}/${byOutcome[outcome].n}`;
    return {
      season: footballSeason(all[0]?.kickoff_utc ?? new Date().toISOString()), version: all[0]?.version ?? "—", stake: all[0]?.stake ?? 0,
      locked: all.length, settled: n, hitRate: n ? hits / n : null,
      homeHit: fmtOutcome("home"), drawHit: fmtOutcome("draw"), awayHit: fmtOutcome("away"),
      staked, payout, pnl: payout - staked, roi: staked ? (payout - staked) / staked : null,
      rps: n ? rps / n : null, logloss: n ? ll / n : null, brier: n ? brier / n : null, ece,
    };
  }).sort((a, b) => `${b.season}|${b.version}|${b.stake}`.localeCompare(`${a.season}|${a.version}|${a.stake}`));
}

export function footballReportCsv(rows: FootballSeasonReport[]) {
  const headers = ["season", "version", "stake", "locked", "settled", "hit_rate", "home_hit", "draw_hit", "away_hit", "staked", "payout", "pnl", "roi", "rps", "logloss", "brier", "ece"];
  const values = rows.map((row) => [row.season, row.version, row.stake, row.locked, row.settled, row.hitRate, row.homeHit, row.drawHit, row.awayHit, row.staked, row.payout, row.pnl, row.roi, row.rps, row.logloss, row.brier, row.ece]);
  return "\uFEFF" + [headers, ...values].map((line) => line.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
}
