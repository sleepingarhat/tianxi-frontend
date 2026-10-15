// 馬場相授權篩選同每週輪換（純函數，前後端共用）。
export type RacecoursePhotoRow = {
  file_title: string;
  venue: "ST" | "HV";
  image_url: string;
  width: number;
  height: number;
  author: string;
  license: string;
  license_url: string | null;
  source_page: string;
};

/** 只收准許商用嘅自由授權；任何 NC／ND 一律拒絕。 */
export function isCommercialFreeLicense(name: string): boolean {
  const n = name.trim();
  if (/\b(NC|ND)\b|non-?commercial|no-?deriv/i.test(n)) return false;
  return /^(CC0( 1\.0)?|CC BY(-SA)? \d(\.\d)?( [A-Za-z-]+)?|Public domain|PD.*)$/i.test(n);
}

/** 闊度 ≥1600、橫向（闊高比 ≥1.3）先夠做海報。 */
export function isPosterSize(w: number, h: number): boolean {
  return w >= 1600 && h > 0 && w / h >= 1.3;
}

/** ISO 週數（香港時間），每星期換一張。 */
export function hkWeekIndex(now: Date = new Date()): number {
  const hk = new Date(now.getTime() + 8 * 3600_000);
  return Math.floor((hk.getTime() - 4 * 86400_000) / (7 * 86400_000));
}

export function pickWeekly<T extends { file_title: string }>(rows: T[], week: number): T | null {
  if (!rows.length) return null;
  const sorted = rows.slice().sort((a, b) => (a.file_title < b.file_title ? -1 : 1));
  return sorted[((week % sorted.length) + sorted.length) % sorted.length]!;
}
