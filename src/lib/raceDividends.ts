// 官方派彩（每 $10 一注）：直接讀 tianxi-racing 倉每日派彩檔 data/YYYY/dividends_DATE.csv
export type DividendRow = { race_no: number; pool: string; combo: string; dividend: number; unit: number };

const BASE = "https://raw.githubusercontent.com/sleepingarhat/tianxi-racing/main/data";

export async function fetchRaceDividends(date: string): Promise<DividendRow[]> {
  const res = await fetch(`${BASE}/${date.slice(0, 4)}/dividends_${date}.csv`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`派彩讀取失敗 ${res.status}`);
  const lines = (await res.text()).replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const head = lines.shift()?.split(",") ?? [];
  const ix = (k: string) => head.indexOf(k);
  const iR = ix("race_no"), iP = ix("pool"), iC = ix("combination"), iD = ix("dividend_hkd");
  const rows: DividendRow[] = [];
  for (const l of lines) {
    const c = splitCsv(l);
    const dividend = Number(String(c[iD] ?? "").replace(/,/g, ""));
    if (!Number.isFinite(dividend)) continue;
    rows.push({ race_no: Number(c[iR]), pool: c[iP] ?? "", combo: c[iC] ?? "", dividend, unit: 10 });
  }
  return rows.sort((a, b) => a.race_no - b.race_no);
}

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "", q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}
