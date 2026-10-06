import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/tx/AppShell";
import { ProductDashboard } from "@/components/tx/ProductDashboard";
import { Disclaimer, PageHead } from "@/components/tx/ui";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "天喜儀表板 · 賽馬、足球、六合彩預測引擎" },
    { name: "description", content: "天喜三產品總儀表板：賽馬、足球、六合彩預測、技術流程、公開來源、戰績與回測入口。" },
    { property: "og:title", content: "天喜儀表板 · 三套預測引擎" },
    { property: "og:description", content: "一頁進入天喜賽馬、天喜足球、天喜六合彩嘅預測、流程、戰績與公開來源。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HomePage,
});

function HomePage() {
  return <AppShell page="dashboard" wide ticker="天喜三產品 · 賽馬／足球／六合彩 · 預測、流程、來源與公開對帳">
    <PageHead en="TIANXI PRODUCT COMMAND" title="天喜儀表板" desc="三套預測引擎，一頁睇清產品入口、技術流程、公開來源同實際對帳。" />
    <ProductDashboard />
    <Disclaimer extra="各產品頁面會按自身鎖定及對帳規則標明版本狀態。" />
  </AppShell>;
}