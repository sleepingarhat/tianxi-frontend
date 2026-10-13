/** 免費階段商業路線（用戶 2026-10-13 拍板）：登記帳戶累積至門檻先出 iOS App 同開始收費。
 *  呢檔係瀏覽器安全模組，首頁路線圖、會員頁同監控端都讀同一個數，改呢度即全站跟住改。 */
export const FREE_STAGE_GOAL_MEMBERS = 500;
export const PRO_WEEKLY_PRICE_HKD = 78;
export const FOUNDING_PRO_WEEKS = 52;
export const FOUNDING_PRO_VALUE_HKD = PRO_WEEKLY_PRICE_HKD * FOUNDING_PRO_WEEKS;
export const FREE_STAGE_PRO_FEATURE_ACCESS = true;

/** 免費階段進度（百分比，上限 100）；門檻未達之前全站免費，唔會悄悄收費。 */
export function freeStageProgress(total: number, goal = FREE_STAGE_GOAL_MEMBERS) {
  if (!Number.isFinite(total) || total <= 0 || goal <= 0) return 0;
  return Math.min(100, Math.round((total / goal) * 1000) / 10);
}
