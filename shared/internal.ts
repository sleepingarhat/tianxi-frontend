/**
 * ⚠️ INTERNAL ONLY — 唔可以 import 入 user-facing bundle
 *
 * 用戶指令 2026-04-24:
 *   命中率係內部必須追蹤嘅監察指標（用嚟升級改良系統），
 *   但 USER 端屏蔽；除非整體命中率 > 80%，由 user 親自拍板先俾用戶睇。
 *
 * Usage:
 *   - Admin dashboard (/internal/* routes)
 *   - Dev tools / logs
 *   - Bayesian optimizer feedback loop
 *   - Factor weight tuning scripts
 *
 * 絕對唔可以:
 *   - Import 入任何 user-facing 頁 (/, /dashboard, /predictor 等)
 *   - Render 去公開 HTML
 *   - Log 去用戶可見 console
 */

export const internalGate = {
  /** 揭示命中率嘅門檻。超過先考慮對外展示（user 親自決定） */
  publicDisplayThreshold: 0.80,

  /** 目前實測水平（2026-04-22 9-race live）· 遠低於門檻 */
  currentBenchmark: {
    asOf: "2026-04-22",
    sampleRaces: 9,
    top1HitRate: 0.111,   // 1/9 = 11.1%
    top3HitRate: 0.333,   // 3/9 = 33.3%
    championAvgRank: 6.3,
    notes:
      "Pre-Elo-v1.1 baseline. Post-cutover with Data-Independence-compliant factors " +
      "expected to improve; continuous tracking required before any public reveal.",
  },

  /** 內部追蹤嘅 metric category（admin dashboard 顯示） */
  trackedMetrics: [
    "top1_hit_rate",
    "top3_hit_rate",
    "champion_avg_rank",
    "upset_detection_precision",
    "upset_detection_recall",
    "elo_calibration_brier",
    "factor_contribution_shap",
  ] as const,

  /** 揭示前要確認嘅 check-list（防止草率 flip） */
  publicRevealChecklist: [
    "連續 3 個月整體 top1 命中率 > 80%",
    "樣本數 >= 200 場",
    "Brier score < 0.15",
    "User 親自簽 off (非 agent 自動決定)",
    "法律 / compliance review",
  ] as const,
} as const;

/** 內部用 · 決定目前係咪可以 render 命中率俾用戶 */
export function shouldShowHitRatePublicly(): false {
  // 硬 return false · 提醒日後改呢度要同時改所有 consumer
  return false;
}

/** 內部 admin 頁用 · 格式化命中率字串 */
export function formatInternalHitRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}% (internal)`;
}
