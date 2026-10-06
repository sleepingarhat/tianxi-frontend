import { createFileRoute } from "@tanstack/react-router";

/**
 * 馬會即時馬場天氣（風速追蹤器同源）。
 * 資料源：https://info.cld.hkjc.com/graphql/base/（whitelist query，必須逐字相同）
 * 只做唯讀代理 + 60 秒快取，供前端顯示。
 */
const WEATHER_QUERY = `
query Weather {
  weather {
    racecourse
    sectional {
      location
      date
      time
      avgCorrectedWindDirection
      avgCorrectedWindSpeed
      correctedGustDirection
      correctedGustSpeed
      gpsPosition
      supplyVoltage
      status
      isValid
    }
    weatherStation {
      location
      date
      time
      avgCorrectedWindDirection
      avgCorrectedWindSpeed
      correctedGustDirection
      correctedGustSpeed
      gpsPosition
      supplyVoltage
      relativeHumidity
      temperature
      solarRadiation
      sunshineHour
      pressure
      correctedGustSpeedDailyMax
      relativeHumidityDailyMax
      relativeHumidityDailyMin
      temperatureDailyMax
      temperatureDailyMin
      rainFallPrecipitation1Min
      rainFallPrecipitation10Min
      rainPrecipitationDailyTotal
      soilVolumeticWaterContent
      soilMoistureLoss1Min
      soilMoistureLossDailyTotal
      soilMoistureLoss24H
      status
      isValid
    }
  }
}

  `;

type Station = Record<string, string | boolean | null>;
type WeatherNode = { racecourse: string; sectional: Station[] | null; weatherStation: Station | null };

const num = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export type VenueWeather = {
  venue: string;
  venueLabel: string;
  time: string | null;
  temperature: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  humidity: number | null;
  pressure: number | null;
  windDirection: string | null;
  windSpeed: number | null;
  gustSpeed: number | null;
  rain10Min: number | null;
  rainToday: number | null;
  soilWater: number | null;
  soilLossToday: number | null;
  sunshineHour: number | null;
  sectional: { location: string; direction: string | null; speed: number | null; gust: number | null }[];
};

const VENUE_LABEL: Record<string, string> = { ST: "沙田", HV: "跑馬地", CH: "從化" };

export const Route = createFileRoute("/api/public/hkjc-weather")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const r = await fetch("https://info.cld.hkjc.com/graphql/base/", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              origin: "https://racing.hkjc.com",
              referer: "https://racing.hkjc.com/",
            },
            body: JSON.stringify({ variables: null, query: WEATHER_QUERY }),
          });
          const json: { data?: { weather?: WeatherNode[] | null } } = await r.json();
          const nodes = json.data?.weather ?? [];
          const venues: VenueWeather[] = nodes.map((n) => {
            const s = n.weatherStation ?? {};
            return {
              venue: n.racecourse,
              venueLabel: VENUE_LABEL[n.racecourse] ?? n.racecourse,
              time: (s["time"] as string | null)?.slice(0, 5) ?? null,
              temperature: num(s["temperature"]),
              temperatureMax: num(s["temperatureDailyMax"]),
              temperatureMin: num(s["temperatureDailyMin"]),
              humidity: num(s["relativeHumidity"]),
              pressure: num(s["pressure"]),
              windDirection: (s["avgCorrectedWindDirection"] as string | null) ?? null,
              windSpeed: num(s["avgCorrectedWindSpeed"]),
              gustSpeed: num(s["correctedGustSpeed"]),
              rain10Min: num(s["rainFallPrecipitation10Min"]),
              rainToday: num(s["rainPrecipitationDailyTotal"]),
              soilWater: num(s["soilVolumeticWaterContent"]),
              soilLossToday: num(s["soilMoistureLossDailyTotal"]),
              sunshineHour: num(s["sunshineHour"]),
              sectional: (n.sectional ?? []).map((x) => ({
                location: String(x["location"] ?? "—"),
                direction: (x["avgCorrectedWindDirection"] as string | null) ?? null,
                speed: num(x["avgCorrectedWindSpeed"]),
                gust: num(x["correctedGustSpeed"]),
              })),
            };
          });
          return Response.json(
            { venues, fetchedAt: new Date().toISOString() },
            { headers: { "cache-control": "public, max-age=60" } },
          );
        } catch {
          return Response.json({ venues: [], error: "天氣資料暫時未能讀取" }, { status: 200 });
        }
      },
    },
  },
});
