import { TX_BASE, canonicalRaceId, type Meeting } from "./tx-api";
import { raceUrl } from "./race-seo";

// Walk the public API's confirmed offset pagination; never return partial XML on failure.
export async function getPublicRaceUrls() {
  const urls: string[] = [];
  const seen = new Set<string>();
  const size = 100;
  const read = async (path: string) => {
    const r = await fetch(`${TX_BASE}${path}`, { credentials: "omit", signal: AbortSignal.timeout(20_000) });
    if (!r.ok) throw new Error("無法完整讀取賽事網站地圖資料。");
    return r.json();
  };
  for (let offset = 0; ; offset += size) {
    const data = await read(`/api/meetings?limit=${size}&offset=${offset}`) as { meetings: Meeting[] };
    if (!Array.isArray(data.meetings)) throw new Error("賽事列表格式不正確。");
    for (const listed of data.meetings) {
      if (seen.has(listed.id)) throw new Error("賽事列表分頁重複，停止輸出不完整地圖。");
      seen.add(listed.id);
      const meeting = listed.totalRaces ? listed : await read(`/api/meetings/${listed.date}`) as Meeting;
      const count = Number(meeting.totalRaces);
      if (!Number.isInteger(count) || count < 0 || count > 20) throw new Error("賽事場數未能核實。");
      const ids = meeting.races ? meeting.races.map(r => r.id) : Array.from({ length: count }, (_, i) => `race_${meeting.date}_${meeting.venue}_${i + 1}`);
      for (const id of ids) {
        if (!canonicalRaceId(id)) throw new Error("賽事網址不正確。");
        urls.push(raceUrl(id));
      }
      if (urls.length > 49_000) throw new Error("賽事地圖需要分拆，停止輸出超額地圖。");
    }
    if (data.meetings.length < size) break;
  }
  return urls;
}