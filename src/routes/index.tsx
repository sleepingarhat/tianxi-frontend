import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/tx/AppShell";
import { FreeStageRoadmap } from "@/components/tx/FreeStageRoadmap";
import { EngineLanding } from "@/components/tx/EngineLanding";
import { Disclaimer } from "@/components/tx/ui";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "天喜賽馬 · 香港賽馬預測與策略盈虧" },
    { name: "description", content: "天喜專注香港賽馬：沙田、跑馬地四揀預測、官方賽果派彩對帳、六彩池策略盈虧與引擎健康。現階段免費。" },
    { property: "og:title", content: "天喜賽馬 · 香港賽馬數據平台" },
    { property: "og:description", content: "沙田與跑馬地賽事，賽前凍結四揀、賽後公開對帳，六彩池盈虧如實展示。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HomePage,
});

function HomePage() {
  return <AppShell page="dashboard" wide ticker="天喜香港賽馬 · 沙田／跑馬地 · 全站免費 · 賽前凍結、賽後公開對帳">
    <EngineLanding />
    <FreeStageRoadmap />
    <Disclaimer extra="首場前 90 分鐘凍結全日四揀及第五選；賽後只重算對帳，唔改凍結預測。" />
  </AppShell>;
}