import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/tx/AppShell";
import { FreeStageRoadmap } from "@/components/tx/FreeStageRoadmap";
import { Card, Disclaimer, PageHead, Pill } from "@/components/tx/ui";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "天喜會員 · 而家全站免費 · 天喜 TIANXI" },
      {
        name: "description",
        content:
          "天喜而家全站免費：香港賽馬全部功能免費使用。免費會員累積 500 人先至開始收費同推出 iOS App。",
      },
      { property: "og:title", content: "天喜會員 · 而家全站免費" },
      {
        property: "og:description",
        content: "全部功能免費使用；免費會員累積 500 人先開始收費同出 iOS App，公開對帳永久免費。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MembershipPage,
});

const GOAL_MEMBERS = 500;

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
  { name: "Pro 會員", price: "78", unit: "／星期 · 自動續訂", note: "暫時唯一會員資格，可用全站所有功能；冇免費試用。收入用嚟支持天喜繼續維護、研究同升級預測系統。未來可能開通更多會員資格。", hot: true },
];

function MembershipPage() {
  return (
    <AppShell
      page="dashboard"
      ticker={`全站免費中 · 收費未開放 · 免費會員累積 ${GOAL_MEMBERS.toLocaleString()} 人先開始收費同出 iOS App`}
    >
      <PageHead
        en="Free Stage · Tianxi Pro"
        title="而家全站免費"
        desc={`香港賽馬全部功能免費使用，冇隱藏收費。免費會員累積至 ${GOAL_MEMBERS.toLocaleString()} 人先至開始收費同推出 iOS App；以下係將來嘅收费方案，現階段唔收款。`}
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
          已登記？登入 →
        </Link>
      </div>

      <FreeStageRoadmap />

      <Card
        title="收費方案（未開放）"
        en="Plans · Not Open"
        action={<Pill tone="lose">現階段唔收款</Pill>}
      >
        <div className="space-y-2">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-[12px] border p-3 ${
                p.hot ? "border-gold-strong/60 bg-gold-bg" : "border-hairline bg-paper-2"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-serif-tc text-[14px] font-bold text-ink">{p.name}</span>
                <Pill tone="lose">未開放</Pill>
                {p.hot ? <Pill tone="gold">唯一方案</Pill> : null}
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
          達標後暫時只設 Pro 會員一種資格（HK$78／星期，自動續訂），為保障付費會員，屆時唔設免費試用；現階段唔會收款、亦唔會賣會籍。開始收費同 iOS App 上架會喺呢頁同開發日誌公告，
          公開對帳同歷史成績永久免費。
        </p>
      </Card>

      <Card title="首 500 名註冊會員：一年 Pro" en="Founding members" action={<Pill tone="gold">已決定</Pill>}>
        <p className="text-[12px] leading-relaxed text-ink-2">
          收費閘開啟時，首 {GOAL_MEMBERS.toLocaleString()} 名註冊會員會自動轉為 Pro 會員，享一年 Pro 會員資格（總值 HK$4,056），唔使另外付款。
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-[8px] border border-hairline bg-paper-2 p-2"><p className="text-ink-3">而家</p><p className="font-bold text-ink">免費會員 · 全站免費</p></div>
          <div className="rounded-[8px] border border-gold-strong/60 bg-gold-bg p-2"><p className="text-ink-3">開閘後</p><p className="font-bold text-gold">Pro 會員 · 一年</p></div>
        </div>
        <p className="mt-2 text-[10px] text-ink-3">一年期滿後可按 Pro 會員 HK$78／星期續訂；開閘同轉換會喺呢頁同開發日誌公告。</p>
      </Card>

      <Card title="免費 vs Pro（未開放）" en="Compare">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline text-left">
              <th className="py-1.5 text-[11px] font-bold text-ink-3">功能</th>
              <th className="py-1.5 text-[11px] font-bold text-ink-3">免費（現行）</th>
              <th className="py-1.5 text-[11px] font-bold text-gold">Pro（未開放）</th>
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
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          而家免費階段已經用到嘅功能以上表「免費（現行）」為準；Pro 一欄要等收費開放先會推出。
        </p>
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
