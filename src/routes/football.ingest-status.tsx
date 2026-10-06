import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/tx/AppShell";
import { FootballNav } from "@/components/tx/FootballNav";
import { Card, Disclaimer, Loading, PageHead, Pill } from "@/components/tx/ui";

export const Route = createFileRoute("/football/ingest-status")({
  head: () => ({
    meta: [
      { title: "足球收料狀態 · 天喜 TIANXI" },
      { name: "description", content: "PitchAPI 每日 xG、Understat 每週補料同賽前傷停快照嘅收料紀錄，失敗會自動重試。" },
      { property: "og:title", content: "足球收料狀態 · 天喜 TIANXI" },
      { property: "og:description", content: "每日 xG 收料成功場數、每週後備補料同自動重試紀錄。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IngestStatusPage,
});

type Run = { id: number; at: string; event: string; status: string; conclusion: string | null };
type Job = {
  key: string;
  label: string;
  cadence: string;
  runs: Run[];
  status: null | {
    run_at?: string;
    window?: [string, string];
    matches_with_xg?: number;
    by_div?: Record<string, number>;
    attempts?: number;
    result?: string;
    snapshots?: number;
    failed?: number;
  };
};

const DIV_ZH: Record<string, string> = { E0: "英超", SP1: "西甲", I1: "意甲", D1: "德甲", F1: "法甲" };

const hk = (s?: string) =>
  s
    ? new Date(s).toLocaleString("zh-HK", { timeZone: "Asia/Hong_Kong", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
    : "—";

function runTone(r: Run) {
  if (r.status !== "completed") return { tone: "gold" as const, text: "進行中" };
  return r.conclusion === "success" ? { tone: "win" as const, text: "成功" } : { tone: "lose" as const, text: "失敗" };
}

function IngestStatusPage() {
  const q = useQuery({
    queryKey: ["footballIngestStatus"],
    queryFn: async () => {
      const r = await fetch("/api/public/football-ingest-status");
      if (!r.ok) throw new Error("讀取失敗");
      return (await r.json()) as { generated_at: string; jobs: Job[] };
    },
    refetchInterval: 120_000,
  });

  return (
    <AppShell page="football" ticker="收料狀態 · 失敗自動重試">
      <FootballNav />
      <PageHead
        en="Ingest Status"
        title="足球收料狀態"
        desc="每次收料最多試 3 次（相隔 10 分鐘），唔成功仲會喺補跑時段再試。只讀紀錄，唔影響預測、指紋同凍結機率。"
      />
      {q.isLoading ? (
        <Loading />
      ) : q.error || !q.data ? (
        <Card title="暫時讀唔到" en="Unavailable">
          <p className="text-[12px] text-ink-3">收料紀錄暫時讀唔到，稍後再試。</p>
        </Card>
      ) : (
        q.data.jobs.map((j) => {
          const last = j.runs[0];
          const t = last ? runTone(last) : null;
          const s = j.status;
          return (
            <Card key={j.key} title={j.label} en={j.cadence}>
              <div className="mb-2 flex items-center gap-2">
                {t ? <Pill tone={t.tone}>{t.text}</Pill> : <Pill tone="gold">未有紀錄</Pill>}
                <span className="tabnum font-mono-tx text-[10px] text-ink-3">最近一次 {hk(last?.at)}</span>
              </div>
              {s ? (
                <div className="mb-2 rounded-[10px] border border-hairline bg-paper-2 p-2.5">
                  {j.key === "prematch_goal" ? (
                    <p className="tabnum font-mono-tx text-[11px] text-ink-2">
                      今次快照 <b className="text-ink">{s.snapshots ?? 0}</b> 場 · 失敗 {s.failed ?? 0}
                    </p>
                  ) : (
                    <>
                      <p className="tabnum font-mono-tx text-[11px] text-ink-2">
                        {s.window?.[0]} 至 {s.window?.[1]} 有 xG：<b className="text-ink">{s.matches_with_xg ?? 0}</b> 場 · 試咗 {s.attempts ?? "—"} 次
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {Object.entries(s.by_div ?? {}).map(([d, n]) => (
                          <span key={d} className="rounded-full border border-hairline px-2 py-0.5 text-[10px] text-ink-2">
                            {DIV_ZH[d] ?? d} {n}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="mb-2 text-[11px] text-ink-3">未有狀態檔（新排程第一次跑完先會有）。</p>
              )}
              <ul className="divide-y divide-hairline">
                {j.runs.slice(0, 6).map((r) => {
                  const rt = runTone(r);
                  return (
                    <li key={r.id} className="flex items-center justify-between py-1.5">
                      <span className="tabnum font-mono-tx text-[10px] text-ink-2">
                        {hk(r.at)} · {r.event === "schedule" ? "排程" : "手動"}
                      </span>
                      <Pill tone={rt.tone}>{rt.text}</Pill>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })
      )}
      <Disclaimer />
    </AppShell>
  );
}
