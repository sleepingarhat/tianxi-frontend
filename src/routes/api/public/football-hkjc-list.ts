import { createFileRoute } from "@tanstack/react-router";

/**
 * 香港賽馬會即場足球主和客有盤場次清單（只讀、公開）。
 * 用途：前端「只顯示馬會有盤」篩選；賠率數值唔入模，呢度連盤名都唔回傳，淨回隊名對。
 * 馬會接口要白名單，失敗即回空陣列，前端篩選自動失效。
 */

async function hkjcList(): Promise<{ home: string; away: string }[]> {
  const { fetchHkjcHad } = await import("@/lib/hkjcFootball.server");
  return (await fetchHkjcHad()).map(({ home, away }) => ({ home, away }));
}

export const Route = createFileRoute("/api/public/football-hkjc-list")({
  server: {
    handlers: {
      GET: async () => {
        const pairs = await hkjcList();
        return Response.json(
          { ok: true, count: pairs.length, pairs },
          { headers: { "cache-control": "public, max-age=600" } },
        );
      },
    },
  },
});
