import { describe, expect, it } from "vitest";
import { raceMetadata, raceUrl, sitemapXml } from "./race-seo";

describe("逐場賽事搜尋網址", () => {
  it("每場指向自己的網址，不能合併到首頁或其他場次", () => {
    const a = raceMetadata({ id: "race_2026-10-14_HV_1", raceNumber: 1 });
    const b = raceMetadata({ id: "race_2026-10-14_HV_2", raceNumber: 2 });
    expect(a.url).toBe("https://tianxi.racing/race?id=race_2026-10-14_HV_1");
    expect(b.url).toBe("https://tianxi.racing/race?id=race_2026-10-14_HV_2");
  });
  it("地圖保留真實場次，不用生成時間冒充內容更新日期", () => {
    const xml = sitemapXml([raceUrl("race_2026-10-14_HV_1"), raceUrl("race_2026-10-14_HV_1"), raceUrl("race_2026-10-19_ST_1")]);
    expect((xml.match(/<url>/g) || []).length).toBe(2);
    expect(xml).not.toContain("<lastmod>");
  });
});