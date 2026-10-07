import { useQuery } from "@tanstack/react-query";

import { fetchRaceDividends, type DividendRow } from "@/lib/raceDividends";
import { txApi } from "@/lib/tx-api";

import { Card, Pill } from "./ui";

/**
 * 孖T／三T 二拖三：每場引擎凍結頭兩匹做膽，拖第 3、4、5 選。
 * 每場 3 組三重彩組合；孖T 3×3＝9 注、三T 3×3×3＝27 注，每注 $10。
 * 跨場分布直接由官方派彩檔推算：派彩行喺第 R 場、組合有 n 段 → 覆蓋第 R−n+1…R 場。
 * 第 1–4 選用凍結四揀；第 5 選凍結紀錄冇存，取賽後排序中首匹唔喺凍結四揀嘅馬（頁面註明）。
 */
const UNIT = 10;

type Leg = { race: number; bankers: number[]; legs: number[]; fifthFromLive: boolean } | null;
type PoolCalc = {
  name: string; races: number[]; units: number; cost: number;
  mainHit: boolean; payout: number; consUnits: number; consPayout: number;
  missing: boolean; detail: { race: number; hit: boolean | null }[];
};

const parseLeg = (s: string) => s.trim();
const isAny = (s: string) => s === "任何組合" || s === "F";
const setOf = (s: string) => new Set(s.split(",").map((x) => Number(x.trim())).filter(Number.isFinite));

function legHit(leg: Leg | undefined, part: string | undefined): boolean | null {
  if (!leg) return null;
  if (!part) return null;
  if (isAny(part)) return true;
  const win = setOf(part);
  if (win.size !== 3) return false;
  if (!leg.bankers.every((b) => win.has(b))) return false;
  return leg.legs.some((x) => win.has(x));
}

function calcPools(divs: DividendRow[], legsByRace: Record<number, Leg>): PoolCalc[] {
  const groups = new Map<string, { main?: DividendRow; cons?: DividendRow }>();
  for (const d of divs) {
    if (!/孖T|三T/.test(d.pool)) continue;
    const base = d.pool.replace(/\(安慰獎\)|（安慰獎）/, "").trim();
    const g = groups.get(base) ?? {};
    if (/安慰獎/.test(d.pool)) g.cons = d; else g.main = d;
    groups.set(base, g);
  }
  const out: PoolCalc[] = [];
  for (const [name, g] of groups) {
    const ref = g.main ?? g.cons!;
    const n = ref.combo.split("/").length;
    const races = Array.from({ length: n }, (_, i) => ref.race_no - n + 1 + i);
    const legs: Leg[] = races.map((r) => legsByRace[r] ?? null);
    const missing = legs.some((l) => !l);
    const units = 3 ** n;
    const mainParts = g.main ? g.main.combo.split("/").map(parseLeg) : [];
    const detail = races.map((r, i) => ({ race: r, hit: g.main ? legHit(legs[i], mainParts[i]) : null }));
    const mainHit = !missing && !!g.main && detail.every((d) => d.hit);
    let consUnits = 0;
    if (g.cons && !missing) {
      const parts = g.cons.combo.split("/").map(parseLeg);
      const fixedOk = parts.every((p, i) => isAny(p) || legHit(legs[i], p));
      if (fixedOk) {
        // 「任何組合」段：拖腳 3 組之中除咗正獎嗰組，其餘都屬安慰獎
        consUnits = parts.reduce((acc, p, i) => {
          if (!isAny(p)) return acc;
          const hitThis = mainParts[i] ? legHit(legs[i], mainParts[i]) : false;
          return acc * (hitThis ? 2 : 3);
        }, 1);
      }
    }
    out.push({
      name, races, units, cost: units * UNIT,
      mainHit, payout: mainHit && g.main ? g.main.dividend : 0,
      consUnits, consPayout: g.cons ? consUnits * g.cons.dividend : 0,
      missing, detail,
    });
  }
  return out.sort((a, b) => (a.races[0] ?? 0) - (b.races[0] ?? 0));
}

async function loadLegs(date: string): Promise<Record<number, Leg>> {
  const [hr, mt] = await Promise.all([txApi.hitRate(date).catch(() => null), txApi.meeting(date).catch(() => null)]);
  const ids: Record<number, string> = {};
  for (const r of mt?.races ?? []) ids[Number(r.raceNumber)] = String(r.id);
  const out: Record<number, Leg> = {};
  await Promise.all(
    (hr?.races ?? []).map(async (r: any) => {
      const rn = Number(r.raceNumber);
      const top4 = (r.predictedTop4 ?? []).map((h: any) => Number(h.horseNumber)).filter(Number.isFinite);
      if (top4.length < 4) { out[rn] = null; return; }
      let fifth: number | null = null;
      if (ids[rn]) {
        try {
          const tp = await txApi.topPicks(ids[rn]);
          const cand = (tp?.picks ?? []).map((p: any) => Number(p.horseNumber)).find((n: number) => !top4.includes(n));
          if (Number.isFinite(cand)) fifth = cand;
        } catch { /* 冇第五選就當三腳得兩腳 */ }
      }
      const legs = [top4[2], top4[3], ...(fifth != null ? [fifth] : [])];
      out[rn] = { race: rn, bankers: [top4[0], top4[1]], legs, fifthFromLive: fifth != null };
    }),
  );
  return out;
}

const money = (v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;

export function ExoticTrioPools({ date }: { date: string }) {
  const q = useQuery({
    queryKey: ["exotic-trio", date],
    enabled: !!date,
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const [divs, legs] = await Promise.all([fetchRaceDividends(date), loadLegs(date)]);
      return { pools: calcPools(divs, legs), legs };
    },
  });
  if (!date) return null;
  const pools = q.data?.pools ?? [];
  const cost = pools.filter((p) => !p.missing).reduce((a, p) => a + p.cost, 0);
  const ret = pools.reduce((a, p) => a + p.payout + p.consPayout, 0);
  const net = ret - cost;

  return (
    <Card title="孖T／三T 二拖三" en="Double Trio · Triple Trio">
      <p className="mb-2 text-[10px] leading-relaxed text-ink-3">
        每場引擎頭兩匹做膽，拖第 3、4、5 選；每注 $10。孖T 每口 9 注（$90）、三T 27 注（$270）。
        跨邊幾場以馬會派彩紀錄為準。第 5 選凍結紀錄冇存，取自賽後排序。
      </p>
      {q.isLoading ? (
        <p className="py-3 text-center text-[11px] text-ink-3">計算緊…</p>
      ) : q.isError ? (
        <p className="py-3 text-center text-[11px] text-lose">讀取失敗，稍後再試</p>
      ) : !pools.length ? (
        <p className="py-3 text-center text-[11px] text-ink-3">呢個賽日未有孖T／三T 派彩紀錄</p>
      ) : (
        <>
          <div className="mb-2 grid grid-cols-3 gap-2 text-center">
            {[["成本", money(cost), ""], ["派彩", money(ret), ""], ["淨盈虧", `${net >= 0 ? "+" : "−"}${money(Math.abs(net))}`, net >= 0 ? "text-win" : "text-lose"]].map(([l, v, c]) => (
              <div key={l} className="rounded-[6px] border border-hairline bg-paper px-2 py-1.5">
                <p className="text-[9px] text-ink-3">{l}</p>
                <p className={`tabnum font-mono-tx text-[13px] font-bold ${c || "text-ink"}`}>{v}</p>
              </div>
            ))}
          </div>
          <ul>
            {pools.map((p) => (
              <li key={p.name} className="border-b border-hairline py-2 last:border-b-0">
                <p className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <b className="text-ink">{p.name}</b>
                  <span className="text-ink-3">第 {p.races.join("、")} 場</span>
                  <span className="ml-auto">
                    {p.missing ? <Pill tone="ink">缺預測</Pill> : p.mainHit ? <Pill tone="win">中正獎</Pill> : p.consUnits ? <Pill tone="gold">中安慰獎</Pill> : <Pill tone="lose">冇中</Pill>}
                  </span>
                </p>
                <p className="mt-1 flex flex-wrap gap-1 text-[10px]">
                  {p.detail.map((d) => (
                    <span key={d.race} className={`rounded-[4px] border px-1.5 ${d.hit ? "border-win/40 text-win" : d.hit === false ? "border-hairline text-ink-3" : "border-hairline text-ink-3"}`}>
                      R{d.race} {d.hit ? "✓" : d.hit === false ? "✗" : "—"}
                    </span>
                  ))}
                </p>
                <p className="tabnum mt-1 font-mono-tx text-[10px] text-ink-2">
                  {p.units} 注 · 成本 {money(p.cost)}
                  {p.payout ? ` · 正獎 ${money(p.payout)}` : ""}
                  {p.consPayout ? ` · 安慰獎 ${p.consUnits} 注 ${money(p.consPayout)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
