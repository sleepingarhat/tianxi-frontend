import type { RaceHorse, RaceSummary } from "./tx-api";

export const RACING_ORIGIN = "https://tianxi.racing";
export type PublicRace = RaceSummary & {
  meetingDate?: string;
  date?: string;
  venue?: string;
  entries?: RaceHorse[];
};

export function raceUrl(id: string) {
  return `${RACING_ORIGIN}/race?id=${encodeURIComponent(id)}`;
}

export function raceMetadata(race: PublicRace | null | undefined) {
  if (!race) return {
    title: "香港賽馬賽程與排位表 · 天喜賽馬",
    description: "查看沙田、跑馬地逐場賽程、出賽馬匹、騎師、練馬師、途程、賠率及官方賽果。",
    url: `${RACING_ORIGIN}/race`,
  };
  const date = race.meetingDate || race.date || race.id.slice(5, 15);
  const venue = (race.venue || race.id.split("_")[2]) === "HV" ? "跑馬地" : "沙田";
  const distance = race.distance || race.distanceM;
  const label = `${date} ${venue}第${race.raceNumber}場`;
  const details = [race.title, race.class && (/^\d+$/.test(race.class) ? `第${race.class}班` : race.class), distance && `${distance}米`, race.course, race.going].filter(Boolean).join(" · ");
  const horses = race.horses || race.entries || [];
  const winner = horses.find(h => Number(h.finishingPosition) === 1);
  const result = winner ? `官方賽果：冠軍${winner.nameCh || winner.name || "—"}；` : "";
  return {
    title: `${label}${race.title ? ` ${race.title}` : ""}${distance ? ` ${distance}米` : ""}｜排位及賽果 · 天喜賽馬`,
    description: `${label}${details ? `（${details}）` : ""}。${result}查看${horses.length ? `${horses.length}匹` : ""}出賽馬匹、騎師、練馬師、獨贏賠率與逐匹名次。`,
    url: raceUrl(race.id),
  };
}

export function sitemapXml(urls: string[]) {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].map(url => `  <url><loc>${escape(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
}