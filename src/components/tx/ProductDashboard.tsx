import { Link } from "@tanstack/react-router";
import { Activity, CalendarDays, ChevronDown, CircleDot, Database, ExternalLink, Gauge, GitBranch, Network, Trophy, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Product = {
  key: string;
  eyebrow: string;
  title: string;
  summary: string;
  dashboard: { to: string; label: string };
  metrics: { label: string; value: string }[];
  flow: { title: string; detail: string; formula?: string }[];
  sources: { label: string; href: string }[];
  actions: { to: string; hash?: string; label: string }[];
  branches: { to: string; hash?: string; label: string; icon: LucideIcon }[];
};

const PRODUCTS: Product[] = [
  {
    key: "horse", eyebrow: "TX-ORACLE · HORSE RACING", title: "天喜賽馬",
    summary: "四揀排序、全日鎖定、官方名次對帳。主指標係四揀平均命中匹數。",
    dashboard: { to: "/dashboard", label: "進入天喜賽馬引擎" },
    metrics: [{ label: "主要輸出", value: "每場四揀" }, { label: "鎖定", value: "首場 T−90" }, { label: "盤口", value: "只作對照" }],
    flow: [
      { title: "賽前資料", detail: "排位、負磅、騎練、往績與 as-of 場地資料。", formula: "xᵢ(t) = f({r : date(r) < t})" },
      { title: "雙層排序", detail: "天喜ELO 後備線與 LightGBM LambdaRank 同場排序。", formula: "blendᵢ = αzᶫᵍᵇᵢ + (1−α)zᵉˡᵒᵢ" },
      { title: "機率與四揀", detail: "以 Harville／Plackett–Luce 派生獨贏及位置機率；排序取四揀。", formula: "P(winᵢ) = wᵢ / Σⱼwⱼ" },
      { title: "凍結對帳", detail: "首場前 90 分鐘一次鎖全日；賽後只接官方名次。", formula: "KPI = (1/R)Σ|TOP4ᵣ ∩ 實際首四ᵣ|" },
    ],
    sources: [{ label: "賽馬數據庫", href: "https://github.com/sleepingarhat/tianxi-racing" }, { label: "賽馬引擎", href: "https://github.com/sleepingarhat/tianxi-racing" }],
    actions: [{ to: "/strategy-pnl", label: "天喜策略累計盈虧" }, { to: "/prediction-vs-result", label: "預測與賽果" }],
    branches: [{ to: "/predictor", label: "選馬", icon: Activity }, { to: "/schedule", label: "日程", icon: CalendarDays }, { to: "/encyclopedia", label: "百科", icon: Database }, { to: "/engine", label: "引擎", icon: Network }],
  },
  {
    key: "football", eyebrow: "DUAL-V1 · FOOTBALL", title: "天喜足球",
    summary: "三格機率加專用和局引擎，混合後出主／和／客；賠率權重永遠為零。",
    dashboard: { to: "/football", label: "進入天喜足球引擎" },
    metrics: [{ label: "主要輸出", value: "主／和／客" }, { label: "鎖定", value: "逐場 T−6h" }, { label: "記錄", value: "只增不改" }],
    flow: [
      { title: "引擎 A", detail: "沿用凍結三格機率，保留主勝、和局、客勝完整分佈。", formula: "Pᴬ = [P(H), P(D), P(A)]" },
      { title: "引擎 B", detail: "以凍結預期入球計對角膨脹 Poisson 和局機率。", formula: "Pᴮ(D) = (1−π)ΣₖP(X=k,Y=k) + π" },
      { title: "雙引擎混合", detail: "和局兩引擎各佔一半，餘下機率按引擎 A 主客比例分配。", formula: "Pᶠ(D) = 0.5Pᴬ(D) + 0.5Pᴮ(D)" },
      { title: "Lift 投票與鎖定", detail: "混合機率除以凍結歷史率投票，最高分就係今場雙引擎預測；開賽前 6 小時入只增不改帳。", formula: "score(c) = Pᶠ(c) / base(c)" },
    ],
    sources: [{ label: "足球數據庫", href: "https://github.com/sleepingarhat/tianxi-football" }, { label: "足球引擎", href: "https://github.com/sleepingarhat/tianxi-football" }, { label: "足球後端", href: "https://github.com/sleepingarhat/tianxi-football" }],
    actions: [{ to: "/football/dual-ledger", label: "天喜策略累計盈虧" }, { to: "/football/prediction-vs-result", label: "預測與賽果" }],
    branches: [{ to: "/football/fixtures", label: "日程", icon: CalendarDays }, { to: "/football/standings", label: "百科", icon: Trophy }, { to: "/football/engine", label: "引擎", icon: Network }, { to: "/football/dual-ledger", label: "戰績", icon: Gauge }],
  },
  {
    key: "marksix", eyebrow: "BAZI × QIMEN · MARK SIX", title: "天喜六合彩",
    summary: "官方攪珠結果、號碼統計、八字與奇門取數，配合近百期逐期回測。",
    dashboard: { to: "/marksix", label: "進入天喜六合彩引擎" },
    metrics: [{ label: "主要輸出", value: "15 碼" }, { label: "驗證", value: "近 100 期" }, { label: "資料", value: "官方結果" }],
    flow: [
      { title: "下一期資料", detail: "讀取下一期攪珠日期及期數，建立同一個計算基準。" },
      { title: "干支排盤", detail: "換算四柱、藏干、十二長生，再核對三合三會。", formula: "四柱 = 年柱 ⊕ 月柱 ⊕ 日柱 ⊕ 時柱" },
      { title: "八字／奇門取數", detail: "按已定版規則分別輸出 15 碼，亦可加入個人命盤作合盤。", formula: "S(n) = Sᵇᵃᶻᶦ(n) + Sᑫⁱᵐᵉⁿ(n)" },
      { title: "逐期回測", detail: "同官方結果逐期核對命中數，展示原始結果，不改分數追答案。", formula: "hits = |預測 15 碼 ∩ 官方攪珠號碼|" },
    ],
    sources: [{ label: "六合彩數據庫", href: "https://github.com/sleepingarhat/hk-mark-six-2002-now" }, { label: "六合彩引擎", href: "https://github.com/sleepingarhat/tianxi-marksix" }],
    actions: [{ to: "/marksix", hash: "marksix-engine", label: "天喜引擎回測" }, { to: "/marksix", hash: "marksix-next", label: "下一期預測" }],
    branches: [{ to: "/marksix", hash: "marksix-next", label: "下一期", icon: CircleDot }, { to: "/marksix", hash: "marksix-stats", label: "號碼統計", icon: Activity }, { to: "/marksix", hash: "marksix-engine", label: "排盤", icon: GitBranch }, { to: "/marksix", hash: "marksix-engine", label: "回測", icon: Gauge }],
  },
];

function ProductCard({ product, index }: { product: Product; index: number }) {
  return <article className="overflow-hidden rounded-[8px] border border-hairline bg-paper-2 shadow-sm">
    <div className="border-b border-hairline bg-paper px-3.5 py-3">
      <div className="flex items-start gap-3"><span className="tabnum grid h-10 w-10 shrink-0 place-items-center rounded-[6px] border border-gold-strong bg-deep font-mono-tx text-[14px] font-bold text-gold-strong shadow-sm">0{index + 1}</span><div className="min-w-0 flex-1"><p className="font-mono-tx text-[8px] font-bold uppercase tracking-[0.18em] text-ink-3">{product.eyebrow}</p><h2 className="fx-spotlight mt-0.5 font-serif-tc text-[19px] font-bold text-ink">{product.title}</h2></div></div>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-2">{product.summary}</p>
    </div>
    <div className="grid grid-cols-3 border-b border-hairline bg-paper-3/50">{product.metrics.map((m) => <div key={m.label} className="min-w-0 border-r border-hairline px-2 py-2 last:border-r-0"><p className="text-[8px] text-ink-3">{m.label}</p><p className="mt-0.5 truncate font-mono-tx text-[10px] font-bold text-ink">{m.value}</p></div>)}</div>
    <div className="space-y-2.5 p-3">
      <Button asChild className="h-11 w-full border border-gold bg-gradient-to-b from-gold-strong to-gold font-serif-tc text-[13px] font-bold text-ink shadow-md hover:from-gold hover:to-gold-strong"><Link to={product.dashboard.to}><span>{product.dashboard.label}</span><span aria-hidden className="text-[17px] leading-none">→</span></Link></Button>
      <details className="group overflow-hidden rounded-[6px] border border-hairline bg-paper"><summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-[11px] font-bold text-ink marker:content-none"><Network className="h-4 w-4 text-gold" aria-hidden="true" />技術流程與公式<ChevronDown className="ml-auto h-4 w-4 text-ink-3 transition-transform group-open:rotate-180" aria-hidden="true" /></summary><ol className="border-t border-hairline px-2.5 py-1.5">{product.flow.map((s, i) => <li key={s.title} className="grid grid-cols-[22px_minmax(0,1fr)] gap-2 border-b border-hairline py-2 last:border-b-0"><span className="tabnum grid h-[22px] w-[22px] place-items-center rounded-[4px] bg-gold-bg font-mono-tx text-[9px] font-bold text-gold">{i + 1}</span><div className="min-w-0"><h3 className="text-[11px] font-bold text-ink">{s.title}</h3><p className="mt-0.5 text-[10px] leading-relaxed text-ink-3">{s.detail}</p>{s.formula ? <code className="mt-1 block overflow-x-auto whitespace-nowrap rounded-[4px] bg-paper-3 px-1.5 py-1 font-mono-tx text-[9px] text-ink-2">{s.formula}</code> : null}</div></li>)}</ol></details>
      <div><p className="mb-1.5 font-mono-tx text-[8px] font-bold uppercase tracking-[0.16em] text-ink-3">公開 GitHub 來源</p><div className="flex flex-wrap gap-1.5">{product.sources.map((s) => <Button key={s.href} asChild variant="outline" size="sm" className="h-7 border-hairline bg-paper px-2 text-[10px] text-ink hover:border-gold-strong hover:bg-gold-bg"><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}<ExternalLink aria-hidden="true" /></a></Button>)}</div></div>
      <div className="grid grid-cols-2 gap-1.5">{product.actions.map((a, i) => <Button key={a.label} asChild variant={i === 0 ? "default" : "outline"} className={i === 0 ? "h-auto min-h-10 whitespace-normal bg-gold px-2 py-2 text-center text-[11px] leading-tight text-ink hover:bg-gold/90" : "h-auto min-h-10 whitespace-normal border-gold-strong/50 bg-gold-bg px-2 py-2 text-center text-[11px] leading-tight text-ink hover:bg-gold-bg"}>{a.hash ? <Link to={a.to} hash={a.hash}>{a.label}</Link> : <Link to={a.to}>{a.label}</Link>}</Button>)}</div>
      <div className="grid grid-cols-4 gap-1 border-t border-hairline pt-2">{product.branches.map((b) => b.hash ? <Link key={b.label} to={b.to} hash={b.hash} className="grid min-w-0 justify-items-center gap-1 rounded-[5px] px-1 py-1.5 text-center text-[9px] font-bold text-ink-2 hover:bg-gold-bg hover:text-gold"><b.icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" /><span className="truncate">{b.label}</span></Link> : <Link key={b.label} to={b.to} className="grid min-w-0 justify-items-center gap-1 rounded-[5px] px-1 py-1.5 text-center text-[9px] font-bold text-ink-2 hover:bg-gold-bg hover:text-gold"><b.icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" /><span className="truncate">{b.label}</span></Link>)}</div>
    </div>
  </article>;
}

export function ProductDashboard() {
  return <div className="grid gap-3 px-4 py-4 md:grid-cols-3 md:gap-4 md:px-5">{PRODUCTS.map((product, index) => <ProductCard key={product.key} product={product} index={index} />)}</div>;
}