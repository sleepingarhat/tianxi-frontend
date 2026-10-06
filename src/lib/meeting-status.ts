import { useQuery } from "@tanstack/react-query";

export type MeetingCancellationStatus = "cancelled" | "suspected";

export type MeetingCancellation = {
  date: string;
  label: string;
  reason: string;
  status?: MeetingCancellationStatus;
  source?: string;
  detectedAt?: string;
};

/** 離線 fallback：只在偵測接口讀唔到時用，唔再係唯一真相。 */
const MEETING_CANCELLATIONS: Record<string, MeetingCancellation> = {
  "2026-09-19": {
    date: "2026-09-19",
    label: "今日賽事停賽",
    reason: "因董建華離世，今日賽事停賽；不會生成或鎖定預測，亦不會計入戰績。",
    status: "cancelled",
    source: "fallback",
  },
};

export function hkDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : "";
}

export function meetingCancellationForDate(date?: string | null): MeetingCancellation | null {
  if (!date) return null;
  return MEETING_CANCELLATIONS[date] ?? null;
}

export function todayMeetingCancellation(now = new Date()): MeetingCancellation | null {
  return meetingCancellationForDate(hkDate(now));
}

type DetectResponse = {
  date: string;
  status: "racing" | MeetingCancellationStatus;
  label: string;
  reason: string;
  source: string;
  detectedAt: string;
};

/** 引擎自動偵測停賽（人手覆寫 → 官方公告 → 賽日結構）。 */
export function useMeetingCancellation(date?: string | null) {
  const target = date || hkDate();
  const q = useQuery({
    queryKey: ["meetingCancellation", target],
    queryFn: async (): Promise<DetectResponse | null> => {
      const res = await fetch(`/api/public/meeting-cancellation?date=${encodeURIComponent(target)}`);
      if (!res.ok) return null;
      return (await res.json()) as DetectResponse;
    },
    staleTime: 60_000,
    refetchInterval: 300_000,
    retry: 1,
  });

  const data = q.data;
  const cancellation: MeetingCancellation | null =
    data && data.status !== "racing"
      ? {
          date: data.date,
          label: data.label,
          reason: data.reason,
          status: data.status,
          source: data.source,
          detectedAt: data.detectedAt,
        }
      : data && data.status === "racing" && data.source !== "unknown"
        ? null
        : meetingCancellationForDate(target);

  return { cancellation, isLoading: q.isLoading, detection: data ?? null };
}
