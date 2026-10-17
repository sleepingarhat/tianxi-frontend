import { createServerFn } from "@tanstack/react-start";
import { canonicalRaceId, TX_BASE, type Meeting } from "./tx-api";
import type { PublicRace } from "./race-seo";

export const getPublicRacePage = createServerFn({ method: "GET" })
  .inputValidator((input: { id?: string }) => ({ id: canonicalRaceId(input.id) }))
  .handler(async ({ data }): Promise<{ race: PublicRace | null; next: Meeting | null }> => {
    const read = async (path: string) => {
      const response = await fetch(`${TX_BASE}${path}`, { credentials: "omit", signal: AbortSignal.timeout(15_000) });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("賽事資料暫時未能讀取，請稍後再試。");
      return response.json();
    };
    if (!data.id) return { race: null, next: await read("/api/meetings/next") as Meeting | null };
    const direct = await read(`/api/races/${encodeURIComponent(data.id)}`) as PublicRace | null;
    if (direct && (direct.horses?.length || direct.entries?.length)) return { race: direct, next: null };
    const parts = data.id.split("_");
    const date = parts[1] || "";
    const meeting = await read(`/api/meetings/${date}`) as Meeting | null;
    if (!meeting || meeting.venue !== parts[2]) return { race: direct, next: null };
    const summary = meeting.races?.find(r => r.id === data.id);
    return { race: summary ? { ...summary, meetingDate: date, venue: meeting.venue } : direct, next: null };
  });