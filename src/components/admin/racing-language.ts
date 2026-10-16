/** Normalize display copy only; preserve API keys, statuses and frozen records. */
export function racingLanguage(value: unknown): string {
  return String(value ?? "").replace(/賽季|季節/g, "馬季");
}