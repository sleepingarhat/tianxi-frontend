/**
 * 天喜定價 · 繼承舊 tianxi-web 設計（2026-04-20）
 * 用戶批准：月費 HK$388 主推、季票 8.5 折
 */

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
