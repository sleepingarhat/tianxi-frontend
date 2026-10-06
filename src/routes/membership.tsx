import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/tx/AppShell";
import { Card, Disclaimer, PageHead, Pill } from "@/components/tx/ui";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "天喜 Pro 會員 · 天喜 TIANXI" },
      { name: "description", content: "升級天喜 Pro：賽前全卡預測、模型搏冷 + 市場穩陣雙欄、pWin 信心分與賽日提早通知。" },
      { property: "og:title", content: "天喜 Pro 會員 · 天喜 TIANXI" },
      { property: "og:description", content: "免費對賬永久公開，睇實模型成績先決定。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MembershipPage,
});

const STRENGTHS = [
  ["01", "數據化預測", "以香港賽事長期資料建立可重現預測，唔靠賽後改口或主觀貼士。"],
  ["02", "時序外驗證", "所有改動先用未見過嘅較後賽事驗證，降低只對舊數據有效嘅風險。"],
  ["03", "多來源核對", "賽事、馬匹及市場資料經一致性檢查；缺資料時直接隱藏，不以猜測補值。"],
  ["04", "機率化輸出", "Pro 顯示最終勝出、三甲及前四機率，方便比較同場相對強弱。"],
  ["05", "持續監察", "新訊號要跨時段維持改善先會採用，單次漂亮結果不足以推出。"],
  ["06", "永久公開對賬", "過往預測同實際賽果長期公開，準確度由你自行核實。"],
];

const COMPARE: [string, string, string][] = [
  ["過往對賬 + 命中率", "✓", "✓"],
  ["每賽日免費精選", "1 場", "全卡"],
  ["賽前預測（開賽前）", "不包括", "全卡"],
  ["模型搏冷 + 市場穩陣雙欄", "不包括", "✓"],
  ["pWin 機率 · 信心分", "不包括", "✓"],
  ["臨場盤口 blend", "不包括", "✓"],
  ["賽後全卡公開", "✓", "✓"],
  ["Telegram", "免費頻道", "VIP 私頻 + 提早通知"],
];

const PLANS = [
  { name: "試一日", price: "38", unit: "／日", note: "單日全卡體驗", hot: false },
  { name: "月費會員", price: "198", unit: "／月", note: "主力之選，平均約每賽日 HK$25", hot: true },
  { name: "季費會員", price: "528", unit: "／季", note: "約省一個月", hot: false },
];

function MembershipPage() {
  return (
    <AppShell page="dashboard" ticker="升級 Pro · 免費對賬永久公開">
      <PageHead
        en="Tianxi Pro Membership"
        title="升級天喜 Pro"
        desc="免費對賬永久公開，等你睇實模型成績先決定。Pro 解鎖賽前全卡預測、模型搏冷 + 市場穩陣雙欄、pWin 信心分，同賽日提早通知。"
      />

      <div className="mx-4 flex gap-2">
        <Link
          to="/track-record"
          className="flex-1 rounded-[8px] border border-hairline bg-paper-2 px-3 py-2 text-center text-[12px] font-bold text-ink"
        >
          查看公開戰績 →
        </Link>
        <Link
          to="/login"
          className="flex-1 rounded-[8px] border border-gold-strong/60 bg-gold-bg px-3 py-2 text-center text-[12px] font-bold text-gold"
        >
          已購買？登入 →
        </Link>
      </div>

      <Card title="收費方案" en="Plans">
        <div className="space-y-2">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-[12px] border p-3 ${
                p.hot ? "border-gold-strong/60 bg-gold-bg" : "border-hairline bg-paper-2"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-serif-tc text-[14px] font-bold text-ink">{p.name}</span>
                {p.hot ? <Pill tone="gold">最受歡迎</Pill> : null}
              </div>
              <p className="tabnum mt-1 font-mono-tx text-[20px] font-bold text-ink">
                HK$ {p.price}
                <span className="text-[11px] font-normal text-ink-3">{p.unit}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-ink-3">{p.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
          付款由第三方安全處理。付款後請用同一個帳戶登入，系統會即時核實有效會籍；付款完成頁、電郵或會員編號本身不會直接解鎖。
        </p>
      </Card>

      <Card title="免費 vs Pro" en="Compare">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline text-left">
              <th className="py-1.5 text-[11px] font-bold text-ink-3">功能</th>
              <th className="py-1.5 text-[11px] font-bold text-ink-3">免費</th>
              <th className="py-1.5 text-[11px] font-bold text-gold">Pro</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([f, a, b]) => (
              <tr key={f} className="border-b border-hairline">
                <td className="py-1.5 pr-2 text-[12px] text-ink">{f}</td>
                <td className="py-1.5 pr-2 text-[12px] text-ink-3">{a}</td>
                <td className="py-1.5 text-[12px] font-bold text-ink">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="引擎技術實力" en="Why Tianxi">
        <div className="divide-y divide-hairline">
          {STRENGTHS.map(([no, h, body]) => (
            <div key={no} className="py-2.5">
              <div className="flex items-center gap-2">
                <span className="tabnum font-mono-tx text-[11px] font-bold text-gold">{no}</span>
                <span className="font-serif-tc text-[13px] font-bold text-ink">{h}</span>
              </div>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-2">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-ink-2">
          天喜唔係貼士佬主觀感覺，而係<b className="text-ink">可驗證、可問責</b>嘅數據引擎。
        </p>
      </Card>

      <Disclaimer extra="天喜為分析平台，不提供投注服務，亦不保證任何回報。" />
    </AppShell>
  );
}
