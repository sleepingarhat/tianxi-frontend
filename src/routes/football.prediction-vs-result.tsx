import { createFileRoute, Link } from "@tanstack/react-router";

import { FootballNav } from "@/components/tx/FootballNav";
import { AppShell } from "@/components/tx/AppShell";
import { FootballLedger } from "@/components/tx/FootballLedger";
import { Disclaimer, PageHead } from "@/components/tx/ui";

export const Route = createFileRoute("/football/prediction-vs-result")({
  head: () => ({
    meta: [
      { title: "足球預測 vs 賽果 · 逐場凍結對帳 · 天喜 TIANXI" },
      {
        name: "description",
        content:
          "天喜足球逐場凍結對帳：左邊開賽前已鎖機率，右邊 90 分鐘賽果，逐場 RPS、波膽格排名同指紋公開。只讀凍結列，完場後唔會用最新模型重打。",
      },
      { property: "og:title", content: "足球預測 vs 賽果 · 天喜 TIANXI" },
      {
        property: "og:description",
        content: "一場一卡：凍結機率對 90 分鐘賽果，逐場 RPS 與波膽格排名，紅燈場唔入戰績。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FootballCompare,
});

function FootballCompare() {
  return (
    <AppShell
      page="football"
      ticker="TX-Football 逐場凍結對帳 · 開賽前 60 分鐘鎖定 · 完場只讀凍結列 · 紅燈場唔入戰績 · 賠率零權重"
    >
      <PageHead
        en="Prediction vs Result"
        title="預測 vs 賽果"
        desc={
          <>
            一場一張卡：左邊係開賽前已鎖嘅凍結機率同預期比分，右邊係 90 分鐘賽果、本場 RPS 同波膽格排名。
            同一張卡由「未開賽」→「進行中 · 預測已鎖定」→「已結算」，賽事進行期間唔顯示即時比分；完場後只 join
            凍結列，永遠唔會用最新模型倒算舊場。
          </>
        }
      />
      <FootballNav />

      <FootballLedger />

      <div className="px-4 pt-1">
        <p className="flex flex-wrap gap-1.5">
          <Link
            to="/football/fixtures"
            className="inline-flex items-center gap-1 rounded-[6px] border border-hairline bg-paper px-2.5 py-1.5 text-[11px] font-bold text-ink"
          >
            睇賽前預測 · 逐場凍結機率 →
          </Link>
          <Link
            to="/football/results"
            className="inline-flex items-center gap-1 rounded-[6px] border border-hairline bg-paper px-2.5 py-1.5 text-[11px] font-bold text-ink"
          >
            睇回測對帳 · 逐季成績與校準表 →
          </Link>
        </p>
      </div>

      <Disclaimer extra="本頁只展示已凍結預測同官方 90 分鐘賽果對帳，加時／點球另計，不構成任何投注建議。" />
    </AppShell>
  );
}
