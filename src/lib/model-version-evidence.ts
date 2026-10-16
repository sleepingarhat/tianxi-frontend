/** Never infer per-version training/gate/fingerprint from today's health report. */
export function recordedAlpha(source: string | null): number | null {
  const match = source?.match(/α\s*=\s*(0(?:\.\d+)?|1(?:\.0+)?)\b/);
  return match?.[1] ? Number(match[1]) : null;
}
export function orderVersions<T extends { status: string; released_at: string }>(rows: T[]): T[] {
  return rows.slice().sort((a, b) => Number(b.status === "active") - Number(a.status === "active") || b.released_at.localeCompare(a.released_at));
}