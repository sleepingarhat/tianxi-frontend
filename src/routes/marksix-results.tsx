import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { Card, Disclaimer, Empty, ErrorNote, Loading, PageHead, Scroller, Seg, Stat, StatGrid, Table, Td } from "@/components/tx/ui";

export const Route = createFileRoute("/marksix-results")({
  head: () => ({
    meta: [
      { title: "六合彩預測 vs 攪珠結果 · 天喜 TIANXI" },
      { name: "description", content: "每期六合彩官方派彩（每 $10 一注）同八字／奇門 15 碼取數逐期對照，2002 年起每日自動收料。" },
      { property: "og:title", content: "六合彩預測 vs 攪珠結果 · 天喜 TIANXI" },
      { property: "og:description", content: "官方七級派彩＋15 碼取數逐期命中對照。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MarkSixResultsPage,
});

type Draw = { date: string; draw: string; numbers: number[]; special: number | null };
type Prize = { tier: number; winningUnit: number; dividend: number };
type Div = Record<string, { draw: string; date: string; unitBet: number; prizes: Prize[] }>;
type Engine = {
  pureBazi: (y: number, m: number, d: number) => { numbers: number[] };
  pureQimen: (y: number, m: number, d: number) => { numbers: number[] };
};

const TIER = ["", "頭獎", "二獎", "三獎", "四獎", "五獎", "六獎", "七獎"];

async function getJson<T>(file: string): Promise<T> {
  const r = await fetch(`/api/public/marksix-data?file=${file}`);
  if (!r.ok) throw new Error(`資料源 ${r.status}`);
  return r.json() as Promise<T>;
}

function tierOf(z: number, sp: boolean): number {
  if (z >= 6) return 1;
  if (z === 5) return sp ? 2 : 3;
  if (z === 4) return sp ? 4 : 5;
  if (z === 3) return sp ? 6 : 7;
  return 0;
}

function comb(n: number, k: number) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}
/** 隨機 15 碼喺每個獎級嘅機率（超幾何）：6 正碼、1 特別號、42 其他 */
const RANDOM_TIER_P: number[] = (() => {
  const p = new Array(8).fill(0) as number[];
  const total = comb(49, 15);
  for (let z = 0; z <= 6; z++)
    for (let s = 0; s <= 1; s++) {
      const t = tierOf(z, s === 1);
      if (t) p[t]! += (comb(6, z) * comb(1, s) * comb(42, 15 - z - s)) / total;
    }
  return p;
})();

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if (document.querySelector(`script[data-m6r="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.dataset["m6r"] = src;
    s.onload = () => res();
    s.onerror = () => rej(new Error(`載入失敗 ${src}`));
    document.body.appendChild(s);
  });
}

function useEngine() {
  const [eng, setEng] = useState<Engine | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const w = window as unknown as { TXMarkSixEngine?: Engine };
    if (w.TXMarkSixEngine) return setEng(w.TXMarkSixEngine);
    loadScript("/marksix/lunar.js")
      .then(() => loadScript("/marksix/engine.js"))
      .then(() => setEng(w.TXMarkSixEngine ?? null))
      .catch((e: Error) => setErr(e.message));
  }, []);
  return { eng, err };
}

function Ball({ n, hit, sp }: { n: number; hit?: boolean; sp?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${
        hit ? "bg-gold text-paper" : sp ? "border border-gold text-ink" : "bg-paper text-ink-2 ring-1 ring-hairline"
      }`}
    >
      {n}
    </span>
  );
}

function MarkSixResultsPage() {
  const [mode, setMode] = useState<"pure_bazi" | "pure_qimen">("pure_bazi");
  const [count, setCount] = useState<30 | 100>(30);
  const [pick, setPick] = useState<string | null>(null);
  const history = useQuery({ queryKey: ["m6-history"], queryFn: () => getJson<Draw[]>("history"), staleTime: 600_000 });
  const divs = useQuery({ queryKey: ["m6-dividends"], queryFn: () => getJson<Div>("dividends"), staleTime: 600_000 });
  const { eng, err } = useEngine();

  const divByDraw = useMemo(() => {
    const m = new Map<string, Div[string]>();
    for (const v of Object.values(divs.data ?? {})) m.set(v.draw, v);
    return m;
  }, [divs.data]);

  const rows = useMemo(() => {
    if (!history.data || !eng) return [];
    const recent = history.data.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, count);
    return recent.map((d) => {
      const [y, m, dd] = d.date.split("-").map(Number) as [number, number, number];
      const pred = (mode === "pure_bazi" ? eng.pureBazi(y, m, dd) : eng.pureQimen(y, m, dd)).numbers;
      const set = new Set(pred);
      const z = d.numbers.filter((n) => set.has(n)).length;
      const sp = d.special != null && set.has(d.special);
      const tier = tierOf(z, sp);
      const dv = divByDraw.get(d.draw);
      const prize = tier ? dv?.prizes.find((p) => p.tier === tier) : undefined;
      return { d, pred, set, z, sp, tier, dv, prize };
    });
  }, [history.data, eng, mode, count, divByDraw]);

  const latest = rows[0];
  const avgHit = rows.length ? rows.reduce((s, r) => s + r.z, 0) / rows.length : 0;
  const tierHits = rows.filter((r) => r.tier > 0).length;
  // 15 碼隨機期望：6 × 15/49
  const randomAvg = (6 * 15) / 49;

  return (
    <AppShell page="marksix" ticker="六合彩 · 官方派彩每日自動收料">
      <PageHead
        en="Mark Six Dividends"
        title="六合彩預測 vs 攪珠結果"
        desc="官方七級派彩（每 $10 一注）2002 年起逐期收齊，每晚攪珠後自動補入；15 碼按攪珠日用固定規則推算，逐期同官方結果對照。"
      />
      <div className="mx-4 mt-3 flex flex-wrap gap-2">
        <Seg value={mode} onChange={setMode} options={[{ value: "pure_bazi", label: "八字取數" }, { value: "pure_qimen", label: "奇門取數" }]} />
        <Seg value={count} onChange={setCount} options={[{ value: 30, label: "近 30 期" }, { value: 100, label: "近 100 期" }]} />
        <Link to="/marksix" className="ml-auto self-center text-[11px] text-gold underline">返六合彩主頁</Link>
      </div>

      {rows.length > 0 && (() => {
        const sel = rows.find((r) => r.d.draw === pick) ?? rows[0]!;
        const prizes = sel.dv?.prizes ?? [];
        const randomEv = prizes.reduce((a, p) => a + (RANDOM_TIER_P[p.tier] ?? 0) * p.dividend, 0);
        const randomAny = RANDOM_TIER_P.reduce((a, b) => a + b, 0);
        return (
          <Card title="揀期數對照" en="Pick a Draw">
            <select
              aria-label="揀期數"
              value={sel.d.draw}
              onChange={(e) => setPick(e.target.value)}
              className="mb-3 w-full rounded-[6px] border border-hairline bg-paper px-2 py-1.5 text-[12px] text-ink"
            >
              {rows.map((r) => (
                <option key={r.d.draw} value={r.d.draw}>{r.d.draw} · {r.d.date}{r.tier ? ` · ${TIER[r.tier]}` : ""}</option>
              ))}
            </select>
            <div className="mb-2 flex flex-wrap items-center gap-0.5">
              <span className="mr-1 text-[10px] text-ink-3">攪珠</span>
              {sel.d.numbers.map((n) => <Ball key={n} n={n} hit={sel.set.has(n)} />)}
              {sel.d.special != null && <Ball n={sel.d.special} sp hit={sel.sp} />}
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-0.5">
              <span className="mr-1 text-[10px] text-ink-3">15 碼</span>
              {sel.pred.map((n) => <Ball key={n} n={n} hit={sel.d.numbers.includes(n) || n === sel.d.special} />)}
            </div>
            <StatGrid cols={3}>
              <Stat label="引擎中" value={`${sel.z}${sel.sp ? "+特" : ""}`} sub={sel.tier ? TIER[sel.tier] : "未中獎"} />
              <Stat label="引擎派彩（每 $10）" value={sel.prize ? `$${sel.prize.dividend.toLocaleString()}` : "$0"} sub="該期官方金額" />
              <Stat label="隨機 15 碼期望" value={`$${Math.round(randomEv).toLocaleString()}`} sub={`含頭獎攤分；中獎機率 ${(randomAny * 100).toFixed(1)}%`} />
            </StatGrid>
            <Scroller>
              <Table head={["獎級", "官方派彩", "隨機 15 碼中呢級機率", "引擎"]}>
                {prizes.map((p) => (
                  <tr key={p.tier} className="border-t border-hairline">
                    <Td first mono={false}>{TIER[p.tier]}</Td>
                    <Td>{p.dividend ? `$${p.dividend.toLocaleString()}` : "無人中"}</Td>
                    <Td>{((RANDOM_TIER_P[p.tier] ?? 0) * 100).toFixed(p.tier <= 3 ? 4 : 2)}%</Td>
                    <Td mono={false}>{sel.tier === p.tier ? <span className="font-semibold text-gold">● 命中</span> : "—"}</Td>
                  </tr>
                ))}
              </Table>
            </Scroller>
          </Card>
        );
      })()}

      {latest?.dv && (
        <Card title={`最新一期 ${latest.d.draw} · ${latest.d.date}`} en="Official Dividends">
          <div className="mb-2 flex flex-wrap items-center gap-1">
            {latest.d.numbers.map((n) => <Ball key={n} n={n} />)}
            <span className="mx-1 text-[10px] text-ink-3">特</span>
            {latest.d.special != null && <Ball n={latest.d.special} sp />}
          </div>
          <Scroller>
            <Table head={["獎級", "中獎注數", `每 $${latest.dv.unitBet} 派彩`]}>
              {latest.dv.prizes.map((p) => (
                <tr key={p.tier} className="border-t border-hairline">
                  <Td first mono={false}>{TIER[p.tier]}</Td>
                  <Td>{p.winningUnit.toLocaleString()}</Td>
                  <Td>{p.dividend ? `$${p.dividend.toLocaleString()}` : "無人中"}</Td>
                </tr>
              ))}
            </Table>
          </Scroller>
        </Card>
      )}

      <Card title="預測 vs 攪珠結果" en="15-Number Picks vs Draw">
        {history.error || divs.error || err ? (
          <ErrorNote error={history.error || divs.error || new Error(err ?? "")} />
        ) : !eng || history.isLoading || divs.isLoading ? (
          <Loading label="載入派彩同取數引擎…" />
        ) : !rows.length ? (
          <Empty />
        ) : (
          <>
            <StatGrid cols={3}>
              <Stat label="平均中正碼" value={avgHit.toFixed(2)} sub={`隨機 15 碼期望 ${randomAvg.toFixed(2)}`} />
              <Stat label="有獎期數" value={`${tierHits}/${rows.length}`} sub={`隨機期望 ${(RANDOM_TIER_P.reduce((a, b) => a + b, 0) * rows.length).toFixed(1)} 期`} />
              <Stat label="派彩已收" value={`${Object.keys(divs.data ?? {}).length.toLocaleString()} 期`} sub="2002 年起" />
            </StatGrid>
            <div className="mt-3">
              <Scroller>
                <Table head={["期次", "15 碼（金＝中）", "官方結果", "中", "獎級／每 $10 派彩"]}>
                  {rows.map((r) => (
                    <tr key={r.d.draw} className="border-t border-hairline align-top">
                      <Td first mono={false}>
                        <div className="whitespace-nowrap">{r.d.draw}</div>
                        <div className="text-[10px] text-ink-3">{r.d.date.slice(5)}</div>
                      </Td>
                      <Td mono={false}>
                        <div className="flex max-w-[220px] flex-wrap gap-0.5">
                          {r.pred.map((n) => <Ball key={n} n={n} hit={r.d.numbers.includes(n) || n === r.d.special} />)}
                        </div>
                      </Td>
                      <Td mono={false}>
                        <div className="flex flex-wrap gap-0.5">
                          {r.d.numbers.map((n) => <Ball key={n} n={n} hit={r.set.has(n)} />)}
                          {r.d.special != null && <Ball n={r.d.special} sp hit={r.sp} />}
                        </div>
                      </Td>
                      <Td>{r.z}{r.sp ? "+特" : ""}</Td>
                      <Td mono={false}>
                        {r.tier ? (
                          <span className="font-semibold text-gold">
                            {TIER[r.tier]} {r.prize ? `$${r.prize.dividend.toLocaleString()}` : "—"}
                          </span>
                        ) : (
                          <span className="text-ink-3">—</span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </Table>
              </Scroller>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
              15 碼由固定規則按攪珠日推算，唔睇結果、唔可事後改；獎級按 15 碼內最佳一注計，派彩為官方每 $10 一注金額，並非 15 碼複式總回報。
            </p>
          </>
        )}
      </Card>
      <Disclaimer />
    </AppShell>
  );
}
