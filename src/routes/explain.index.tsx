import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { Card, Disclaimer, PageHead, Pill, Seg, Stat, StatGrid, Table, Td } from "@/components/tx/ui";
import { TxBar } from "@/components/tx/viz";
import {
  EXPLAIN_GLOBAL,
  EXPLAIN_MEETINGS,
  VENUE_ZH,
  fixed,
  pct,
  type ExplainLayer,
} from "@/lib/explain-data";
import { useLiveExtension } from "@/lib/explain-live";

export const Route = createFileRoute("/explain/")({
  head: () => ({
    meta: [
      { title: "四揀覆蓋解釋 · 天喜 TIANXI" },
      {
        name: "description",
        content: "凍結四揀同實際頭 4 嘅重疊覆蓋統計，頭條跟命中率資料即場更新，按馬場同途程分層列出，唔涉勝出因果。",
      },
      { property: "og:title", content: "四揀覆蓋解釋 · 天喜 TIANXI" },
      { property: "og:description", content: "只讀凍結四揀，量重疊覆蓋，唔改排名、唔當因果解釋。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExplainGlobalPage,
});

const EXACT_KEYS = ["4", "3", "2", "1", "0"] as const;

function LayerRow({ layer, maxAvg }: { layer: ExplainLayer; maxAvg: number }) {
  const s = layer.stats;
  const thin = s.n < 10;
  return (
    <tr className="border-b border-hairline last:border-0 align-top">
      <Td first>
        <span className="font-serif-tc text-[11px] font-bold text-ink">{layer.label}</span>
        {thin ? <span className="ml-1 text-[9px] text-lose">樣本太少</span> : null}
        <span className="mt-1 block max-w-[130px]">
          <TxBar ratio={Math.min(1, s.overlap.avgOverlap / Math.max(1, maxAvg))} tone={thin ? "ink" : "gold"} height={4} />
        </span>
      </Td>
      <Td>{s.n}</Td>
      <Td className={thin ? "text-ink-3" : "font-bold text-gold"}>{fixed(s.overlap.avgOverlap)}</Td>
      <Td>{pct(s.overlap.exactly["3"]?.rate ?? null, 1)}</Td>
      <Td>{pct(s.overlap.exactly["4"]?.rate ?? null, 1)}</Td>
      <Td>{pct(s.qplBox3Rate, 1)}</Td>
    </tr>
  );
}

function ExplainGlobalPage() {
  const g = EXPLAIN_GLOBAL;
  const [group, setGroup] = useState<"all" | "venue" | "dist" | "cross" | "src">("all");

  const layers = useMemo(() => {
    const pick = (test: (id: string) => boolean) => g.layers.filter((l) => test(l.id));
    if (group === "venue") return pick((id) => id === "venue_ST" || id === "venue_HV");
    if (group === "dist") return pick((id) => id.startsWith("band_"));
    if (group === "cross") return pick((id) => id.includes("_x_") || /^(ST|HV)_/.test(id));
    if (group === "src") return pick((id) => id.startsWith("src_"));
    return g.layers;
  }, [g.layers, group]);

  const maxAvg = Math.max(...g.layers.map((l) => l.stats.overlap.avgOverlap), 2.5);
  const ext = useLiveExtension();
  const head = ext.data?.combined ?? g.headlineOverlap;
  if (!ext.data && ext.isLoading) {
    // 未讀到命中率前唔出凍結窗數字做頭條，避免同一頁兩套數
  }

  return (
    <AppShell page="engine">
      <PageHead
        en="EXPLAIN · COVERAGE"
        title="四揀覆蓋解釋"
        desc={
          <>
            呢頁只做一件事：拎已鎖凍結四揀，同實際頭 4 名比對重疊幾匹，再按馬場、途程分層列出。
            <strong className="text-ink"> 係覆蓋統計，唔係「呢匹馬為何跑出」嘅因果解釋。</strong>
          </>
        }
      />

      <Card title="全窗主尺" en="HEADLINE" action={<Pill tone={ext.data ? "win" : "ink"}>{ext.data ? "即場" : ext.isLoading ? "讀取中" : "凍結窗"}</Pill>}>
        {!ext.data && ext.isLoading ? (
          <p className="py-6 text-center font-mono-tx text-[11px] text-ink-3">讀取命中率資料中…</p>
        ) : (<>
        <StatGrid cols={3}>
          <Stat label="平均中匹數" value={fixed(head.avgOverlap)} sub={`／4 · ${head.n} 場`} />
          <Stat label="只中 3 匹" value={pct(head.exactly["3"]?.rate)} sub={`${head.exactly["3"]?.count ?? 0} 場`} />
          <Stat label="只中 4 匹" value={pct(head.exactly["4"]?.rate)} sub={`${head.exactly["4"]?.count ?? 0} 場`} />
        </StatGrid>
        <div className="mt-3 space-y-1.5">
          {EXACT_KEYS.map((k) => {
            const b = head.exactly[k];
            return (
              <div key={k} className="min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="tabnum font-mono-tx text-[10px] text-ink-2">只中 {k} 匹</span>
                  <span className="tabnum font-mono-tx text-[10px] font-bold text-ink">
                    {pct(b?.rate)} · {b?.count ?? 0} 場
                  </span>
                </div>
                <TxBar ratio={b?.rate ?? 0} tone={k === "0" ? "lose" : k === "4" || k === "3" ? "win" : "gold"} height={4} className="mt-1" />
              </div>
            );
          })}
        </div>
        </>)}
        <p className="mt-2.5 text-[10px] leading-relaxed text-ink-3">
          窗口 {g.window.from} 至 {ext.data?.to ?? g.window.to} · {head.n} 場 · 引擎 {g.engine}
          {ext.data && ext.data.meetings.length ? ` · 其中 ${g.window.to} 之後嘅 ${ext.data.meetings.length} 個賽日即場讀命中率資料` : ""}
        </p>
        {ext.data?.meetings.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ext.data.meetings.map((m) => (
              <Link
                key={m.date}
                to="/explain/$date"
                params={{ date: m.date }}
                className="tabnum rounded-[6px] border border-gold-strong/50 bg-gold-bg px-2 py-1 font-mono-tx text-[10px] font-bold text-gold"
              >
                {m.date} · {m.races} 場 · 平均 {fixed(m.avg)}
              </Link>
            ))}
          </div>
        ) : null}
        <p className="mt-1.5 text-[10px] leading-relaxed text-ink-3">分層表同殘差仍係 {g.window.to} 凍結窗嘅 {g.window.races} 場。</p>
      </Card>

      <Card
        title={`分層覆蓋（下表只計至 ${g.window.to}，${g.window.races} 場）`}
        en="STRATIFIED"
        action={
          <span className="font-mono-tx text-[9px] text-ink-3">{layers.length} 層</span>
        }
      >
        <div className="mb-2">
          <Seg
            value={group}
            onChange={setGroup}
            options={[
              { value: "all", label: "全部" },
              { value: "venue", label: "馬場" },
              { value: "dist", label: "途程" },
              { value: "cross", label: "馬場×途程" },
              { value: "src", label: "分數來源" },
            ]}
          />
        </div>
        <Table head={[`分層（至 ${g.window.to}）`, "場數", "平均中", "中3", "中4", "位置Q覆蓋"]}>
          {layers.map((l) => (
            <LayerRow key={l.id} layer={l} maxAvg={maxAvg} />
          ))}
        </Table>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">
          場數少於 10 嘅分層只作記錄，唔可以當結論（例如長途只有 3 場）。分數來源分層唔代表「集成完勝」，樣本量同賽日結構都唔一樣。
        </p>
      </Card>

      <Card title={`兩頭殘差（只計至 ${g.window.to}）`} en="RESIDUAL">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["中 ≤1 匹", g.residual.overlap_le_1, "lose"],
              ["中 ≥3 匹", g.residual.overlap_ge_3, "win"],
            ] as const
          ).map(([label, b, tone]) => (
            <div key={label} className="rounded-[8px] border border-hairline bg-paper px-2.5 py-2">
              <p className="font-serif-tc text-[11px] font-bold text-ink">{label}</p>
              <p className="tabnum mt-1 font-mono-tx text-[15px] font-bold text-ink">{b.n} 場</p>
              <div className="mt-1.5 space-y-0.5">
                {Object.entries(b.byVenue).map(([v, n]) => (
                  <p key={v} className="tabnum font-mono-tx text-[9px] text-ink-3">
                    {VENUE_ZH[v] ?? v} {n} 場
                  </p>
                ))}
                {Object.entries(b.byBand).map(([bd, n]) => (
                  <p key={bd} className="tabnum font-mono-tx text-[9px] text-ink-3">
                    {bd} {n} 場
                  </p>
                ))}
              </div>
              <div className="mt-1.5">
                <TxBar ratio={b.n / Math.max(1, g.window.races)} tone={tone} height={4} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="逐場拆解" en="BY MEETING">
        <div className="flex flex-wrap gap-1.5">
          {EXPLAIN_MEETINGS.map((m) => (
            <Link
              key={m.date}
              to="/explain/$date"
              params={{ date: m.date }}
              className="rounded-[6px] border border-hairline bg-paper px-2 py-1.5 font-mono-tx text-[10px] font-bold text-ink hover:border-gold-strong"
            >
              {m.date} · {VENUE_ZH[m.venue ?? ""] ?? m.venue} · {m.races.length} 場
            </Link>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-3">最近 4 個賽日可逐場對比凍結四揀同實際頭 4。</p>
      </Card>

      <Card title="口徑同限制" en="CAVEATS">
        <div className="space-y-1.5 text-[11px] leading-relaxed text-ink-2">
          <p>
            <Pill>唯讀</Pill> 呢頁唔會改排名、唔會重算、唔會寫入凍結紀錄；四揀一律取已鎖版本。
          </p>
          <p>
            <Pill tone="lose">唔係因果</Pill> {g.disclaimer}
          </p>
          <p>
            <Pill>口徑</Pill> 呢頁用「凍結四揀同實際頭 4 重疊」，完整戰績頁用另一套口徑（彩池命中），兩邊數字唔可以直接對比。
          </p>
          <p>
            <Pill tone="gold">未凍結唔出</Pill> 未鎖或未有完整賽果嘅賽日唔會出現拆解同賽果框；逐匹紅綠因子（TreeSHAP）要喺引擎倉用同一版凍結模型計，未計好之前一律唔顯示、唔補數。
          </p>
        </div>
      </Card>

      <Disclaimer extra={`資料生成時間 ${g.generatedAt.slice(0, 19).replace("T", " ")} UTC`} />
    </AppShell>
  );
}
