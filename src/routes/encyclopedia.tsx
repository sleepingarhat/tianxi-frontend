import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import {
  Card,
  Disclaimer,
  Empty,
  ErrorNote,
  Loading,
  PageHead,
  Seg,
  Table,
  Td,
} from "@/components/tx/ui";
import { num, txApi } from "@/lib/tx-api";

export const Route = createFileRoute("/encyclopedia")({
  head: () => ({
    meta: [
      { title: "馬匹百科 · 天喜 TIANXI" },
      { name: "description", content: "搜尋香港現役與退役馬匹，查閱 天喜Elo 評分榜、勝場榜及騎師練馬師統計。" },
      { property: "og:title", content: "馬匹百科 · 天喜 TIANXI" },
      { property: "og:description", content: "馬匹搜尋、天喜Elo 評分榜與人馬統計。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EncyclopediaPage,
});

function EncyclopediaPage() {
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState<"elo" | "wins" | "starts">("elo");
  const [status, setStatus] = useState<"active" | "all">("active");

  const search = useQuery({
    queryKey: ["horseSearch", query],
    queryFn: () => txApi.horseSearch(query),
    enabled: query.trim().length > 0,
  });
  const leaders = useQuery({
    queryKey: ["horseLeaderboard", board, status],
    queryFn: () => txApi.horseLeaderboard(board, 20, status),
  });
  const jockeys = useQuery({ queryKey: ["jockeys"], queryFn: () => txApi.jockeys() });
  const trainers = useQuery({ queryKey: ["trainers"], queryFn: () => txApi.trainers() });

  const results: any[] = search.data?.horses || search.data?.results || [];

  return (
    <AppShell page="encyclopedia" ticker="馬匹百科 · 評分榜與人馬統計">
      <PageHead
        en="Encyclopedia"
        title="馬匹百科"
        desc="輸入馬名搜尋檔案，或瀏覽 天喜Elo 評分榜、勝場榜與騎練統計。"
      />

      <Card title="搜尋馬匹" en="Search">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(term.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="馬名或編號，例如 嘉應高昇 / J062"
            className="flex-1 rounded-[6px] border border-hairline bg-paper px-2.5 py-2 text-[12px] text-ink outline-none focus:border-gold-strong"
          />
          <button
            type="submit"
            className="rounded-[6px] border border-gold-strong/60 bg-gold-bg px-3 py-2 text-[12px] font-bold text-gold"
          >
            搜尋
          </button>
        </form>
        {query ? (
          search.isLoading ? (
            <Loading />
          ) : search.error ? (
            <ErrorNote error={search.error} />
          ) : results.length ? (
            <div className="mt-2 divide-y divide-hairline">
              {results.slice(0, 20).map((h: any) => (
                <Link key={h.id} to="/horse" search={{ id: h.id }} className="flex items-center gap-2 py-2">
                  <span className="flex-1 truncate font-serif-tc text-[13px] font-bold">{h.nameCh || h.nameEn}</span>
                  <span className="tabnum font-mono-tx text-[10px] text-ink-3">{h.code}</span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty label="沒有符合的馬匹" />
          )
        ) : null}
      </Card>

      <Card
        title="評分榜"
        en="Leaderboard"
        action={
          <div className="flex gap-1">
            <Seg
              value={board}
              onChange={setBoard}
              options={[
                { value: "elo", label: "天喜Elo" },
                { value: "wins", label: "勝場" },
                { value: "starts", label: "出賽" },
              ]}
            />
            <Seg
              value={status}
              onChange={setStatus}
              options={[
                { value: "active", label: "現役" },
                { value: "all", label: "全部" },
              ]}
            />
          </div>
        }
      >
        {leaders.isLoading ? (
          <Loading />
        ) : leaders.error ? (
          <ErrorNote error={leaders.error} />
        ) : (
          <Table head={["馬名", "天喜Elo", "冠", "出", "勝率"]}>
            {(leaders.data?.horses || []).map((h: any, i: number) => (
              <tr key={h.id} className={`border-b border-hairline ${i === 0 ? "bg-gold-bg/50" : ""}`}>
                <Td first>
                  <Link to="/horse" search={{ id: h.id }} className="font-serif-tc font-bold">
                    {h.nameCh || h.nameEn}
                  </Link>
                </Td>
                <Td>{num(h.elo, 0)}</Td>
                <Td>{h.totalWins ?? 0}</Td>
                <Td>{h.totalStarts ?? 0}</Td>
                <Td>{h.totalStarts ? `${((h.totalWins / h.totalStarts) * 100).toFixed(0)}%` : "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="騎師榜" en="Jockeys">
        {jockeys.isLoading ? (
          <Loading />
        ) : (
          <Table head={["騎師", "出賽", "冠", "勝率", "前三率"]}>
            {(jockeys.data?.jockeys || []).slice(0, 20).map((p: any, i: number) => (
              <tr key={p.id} className={`border-b border-hairline ${i === 0 ? "bg-gold-bg/50" : ""}`}>
                <Td first>
                  <span className="font-serif-tc font-bold">{p.nameCh}</span>
                </Td>
                <Td>{p.totalRides}</Td>
                <Td>{p.wins}</Td>
                <Td>{num(p.winRate)}%</Td>
                <Td>{num(p.top3Rate)}%</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card title="練馬師榜" en="Trainers">
        {trainers.isLoading ? (
          <Loading />
        ) : (
          <Table head={["練馬師", "出賽", "冠", "勝率"]}>
            {(trainers.data?.trainers || []).slice(0, 20).map((p: any, i: number) => (
              <tr key={p.id} className={`border-b border-hairline ${i === 0 ? "bg-gold-bg/50" : ""}`}>
                <Td first>
                  <span className="font-serif-tc font-bold">{p.nameCh}</span>
                </Td>
                <Td>{p.totalRunners}</Td>
                <Td>{p.wins}</Td>
                <Td>{num(p.winRate)}%</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Disclaimer />
    </AppShell>
  );
}
