import { Link, useRouterState } from "@tanstack/react-router";

/** 足球各頁共用分頁導航：純展示，唔影響任何資料。 */
const TABS = [
  { to: "/football", label: "總覽" },
  { to: "/football/fixtures", label: "賽前預測" },
  { to: "/football/prediction-vs-result", label: "預測 vs 賽果" },
  { to: "/football/match-vs-result", label: "逐場入球對照" },
  { to: "/football/dual-ledger", label: "雙引擎戰績" },
  { to: "/football/results", label: "回測對帳" },
  { to: "/football/features", label: "因子特徵表" },
  { to: "/football/study", label: "逐場研究" },
  { to: "/football/standings", label: "積分榜" },
  { to: "/football/engine", label: "引擎" },
  { to: "/football/explain", label: "覆蓋解釋" },
  { to: "/football/ingest-status", label: "收料狀態" },
] as const;

export function FootballNav() {
  const path = useRouterState({ select: (s) => s.location.pathname }).replace(/\/$/, "") || "/";
  return (
    <nav
      aria-label="足球分頁"
      className="sticky top-0 z-20 border-b border-hairline bg-paper/90 px-4 py-2 backdrop-blur"
    >
      <ul className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-color:var(--tx-gold)_transparent] [scrollbar-width:thin]">
        {TABS.map((t) => {
          const on = path === t.to;
          return (
            <li key={t.to} className="shrink-0">
              <Link
                to={t.to}
                aria-current={on ? "page" : undefined}
                className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full border px-3 py-1 text-[12px] font-bold transition-all duration-200 ${
                  on
                    ? "border-gold-strong bg-gold-bg text-ink shadow-sm"
                    : "border-hairline bg-paper text-ink hover:border-gold-strong/50"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
