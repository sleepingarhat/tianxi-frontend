/**
 * 馬會足智彩主客和（HAD）公開 GraphQL。
 * 馬會接口只接受網站白名單查詢原文（改一隻字都會 WHITELIST_ERROR），所以查詢字串照抄網站版本、唔好精簡。
 * 失敗一律回空陣列，由呼叫方降級去後備賠率。
 */
const QUERY = "\n      query matchList($startIndex: Int, $endIndex: Int,$startDate: String, $endDate: String, $matchIds: [String], $tournIds: [String], $fbOddsTypes: [FBOddsType]!, $fbOddsTypesM: [FBOddsType]!, $inplayOnly: Boolean, $featuredMatchesOnly: Boolean, $frontEndIds: [String], $earlySettlementOnly: Boolean, $showAllMatch: Boolean) {\n        matches(startIndex: $startIndex,endIndex: $endIndex, startDate: $startDate, endDate: $endDate, matchIds: $matchIds, tournIds: $tournIds, fbOddsTypes: $fbOddsTypesM, inplayOnly: $inplayOnly, featuredMatchesOnly: $featuredMatchesOnly, frontEndIds: $frontEndIds, earlySettlementOnly: $earlySettlementOnly, showAllMatch: $showAllMatch) {\n          id\n          frontEndId\n          matchDate\n          kickOffTime\n          status\n          updateAt\n          sequence\n          esIndicatorEnabled\n          homeTeam {\n            id\n            name_en\n            name_ch\n          }\n          awayTeam {\n            id\n            name_en\n            name_ch\n          }\n          tournament {\n            id\n            frontEndId\n            nameProfileId\n            isInteractiveServiceAvailable\n            code\n            name_en\n            name_ch\n          }\n          isInteractiveServiceAvailable\n          inplayDelay\n          venue {\n            code\n            name_en\n            name_ch\n          }\n          tvChannels {\n            code\n            name_en\n            name_ch\n          }\n          liveEvents {\n            id\n            code\n          }\n          featureStartTime\n          featureMatchSequence\n          poolInfo {\n            normalPools\n            inplayPools\n            sellingPools\n            ntsInfo\n            entInfo\n          }\n          runningResult {\n            homeScore\n            awayScore\n            corner\n          }\n          runningResultExtra {\n            homeScore\n            awayScore\n            corner\n          }\n          adminOperation {\n            remark {\n              typ\n            }\n          }\n          foPools(fbOddsTypes: $fbOddsTypes) {\n            id\n            status\n            oddsType\n            instNo\n            inplay\n            name_ch\n            name_en\n            updateAt\n            expectedSuspendDateTime\n            lines {\n              lineId\n              status\n              condition\n              main\n              combinations {\n                combId\n                str\n                status\n                offerEarlySettlement\n                currentOdds\n                selections {\n                  selId\n                  str\n                  name_ch\n                  name_en\n                }\n              }\n            }\n          }\n        }\n      }\n      ";

export type HkjcHad = { home: string; away: string; kickoff: number; odds: [number, number, number] };
export const normTeam = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");

export async function fetchHkjcHad(): Promise<HkjcHad[]> {
  try {
    const res = await fetch("https://info.cld.hkjc.com/graphql/base/", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://bet.hkjc.com", referer: "https://bet.hkjc.com/" },
      body: JSON.stringify({ query: QUERY, variables: { fbOddsTypes: ["HAD"], fbOddsTypesM: ["HAD"], showAllMatch: true } }),
      signal: AbortSignal.timeout(15000),
    });
    const j = (await res.json()) as any;
    const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) && x > 1 ? x : null; };
    return ((j?.data?.matches ?? []) as any[]).flatMap((m) => {
      if (m.status !== "PREEVENT") return []; // 只要賽前盤，滾球價唔入帳
      const pool = (m.foPools ?? []).find((p: any) => p.oddsType === "HAD" && !p.inplay) ?? null;
      const c = pool?.lines?.[0]?.combinations ?? [];
      const g = (k: string) => n(c.find((x: any) => x.str === k)?.currentOdds);
      const o = [g("H"), g("D"), g("A")];
      if (!o.every(Boolean)) return [];
      return [{ home: normTeam(m.homeTeam?.name_en ?? ""), away: normTeam(m.awayTeam?.name_en ?? ""), kickoff: Date.parse(m.kickOffTime), odds: o as [number, number, number] }];
    });
  } catch {
    return [];
  }
}

/** 隊名互相包含 + 開賽時間相差 3 小時內先當同一場，避免同名隊誤配 */
export function matchHkjc(list: HkjcHad[], home: string, away: string, kickoffUtc?: string): HkjcHad | undefined {
  const h = normTeam(home), a = normTeam(away), t = kickoffUtc ? Date.parse(kickoffUtc) : NaN;
  return list.find((x) =>
    x.home && x.away && (x.home.includes(h) || h.includes(x.home)) && (x.away.includes(a) || a.includes(x.away)) &&
    (!Number.isFinite(t) || !Number.isFinite(x.kickoff) || Math.abs(x.kickoff - t) <= 3 * 3600_000));
}
