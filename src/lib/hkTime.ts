/**
 * 全站唯一香港時間（Asia/Hong_Kong, UTC+8）格式化。
 * 所有賽事日期同開賽時間一律用呢支，避免用 UTC 日期切片造成「歐洲深夜場」錯歸前一日。
 * 純展示層：唔碰凍結預測、λ、矩陣、指紋。
 */
const HK = "Asia/Hong_Kong";

function ms(iso?: string | null): number {
  if (!iso) return NaN;
  const s = /Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso.replace(" ", "T")}Z`;
  return Date.parse(s);
}

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: HK,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: HK,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dowFmt = new Intl.DateTimeFormat("zh-HK", { timeZone: HK, weekday: "short" });

/** 香港日曆日 key：YYYY-MM-DD */
export function hkDateKey(iso?: string | null): string {
  const t = ms(iso);
  if (Number.isNaN(t)) return "";
  return dateFmt.format(new Date(t)); // en-CA → 2026-09-21
}

/** 香港時間 HH:mm */
export function hkClock(iso?: string | null): string {
  const t = ms(iso);
  if (Number.isNaN(t)) return "—";
  return timeFmt.format(new Date(t));
}

/** 香港時間 MM-DD HH:mm */
export function hkDateTime(iso?: string | null): string {
  const key = hkDateKey(iso);
  if (!key) return "—";
  return `${key.slice(5)} ${hkClock(iso)}`;
}

/** 日期標籤：09-21（六） */
export function hkDayLabel(key: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return key;
  const dow = dowFmt.format(new Date(`${key}T04:00:00Z`)).replace("星期", "");
  return `${key.slice(5)}（${dow}）`;
}

/** 今日香港日期（YYYY-MM-DD） */
export const hkToday = () => hkDateKey(new Date().toISOString());

/** 香港日期加減 N 日 */
export function hkShift(key: string, days: number): string {
  const t = Date.parse(`${key}T04:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}
