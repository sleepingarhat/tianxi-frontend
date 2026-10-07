// 開發環境專用：真實資料／Demo data／Worst case 切換器。正式站 import.meta.env.DEV 為 false，切換器同假資料唔會生效。
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type FixtureMode = "real" | "demo" | "worst";
const Ctx = createContext<FixtureMode>("real");
const KEY = "tx-admin-fixture";

export function FixtureProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<FixtureMode>("real");
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const v = window.localStorage.getItem(KEY) as FixtureMode | null;
    if (v === "demo" || v === "worst") setMode(v);
  }, []);
  const set = (m: FixtureMode) => {
    setMode(m);
    window.localStorage.setItem(KEY, m);
  };
  return (
    <Ctx.Provider value={import.meta.env.DEV ? mode : "real"}>
      {children}
      {import.meta.env.DEV ? (
        <div className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 gap-0.5 rounded-full border border-hairline bg-paper-3 p-0.5 text-[10px] shadow-lg">
          {(["real", "demo", "worst"] as FixtureMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set(m)}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 transition-colors ${mode === m ? "bg-gold text-paper" : "text-ink-3 hover:text-ink"}`}
            >
              {m === "real" ? "真實" : m === "demo" ? "Demo data" : "Worst case"}
            </button>
          ))}
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

export function useFixtureMode() {
  return useContext(Ctx);
}

/** 頁面用：真實模式回真資料；Demo／Worst 回對應假資料 */
export function useFixture<T>(real: T, fx: { demo: T; worst: T }): T {
  const m = useFixtureMode();
  return m === "real" ? real : fx[m];
}

const LONG_DE = "Borussia Mönchengladbach Fußballclub Rasenballsport Leipzig Eintracht";
export const LONG_FP = "dual-v2-sha256-9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08-elo-hfa80-k24-reg0.90";

/** 足球帳本假資料：正常 3 行；最壞含超長隊名、無賠率、0-0／10-0、浮點尾數、1000+ 行 */
export function ledgerFixture(kind: "demo" | "worst") {
  const base = (i: number, o: Partial<Record<string, unknown>> = {}) => ({
    match_key: `E0|2026-10-${String((i % 28) + 1).padStart(2, "0")}|Arsenal|Chelsea|${i}`,
    version: "dual-v2",
    div: "E0",
    home: "Arsenal",
    away: "Chelsea",
    kickoff_utc: `2026-10-${String((i % 28) + 1).padStart(2, "0")}T14:00:00Z`,
    locked_at: `2026-10-${String((i % 28) + 1).padStart(2, "0")}T08:00:00Z`,
    prediction: "home",
    p_final: [0.52, 0.26, 0.22],
    odds_source: "hkjc",
    pick_odds: 1.95,
    stake: 100,
    ftr: i % 3 === 0 ? "home" : i % 3 === 1 ? "draw" : null,
    score: i % 3 === 2 ? null : "2-1",
    ...o,
  });
  if (kind === "demo") return [base(0), base(1, { home: "Liverpool", away: "Everton" }), base(2, { home: "Man City", away: "Spurs" })];
  return [
    base(0, { home: LONG_DE, away: "Wolfsburg", div: "D1 Bundesliga Erste Liga Deutschland Hauptrunde", odds_source: "none", pick_odds: null }),
    base(1, { p_final: [0.1 + 0.2, 0.30000000000000004, 0.39999999999999997], score: "0-0", ftr: "draw" }),
    base(2, { score: "10-0", ftr: "home", pick_odds: 1.01 }),
    base(3, { score: null, ftr: null, home: "Postponed FC (abandoned 67')" }),
    ...Array.from({ length: 1200 }, (_, i) => base(i + 4)),
  ];
}

export function workflowFixture(kind: "demo" | "worst") {
  const w = (label: string, state: string, ageHours: number | null, conclusion: string | null = "success") => ({
    label, file: `${label}.yml`, status: "completed", conclusion, startedAt: ageHours == null ? null : new Date(Date.now() - ageHours * 3600_000).toISOString(), ageHours, state,
  });
  if (kind === "demo") return [w("賽果收料", "ok", 2), w("排位表", "ok", 5)];
  return [
    w("一個名稱極之長嘅定時任務用嚟測試表格會唔會被撐爆同埋截斷顯示", "fail", 0.0001, "failure"),
    w("從未運行", "warn", null, null),
    w("過時 400 日", "warn", 9600),
    ...Array.from({ length: 40 }, (_, i) => w(`任務 ${i}`, i % 5 === 0 ? "fail" : "ok", i * 3, i % 5 === 0 ? "failure" : "success")),
  ];
}
