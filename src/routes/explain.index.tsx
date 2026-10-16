import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/tx/AppShell";
import { CoverageAudit } from "@/components/tx/CoverageAudit";
import { Card, Disclaimer, PageHead } from "@/components/tx/ui";

export const Route = createFileRoute("/explain/")({
  head: () => ({ meta: [
    { title: "每日四揀覆蓋與市場對照 · 天喜 TIANXI" },
    { name: "description", content: "按已入帳凍結賽日自動更新，分馬場及途程比較模型四揀與全場收市熱門四匹。" },
    { property: "og:title", content: "每日四揀覆蓋與市場對照 · 天喜 TIANXI" },
    { property: "og:description", content: "凍結四揀、官方頭四名及收市市場同場配對，缺資料如實標示。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }), component: ExplainGlobalPage,
});
function ExplainGlobalPage() {
  return <AppShell page="engine">
    <PageHead en="Daily coverage" title="四揀覆蓋解釋" desc="每日從已入帳凍結四揀與官方頭四名核對，分馬場、途程列出覆蓋；不以覆蓋統計解釋某匹馬勝出的原因。" />
    <CoverageAudit days={180} showMeetings />
    <Card title="資料界線" en="Audit boundaries">
      <p className="text-[11px] leading-relaxed text-ink-2">只計完整四揀與完整頭四名，來源標示已凍結。未鎖、未完場或缺盤不補數。模型、凍結排名及健康閘全部不改；歷史固定報告保留在源碼作存檔，本頁不再以舊窗充當最新統計。</p>
    </Card>
    <Disclaimer extra="逐匹 Elo 與因子貢獻需真實鎖點資料；現有接口未提供的項目不以代理值填補。" />
  </AppShell>;
}
