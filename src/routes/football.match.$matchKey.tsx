import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { FootballNav } from "@/components/tx/FootballNav";
import { FootballCrest } from "@/components/tx/FootballCrest";
import { Card, Disclaimer, Pill } from "@/components/tx/ui";
import { PitchLineup, SubsList, type LSide } from "@/components/tx/PitchLineup";
import { supabase } from "@/integrations/supabase/client";
import { teamZh } from "@/lib/teamZh";
import { hkDateTime } from "@/lib/hkTime";
import { useCrests } from "@/lib/footballCrests";
import { FACTORS, fmtFactor, WEATHER_ZH, PITCH_ZH, type Ctx, type Led, type Snap } from "@/lib/footballFactors";

export const Route = createFileRoute("/football/match/$matchKey")({
  head: () => ({
    meta: [
      { title: "足球逐場詳情 · 陣容與機率 · 天喜 TIANXI" },
      { name: "description", content: "雙引擎預測機率、T−60 預計正選球場圖、球員名單、因子表同賽前解說；陣容屬研究軌。" },
      { property: "og:title", content: "足球逐場詳情 · 天喜 TIANXI" },
      { property: "og:description", content: "預計正選球場圖、因子表同雙引擎預測對照。" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MatchPage,
});

const OUT: Record<string, string> = { H: "主勝", D: "和局", A: "客勝", home: "主勝", draw: "和局", away: "客勝" };
const idx = (p: string) => Math.max(["H", "D", "A"].indexOf(p), ["home", "draw", "away"].indexOf(p));
type Unav = { name?: string; player_name?: string; short_name?: string; reason?: string; type?: string; status?: string; team?: string; side?: string };
type Bsd = { prob_home_win?: number; prob_draw?: number; prob_away_win?: number; expected_home_goals?: number; expected_away_goals?: number; model_version?: string; most_likely_score?: string; prob_over_25?: number; prob_btts_yes?: number };
const pc = (v: number) => `${(v * 100).toFixed(0)}%`;

/** numbertwenty 式三段機率條 */
function ProbStrip({ label, p, mark }: { label: string; p: number[]; mark: number }) {
  return (
    <div>
      <p className="mb-1 text-center text-[10px] font-bold tracking-[0.12em] text-ink-3">{label}</p>
      <div className="flex h-7 overflow-hidden rounded-full border border-hairline text-[11px] font-bold">
        {p.map((v, i) => (
          <div key={i} style={{ width: `${Math.max(v * 100, 8)}%` }}
            className={`grid place-items-center tabnum font-mono-tx ${i === 0 ? "bg-gold/80 text-ink" : i === 1 ? "bg-hairline text-ink" : "bg-win/70 text-paper"} ${i === mark ? "ring-2 ring-inset ring-ink" : ""}`}>
            {pc(v)}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchPage() {
  const { matchKey } = Route.useParams();
  const [tab, setTab] = useState<"lineup" | "context" | "factors" | "preview" | "compare" | "post">("lineup");
  const q = useQuery({
    queryKey: ["fbMatch", matchKey],
    queryFn: async () => {
      const [snap, led, set] = await Promise.all([
        supabase.from("football_lineup_snapshots").select("*").eq("match_key", matchKey).maybeSingle(),
        supabase.from("football_dual_ledger").select("*").eq("match_key", matchKey).maybeSingle(),
        supabase.from("football_lineup_settle").select("*").eq("match_key", matchKey).maybeSingle(),
      ]);
      return { snap: snap.data, led: led.data, set: set.data };
    },
  });
  const d = q.data;
  const div = d?.led?.div ?? d?.snap?.div ?? "";
  const rawH = d?.led?.home ?? d?.snap?.home ?? "", rawA = d?.led?.away ?? d?.snap?.away ?? "";
  const home = teamZh(div, rawH), away = teamZh(div, rawA);
  const getCrest = useCrests(div ? [div] : []);
  const lu = (d?.snap?.lineups ?? null) as { home?: LSide; away?: LSide } | null;
  const bsd = (d?.snap?.bsd_prediction ?? null) as Bsd | null;
  const unav = (Array.isArray(d?.snap?.unavailable) ? d!.snap!.unavailable : []) as Unav[];
  const ctx = (d?.snap?.context ?? null) as Ctx | null;
  type PS = Record<string, unknown>;
  const post = (d?.set?.post_stats ?? null) as { home?: PS; away?: PS } | null;
  const incidents = (Array.isArray(d?.set?.incidents) ? d!.set!.incidents : []) as { type?: string; minute?: number; added_time?: number | null; player?: string; is_home?: boolean; card_type?: string; player_in?: string; player_out?: string; home_score?: number; away_score?: number }[];
  const pFinal = (d?.led?.p_final ?? null) as number[] | null;
  const bsdP = bsd?.prob_home_win != null ? [bsd.prob_home_win / 100, (bsd.prob_draw ?? 0) / 100, (bsd.prob_away_win ?? 0) / 100] : null;
  const sideOf = (u: Unav) => (u.team ?? u.side ?? "").toLowerCase();
  const unavH = unav.filter((u) => sideOf(u).includes("home") || sideOf(u) === rawH.toLowerCase()).length;
  const unavA = unav.filter((u) => sideOf(u).includes("away") || sideOf(u) === rawA.toLowerCase()).length;

  const factors: [string, string, string][] = [
    ["天喜雙引擎", pFinal ? `${pc(pFinal[0]!)}／${pc(pFinal[1]!)}／${pc(pFinal[2]!)}` : "–", "主／和／客 · 凍結"],
    ["和局 引擎 A／B", d?.led ? `${pc(d.led.p_a[1] ?? 0)}／${pc(d.led.p_b_d)}` : "–", "A 凍結三格・B 對角膨脹"],
    ["預期入球 λ", d?.led ? `${d.led.lambda[0]?.toFixed(2)} – ${d.led.lambda[1]?.toFixed(2)}` : "–", "凍結"],
    ["外部模型 主和客", bsdP ? `${pc(bsdP[0]!)}／${pc(bsdP[1]!)}／${pc(bsdP[2]!)}` : "未有", "權重 0 · 對照"],
    ["外部預期入球", bsd?.expected_home_goals != null ? `${bsd.expected_home_goals.toFixed(2)} – ${bsd.expected_away_goals?.toFixed(2)}` : "未有", `最可能比分 ${bsd?.most_likely_score ?? "–"}`],
    ["預計陣式", lu?.home ? `${lu.home.formation ?? "?"} · ${lu.away?.formation ?? "?"}` : "未有", "主 · 客"],
    ["陣容可信度", lu?.home ? `${pc(lu.home.confidence ?? 0)}／${pc(lu.away?.confidence ?? 0)}` : "未有", "外部 AI（測試版）"],
    ["預計缺陣", d?.snap ? `${unav.length} 人${unav.length ? `（主 ${unavH}・客 ${unavA}）` : ""}` : "未有", "研究軌 · 未入模型"],
  ];

  // 本地規則賽前解說：只由已存數據砌句，唔耗 AI 額度
  const preview: string[] = [];
  if (pFinal && d?.led) {
    const top = idx(d.led.prediction);
    preview.push(`天喜雙引擎預測${OUT[d.led.prediction]}（${pc(pFinal[top]!)}）。`);
    const gap = Math.abs((pFinal[0] ?? 0) - (pFinal[2] ?? 0));
    preview.push(gap < 0.08 ? "主客勝機率相差少過 8 個百分點，屬實力接近場，和局值得留意。" : `${pFinal[0]! > pFinal[2]! ? home : away}佔優，主客機率差 ${pc(gap)}。`);
    const lam = (d.led.lambda[0] ?? 0) + (d.led.lambda[1] ?? 0);
    preview.push(lam < 2.3 ? `合計預期入球 ${lam.toFixed(2)}，偏低入球格局。` : `合計預期入球 ${lam.toFixed(2)}，入球機會唔少。`);
  }
  if (bsdP && pFinal) {
    const bTop = bsdP.indexOf(Math.max(...bsdP));
    preview.push(bTop === idx(d!.led!.prediction) ? "外部模型方向一致。" : `外部模型就傾向${["主勝", "和局", "客勝"][bTop]}，兩者有分歧。`);
  }
  if (lu?.home) preview.push(`預計陣式 ${home} ${lu.home.formation ?? "?"}、${away} ${lu.away?.formation ?? "?"}。`);
  if (ctx?.weather) preview.push(`天氣${WEATHER_ZH[ctx.weather.description ?? ""] ?? ctx.weather.description ?? ""}，${ctx.weather.temperature_c ?? "?"}°C，風速 ${ctx.weather.wind_speed ?? "?"} m/s。`);
  if (ctx?.travel_km != null) preview.push(ctx.travel_km > 400 ? `客隊長途跋涉 ${ctx.travel_km} km。` : `客隊路程 ${ctx.travel_km} km，屬短途。`);
  if (ctx?.derby) preview.push("今場係同城打吡。");
  if (ctx?.referee?.avg_yellow_per_match != null) preview.push(`球證 ${ctx.referee.name ?? ""} 場均 ${ctx.referee.avg_yellow_per_match.toFixed(1)} 張黃牌、${(ctx.referee.avg_goals_per_match ?? 0).toFixed(1)} 球。`);
  if (ctx?.h2h?.total_matches) preview.push(`近 ${ctx.h2h.total_matches} 次對賽 主 ${ctx.h2h.home_wins}・和 ${ctx.h2h.draws}・客 ${ctx.h2h.away_wins}，場均 ${ctx.h2h.avg_total_goals ?? "?"} 球。`);
  if (unav.length) preview.push(`賽前名單列 ${unav.length} 人缺陣或存疑。`);

  const TABS = [["lineup", "陣容"], ["context", "賽前情報"], ["factors", "因子表"], ["preview", "賽前解說"], ["post", "賽後數據"], ["compare", "完場對比"]] as const;

  return (
    <AppShell page="football">
      <FootballNav />
      <section className="mx-4 mt-3 rounded-[12px] border border-hairline bg-paper p-4">
        <p className="text-center text-[11px] text-ink-3">{d?.led ? `${div} · ${hkDateTime(d.led.kickoff_utc)}` : q.isLoading ? "載入中…" : "未有此場資料"}</p>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <FootballCrest name={home} src={getCrest(div, rawH)} size={52} />
            <b className="font-serif-tc text-[14px] text-ink">{home}</b>
          </div>
          <div className="text-center">
            <span className="font-mono-tx text-[22px] font-bold text-ink">vs</span>
            {d?.led ? <div className="mt-1"><Pill tone="gold">{OUT[d.led.prediction]}</Pill></div> : null}
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <FootballCrest name={away} src={getCrest(div, rawA)} size={52} />
            <b className="font-serif-tc text-[14px] text-ink">{away}</b>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {pFinal ? <ProbStrip label="天喜雙引擎預測 · T−60 凍結" p={pFinal} mark={idx(d!.led!.prediction)} /> : null}
          {bsdP ? <ProbStrip label="外部模型對照 · 權重 0" p={bsdP} mark={-1} /> : null}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-bold text-ink-3"><span>主勝</span><span>和局</span><span>客勝</span></div>
      </section>

      <nav className="mx-4 mt-3 flex gap-1 overflow-x-auto border-b border-hairline">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`shrink-0 px-3 py-2 text-[12px] font-bold ${tab === k ? "border-b-2 border-gold text-ink" : "text-ink-3"}`}>{l}</button>
        ))}
      </nav>

      {tab === "lineup" ? (
        <>
          <Card title="預計陣容" en={d?.snap?.lineup_status === "confirmed" ? "Confirmed" : "Predicted · T−60"}>
            {lu?.home && lu?.away ? (
              <>
                <div className="mb-2 grid grid-cols-2 text-[12px]">
                  <span className="font-bold text-ink">{away} <small className="font-mono-tx text-ink-3">{lu.away.formation}</small></span>
                  <span className="text-right font-bold text-ink">{home} <small className="font-mono-tx text-ink-3">{lu.home.formation}</small></span>
                </div>
                <PitchLineup home={lu.home} away={lu.away} />
                <p className="mt-2 text-[10px] text-ink-3">上半＝客隊、下半＝主隊。外部 AI 預計陣容（測試版）。</p>
              </>
            ) : <p className="text-[12px] text-ink-3">{d?.snap ? `未攞到陣容（${d.snap.error ?? "未公布"}）` : "此場未有 T−60 陣容快照（快照由 2026-09-30 起記錄）。"}</p>}
          </Card>
          {lu?.home && lu?.away ? (
            <div className="grid md:grid-cols-2">
              <Card title={`${home} 後備`} en="Substitutes"><SubsList side={lu.home} /></Card>
              <Card title={`${away} 後備`} en="Substitutes"><SubsList side={lu.away} /></Card>
            </div>
          ) : null}
          <Card title="缺陣名單" en="Unavailable">
            {unav.length ? (
              <ul className="divide-y divide-hairline text-[12px]">
                {unav.map((u, i) => <li key={i} className="flex justify-between gap-2 py-1.5"><span className="truncate text-ink">{u.name ?? u.short_name ?? u.player_name}</span><span className="shrink-0 text-ink-3">{u.reason ?? u.type ?? u.status ?? ""}</span></li>)}
              </ul>
            ) : <p className="text-[12px] text-ink-3">未有資料</p>}
          </Card>
        </>
      ) : null}

      {tab === "factors" ? (
        <Card title="因子表" en="Factors">
          {[...new Set(FACTORS.map((f) => f.group))].map((g) => (
            <div key={g} className="mb-3">
              <p className="mb-1 text-[10px] font-bold tracking-[0.12em] text-ink-3">{g}</p>
              <table className="w-full text-[12px]"><tbody>
                {FACTORS.filter((f) => f.group === g).map((f) => (
                  <tr key={f.key} className="border-b border-hairline last:border-0">
                    <td className="py-1.5 text-ink">{f.label}</td>
                    <td className="py-1.5 text-right tabnum font-mono-tx text-ink">{fmtFactor(f, f.get((d?.led ?? null) as unknown as Led | null, (d?.snap ?? null) as Snap))}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          ))}
          <table className="w-full text-[12px]"><tbody>
            {factors.slice(5).map(([k, v, n]) => (
              <tr key={k} className="border-b border-hairline last:border-0">
                <td className="py-1.5 text-ink">{k}<small className="block text-ink-3">{n}</small></td>
                <td className="py-1.5 text-right tabnum font-mono-tx text-ink">{v}</td>
              </tr>
            ))}
          </tbody></table>
          <p className="mt-2 text-[10px] text-ink-3">凍結欄唔會改；外部、情境、陣容、市場欄只作研究對照，權重 0。<Link to="/football/features" className="underline">睇全日因子特徵表 →</Link></p>
        </Card>
      ) : null}

      {tab === "context" ? (
        <>
          <Card title="比賽情境" en="Match context">
            {ctx ? (
              <div className="grid grid-cols-2 gap-2 text-[12px] md:grid-cols-4">
                {[
                  ["輪次", ctx.round ?? "–"],
                  ["天氣", ctx.weather ? `${WEATHER_ZH[ctx.weather.description ?? ""] ?? ctx.weather.description ?? "–"} ${ctx.weather.temperature_c ?? "?"}°C` : "–"],
                  ["風速", ctx.weather?.wind_speed != null ? `${ctx.weather.wind_speed} m/s` : "–"],
                  ["場地", PITCH_ZH(ctx.pitch_condition)],
                  ["客隊路程", ctx.travel_km != null ? `${ctx.travel_km} km` : "–"],
                  ["同城打吡", ctx.derby == null ? "–" : ctx.derby ? "是" : "否"],
                  ["中立場", ctx.neutral == null ? "–" : ctx.neutral ? "是" : "否"],
                  ["快照時間", d?.snap ? hkDateTime(d.snap.captured_at) : "–"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-[8px] border border-hairline bg-paper-2 px-2 py-1.5">
                    <p className="text-[10px] text-ink-3">{k}</p><p className="font-bold text-ink">{v}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-[12px] text-ink-3">此場未有賽前情報（由 2026-09-30 起 T−60 快照記錄）。</p>}
          </Card>
          {ctx?.referee ? (
            <Card title="球證" en="Referee">
              <p className="mb-2 font-bold text-ink">{ctx.referee.name}</p>
              <div className="grid grid-cols-2 gap-2 text-[12px] md:grid-cols-5">
                {[["本季場數", ctx.referee.matches], ["場均黃牌", ctx.referee.avg_yellow_per_match?.toFixed(2)], ["場均紅牌", ctx.referee.avg_red_per_match?.toFixed(2)], ["場均入球", ctx.referee.avg_goals_per_match?.toFixed(2)], ["場均犯規", ctx.referee.avg_fouls_per_match?.toFixed(1)]].map(([k, v]) => (
                  <div key={String(k)} className="rounded-[8px] border border-hairline px-2 py-1.5"><p className="text-[10px] text-ink-3">{k}</p><p className="tabnum font-mono-tx font-bold text-ink">{v ?? "–"}</p></div>
                ))}
              </div>
            </Card>
          ) : null}
          {ctx?.h2h?.total_matches ? (
            <Card title="對賽往績" en="Head to head">
              <ProbStrip label={`近 ${ctx.h2h.total_matches} 次 · 場均 ${ctx.h2h.avg_total_goals ?? "?"} 球`} p={[(ctx.h2h.home_wins ?? 0) / ctx.h2h.total_matches, (ctx.h2h.draws ?? 0) / ctx.h2h.total_matches, (ctx.h2h.away_wins ?? 0) / ctx.h2h.total_matches]} mark={-1} />
              <ul className="mt-3 divide-y divide-hairline text-[12px]">
                {(ctx.h2h.recent_matches ?? []).slice(0, 8).map((m, i) => (
                  <li key={i} className="grid grid-cols-[4.5rem_1fr_3rem_1fr] items-center gap-1 py-1.5">
                    <span className="font-mono-tx text-[10px] text-ink-3">{m.date.slice(0, 10)}</span>
                    <span className="truncate text-right text-ink">{teamZh(div, m.home)}</span>
                    <b className="text-center font-mono-tx text-ink">{m.score}</b>
                    <span className="truncate text-ink">{teamZh(div, m.away)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          {ctx?.odds ? (
            <Card title="開盤價" en="Odds · 只記帳">
              <div className="grid grid-cols-3 gap-2 text-center text-[12px] md:grid-cols-7">
                {[["主", ctx.odds.home_win], ["和", ctx.odds.draw], ["客", ctx.odds.away_win], ["大 2.5", ctx.odds.over_25_goals], ["細 2.5", ctx.odds.under_25_goals], ["兩隊入", ctx.odds.btts_yes], ["唔係", ctx.odds.btts_no]].map(([k, v]) => (
                  <div key={String(k)} className="rounded-[8px] border border-hairline px-1 py-1.5"><p className="text-[10px] text-ink-3">{k}</p><p className="tabnum font-mono-tx font-bold text-ink">{typeof v === "number" ? v.toFixed(2) : "–"}</p></div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-ink-3">賠率權重永遠 0，只作記帳同對照。</p>
            </Card>
          ) : null}
        </>
      ) : null}

      {tab === "post" ? (
        <>
          <Card title="完場技術統計" en="Post-match stats">
            {post?.home && post?.away ? (
              <div className="space-y-2">
                {([["expected_goals", "xG"], ["expected_goals_on_target", "射正 xG"], ["ball_possession", "控球 %"], ["total_shots", "射門"], ["shots_on_target", "射正"], ["shots_inside_box", "禁區內射門"], ["corner_kicks", "角球"], ["dangerous_attack", "危險進攻"], ["touches_in_penalty_area", "禁區觸球"], ["passes", "傳球"], ["pass_accuracy_pct", "傳球準繩 %"], ["tackles", "鏟截"], ["interceptions", "攔截"], ["fouls", "犯規"], ["yellow_cards", "黃牌"], ["red_cards", "紅牌"], ["goalkeeper_saves", "門將撲救"], ["average_rating", "平均評分"]] as const).map(([k, l]) => {
                  const h = Number(post.home![k] ?? NaN), a = Number(post.away![k] ?? NaN);
                  if (Number.isNaN(h) || Number.isNaN(a)) return null;
                  const t = h + a || 1;
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-[11px]"><b className="tabnum font-mono-tx text-ink">{h}</b><span className="text-ink-3">{l}</span><b className="tabnum font-mono-tx text-ink">{a}</b></div>
                      <div className="mt-0.5 flex h-1.5 overflow-hidden rounded-full bg-hairline"><span className="bg-gold" style={{ width: `${(h / t) * 100}%` }} /><span className="ml-auto bg-win/70" style={{ width: `${(a / t) * 100}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-[12px] text-ink-3">完場兩個鐘後自動收錄 xG 同技術統計。</p>}
          </Card>
          {incidents.length ? (
            <Card title="比賽事件" en="Timeline">
              <ul className="divide-y divide-hairline text-[12px]">
                {[...incidents].reverse().filter((e) => e.type === "goal" || e.type === "card" || e.type === "substitution").map((e, i) => (
                  <li key={i} className={`flex items-center gap-2 py-1.5 ${e.is_home ? "" : "flex-row-reverse text-right"}`}>
                    <span className="w-10 shrink-0 font-mono-tx text-[11px] text-ink-3">{e.minute}{e.added_time ? `+${e.added_time}` : ""}'</span>
                    <span>{e.type === "goal" ? "⚽" : e.type === "card" ? (e.card_type === "red" ? "🟥" : "🟨") : "⇄"}</span>
                    <span className="truncate text-ink">{e.type === "substitution" ? `${e.player_in} ↔ ${e.player_out}` : e.player}{e.type === "goal" && e.home_score != null ? ` (${e.home_score}-${e.away_score})` : ""}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          <p className="mx-4 text-[10px] text-ink-3">賽後數據只作「應得結果」研究同 xG 後備，唔入賽前預測。</p>
        </>
      ) : null}

      {tab === "preview" ? (
        <Card title="賽前解說" en="Rule-based preview">
          {preview.length ? <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink">{preview.map((s, i) => <li key={i}>{s}</li>)}</ul> : <p className="text-[12px] text-ink-3">未有足夠數據</p>}
          <p className="mt-2 text-[10px] text-ink-3">由固定規則按已存數據砌句，唔用 AI，唔改預測。</p>
        </Card>
      ) : null}

      {tab === "compare" ? (
        <Card title="完場對比" en="Predicted vs official">
          {d?.set ? (
            <table className="w-full text-[12px]"><tbody>
              <tr className="border-b border-hairline"><td className="py-2 text-ink">{home} 正選命中</td><td className="text-right font-mono-tx">{d.set.home_hits}/11</td></tr>
              <tr className="border-b border-hairline"><td className="py-2 text-ink">{away} 正選命中</td><td className="text-right font-mono-tx">{d.set.away_hits}/11</td></tr>
              <tr className="border-b border-hairline"><td className="py-2 text-ink">主隊陣式</td><td className="text-right">{d.set.home_formation_ok ? "● 啱" : "○ 唔啱"}</td></tr>
              <tr><td className="py-2 text-ink">客隊陣式</td><td className="text-right">{d.set.away_formation_ok ? "● 啱" : "○ 唔啱"}</td></tr>
            </tbody></table>
          ) : <p className="text-[12px] text-ink-3">完場兩個鐘後自動攞官方正選對比。</p>}
        </Card>
      ) : null}

      <div className="px-4 pt-2"><Link to="/football/dual-ledger" className="text-[12px] text-ink-2 underline">← 返雙引擎戰績</Link></div>
      <Disclaimer extra="陣容快照屬研究軌，唔入正式戰績，唔改凍結預測。唔提供投注建議。" />
    </AppShell>
  );
}
