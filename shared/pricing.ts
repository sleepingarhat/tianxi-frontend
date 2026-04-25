/**
 * 天喜定價
 *
 * LAUNCH POLICY (CONSTITUTIONAL · 2026-04-25):
 * User directive: 上線時不要定收費，先累積用戶，標榜「限時免費試用」全功能。
 * 條件成熟（註冊量 / DAU 到達內部 threshold）先考慮轉化賺錢。
 *
 * 所以 launch 階段:
 *   - PRICING_ENABLED = false  → 前端必須唔 render 任何金額
 *   - tiers / foundingMember 凍結保留（code reference only）
 *   - Phase 2 開波時由 user 拍板 flip flag + revise 數字
 *
 * 凡係顯示價錢／升級 CTA／付費解鎖 UI 嘅地方，
 * 都要檢查 PRICING_ENABLED，false 嘅情況下改 render Beta 文案。
 */

export const PRICING_ENABLED = false as const;

/**
 * 當 PRICING_ENABLED = false 時，前端應該 render 嘅 Beta 訊息。
 * 永遠唔提具體價錢、唔提具體結束日期（"一段時間" = intentionally vague）。
 */
export const betaProgram = {
  headline: "限時免費試用 · 全功能開放",
  subhead: "Beta 用戶優先 · 幫我哋一齊改進天喜",
  bullets: [
    "AI 選馬建議 — 全日全部場次解鎖",
    "自選因子 + 自訂權重比例",
    "Elo 深度回溯 + 進階聊天頻道",
    "心水追蹤無上限 + 賽後對賬通知",
    "完全無廣告",
  ],
  cta: "免費開始用",
  note: "收集真實使用數據，持續改進系統。多謝你成為早期用戶。",
} as const;

// ---- 以下為 Phase 2 再 revive（現時唔 render）----

export type PricingTier = {
  id: "weekly" | "monthly" | "quarterly";
  name: string;
  price: number;          // HKD
  billingCycle: string;
  highlight?: boolean;
  savingsNote?: string;
  features: string[];
};

export const tiers: PricingTier[] = [
  {
    id: "weekly",
    name: "週票",
    price: 48,
    billingCycle: "每週",
    features: [
      "所有賽事 Elo 排名",
      "靈活因子選擇器",
      "AI 選馬對話（每日 10 次）",
      "馬匹 / 騎師 / 練馬師百科",
      "賽馬日曆 + 排位表",
    ],
  },
  {
    id: "monthly",
    name: "月費",
    price: 388,
    billingCycle: "每月",
    highlight: true,
    savingsNote: "最多人揀",
    features: [
      "全部 週票功能",
      "AI 選馬對話（無限次）",
      "自訂因子 profile（保存多個策略）",
      "晨操 + 傷患 + 轉廄 深入資料",
      "馬迷聊天室進階頻道",
      "賽後 15 分鐘賽果通知",
    ],
  },
  {
    id: "quarterly",
    name: "季票",
    price: 2988,
    billingCycle: "3 個月",
    savingsNote: "相當於月費 8.5 折",
    features: [
      "全部 月費功能",
      "API 存取（read-only）",
      "原始 CSV 下載（個人用途）",
      "新功能搶先試用",
      "私人 WhatsApp 客服群",
    ],
  },
];

export const foundingMember = {
  discountPct: 50,
  durationMonths: 3,
  perks: [
    "首 3 個月 5 折（月費 HK$194）",
    "終生新功能優先試用",
    "名字載入首批會員名冊",
  ],
} as const;
