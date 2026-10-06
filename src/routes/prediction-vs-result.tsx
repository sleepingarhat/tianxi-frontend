import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { AlphaGuard } from "@/components/tx/AlphaGuard";
import { AppShell } from "@/components/tx/AppShell";
import { Loading, Pill } from "@/components/tx/ui";
import { MeterBar } from "@/components/tx/viz";
import {
  canonicalHorseId,
  cleanTime,
  num,
  styleLabel,
  txApi,
  type RunningStyle,
} from "@/lib/tx-api";

export const Route = createFileRoute("/prediction-vs-result")({
  head: () => ({
    meta: [
      { title: "預測與賽果 · 天喜 TIANXI" },
      {
        name: "description",
        content: "揀賽事日期同場次，並列比對天喜預測首 4 名與實際賽果首 4 名，同時出現嘅馬匹以金黃底標記。",
      },
      { property: "og:title", content: "預測與賽果 · 天喜 TIANXI" },
      { property: "og:description", content: "天喜預測首 4 名 vs 官方賽果首 4 名逐場並列比對。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComparePage,
});

type Horse = {
  horseId?: string | null;
  horse_id?: string | null;
  id?: string | null;
  horseNumber?: string | number | null;
  no?: string | number | null;
  nameCh?: string | null;
  name?: string | null;
  draw?: string | number | null;
  finishingPosition?: number | null;
};

function keyOf(h?: Horse | null) {
  if (!h) return null;
  if (h.horseId) return "h:" + h.horseId;
  if (h.horse_id) return "h:" + h.horse_id;
  if (h.id) return "h:" + h.id;
  const no = h.horseNumber ?? h.no;
  const nm = h.nameCh || h.name;
  if (no != null && no !== "" && nm) return `no:${no}|nm:${String(nm).trim().toLowerCase()}`;
  return null;
}

function rankColor(rank: number) {
  if (rank === 1) return "text-[#D4A93C]";
  if (rank === 2) return "text-[#8F8268]";
  if (rank === 3) return "text-[#A07A1F]";
  return "text-ink-3";
}

function ComparePage() {
  const [date, setDate] = useState<string>("");
  const [raceId, setRaceId] = useState<string>("");

  const list = useQuery({ queryKey: ["meetings", 60], queryFn: () => txApi.meetings("?limit=60") });
  const meetings: any[] = list.data?.meetings || [];

  // 預設揀最近一個已過去（有賽果）嘅賽馬日
  useEffect(() => {
    if (date || !meetings.length) return;
    const today = new Date().toISOString().slice(0, 10);
    const found = meetings.find((m: any) => m.date <= today) || meetings[0];
    setDate(found.date);
  }, [meetings, date]);

  const meeting = useQuery({
    queryKey: ["meeting", date],
    queryFn: () => txApi.meeting(date),
    enabled: !!date,
    refetchInterval: 60_000,
  });
  const races: any[] = meeting.data?.races || [];

  useEffect(() => {
    if (!races.length) return;
    if (races.some((r: any) => String(r.id) === raceId)) return;
    setRaceId(String(races[0].id));
  }, [races, raceId]);

  const picks = useQuery({
    queryKey: ["topPicks", raceId],
    queryFn: () => txApi.topPicks(raceId),
    enabled: !!raceId,
  });
  const raceDetail = useQuery({
    queryKey: ["race", raceId],
    queryFn: () => txApi.race(raceId),
    enabled: !!raceId,
  });
  // 存檔預測（賽前鎖定版）：已有賽果嘅賽日一律以後端凍結紀錄為準，
  // 避免顯示事後重算版本，並可標明當日實際採用嘅集成比重 α。
  const frozen = useQuery({
    queryKey: ["hitRate", date],
    queryFn: () => txApi.hitRate(date),
    enabled: !!date,
  });
  const selectedRaceNumber = races.find((r: any) => String(r.id) === raceId)?.raceNumber;
  const frozenRaces: any[] = (frozen.data?.races || [])
    .slice()
    .sort((a: any, b: any) => Number(a.raceNumber) - Number(b.raceNumber));
  const frozenSummary: any = frozen.data?.summary && frozenRaces.length ? frozen.data.summary : null;
  const frozenRace = frozenRaces.find((r: any) => Number(r.raceNumber) === Number(selectedRaceNumber));
  const frozenTop4: Horse[] = (frozenRace?.predictedTop4 || []).slice(0, 4);

  const left: Horse[] = frozenTop4.length
    ? frozenTop4
    : (picks.data?.picks || []).slice(0, 4);
  // 首選來源：後端逐匹回傳 scoreSource（lgb = 天喜LGB 融合模型；baseline／elo = 天喜ELO 基準）
  // 同一場可能部分馬匹退回基準，故以整場為準：有任何 lgb 即屬天喜LGB 排序。
  const pickSources = (frozenTop4.length ? frozenTop4 : picks.data?.picks || []).map((p: any) =>
    String(p?.scoreSource || ""),
  );
  const allSources = pickSources.length
    ? pickSources
    : [String(frozenRace?.scoreSource || picks.data?.scoreSource || "")];
  const anyLgb = allSources.some((s: string) => s.includes("lgb") || s.includes("oracle"));
  const allLgb = anyLgb && allSources.every((s: string) => s.includes("lgb") || s.includes("oracle"));
  // 當日實際採用嘅集成比重（α）：優先用後端凍結紀錄欄位，
  // 否則由凍結標籤／逐匹 scoreSource（例：tx-oracle-v3 (ensemble α=0.88)）解析。
  const frozenAlpha: number | null = (() => {
    const v = frozenRace?.ensembleAlpha;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    const texts = [String(frozenRace?.scoreSource || ""), ...pickSources];
    for (const t of texts) {
      const m = /α\s*=\s*([0-9.]+)/.exec(t);
      if (m) {
        const n = Number(m[1]);
        if (Number.isFinite(n)) return n;
      }
    }
    return null;
  })();

  const picksSourceLabel = allLgb
    ? "天喜LGB"
    : anyLgb
      ? "天喜LGB（部分退回天喜ELO）"
      : allSources.some(Boolean)
        ? "天喜ELO"
        : "天喜引擎";

  const right: Horse[] = ((raceDetail.data?.horses || []) as Horse[])
    .filter((h) => h?.finishingPosition != null && h.finishingPosition >= 1 && h.finishingPosition <= 4)
    .sort((a, b) => (a.finishingPosition ?? 9) - (b.finishingPosition ?? 9))
    .slice(0, 4);

  const styles = useQuery({
    queryKey: ["cmpStyles", raceId, left.length, right.length],
    queryFn: () =>
      txApi.runningStyles(
        [...left, ...right].map((h) => String(h.horseId || h.horse_id || h.id || "")),
        { raceId },
      ),
    enabled: !!raceId && (left.length > 0 || right.length > 0),
  });
  const styleMap: Record<string, RunningStyle> = {};
  for (const s of styles.data?.styles || []) styleMap[String(s.horseId)] = s;

  const leftKeys = new Set(left.map(keyOf).filter(Boolean) as string[]);
  const rightKeys = new Set(right.map(keyOf).filter(Boolean) as string[]);
  const isMatch = (h: Horse, other: Set<string>) => {
    const k = keyOf(h);
    return !!(k && other.has(k));
  };
  const hits = left.filter((h) => isMatch(h, rightKeys)).length;

  const m = meeting.data;
  const metaLine = !date
    ? ""
    : [
        date,
        m?.venueName || m?.venue,
        m?.trackCondition ? `場地 ${m.trackCondition}` : null,
        races.length ? `共 ${races.length} 場` : null,
      ]
        .filter(Boolean)
        .join(" · ");

  const loading = (picks.isLoading && frozen.isLoading) || raceDetail.isLoading;

  const Cell = ({ h, rank, matched }: { h: Horse; rank: number; matched: boolean }) => {
    const no = h.horseNumber ?? h.no;
    const nm = h.nameCh || h.name || "";
    const hid = canonicalHorseId(h.horseId || h.horse_id || h.id);
    const sl = styleLabel(styleMap[hid]);
    return (
      <div
        className={`grid min-h-0 flex-1 grid-cols-[28px_1fr_auto] items-center gap-2 border-b border-hairline px-3 py-2.5 last:border-b-0 ${
          matched ? "border-[#D4A93C] bg-gradient-to-b from-[#FFF4C2] to-[#F6E08C]" : ""
        }`}
      >
        <div className={`text-center font-serif-tc text-[18px] font-black leading-none ${matched ? "text-[#5A4210]" : rankColor(rank)}`}>
          {rank}
        </div>
        <div className="flex min-w-0 flex-col gap-[2px] leading-[1.15]">
          {no != null && no !== "" ? (
            <div className={`tabnum font-mono-tx text-[11px] font-extrabold ${matched ? "text-[#5A4210]" : "text-ink-3"}`}>
              #{no}
            </div>
          ) : null}
          <div className={`flex items-center gap-1 truncate font-serif-tc text-[13px] font-bold ${matched ? "text-[#2E2108]" : "text-ink"}`}>
            {matched ? <span className="font-black text-[#7A5A20]">✓</span> : null}
            {hid ? (
              <Link to="/horse" search={{ id: hid }} className="truncate">
                {nm}
              </Link>
            ) : (
              <span className="truncate">{nm}</span>
            )}
            {sl ? (
              <span
                className={`shrink-0 rounded-[4px] border px-1 font-mono-tx text-[9px] font-bold ${
                  matched ? "border-[#D4A93C] bg-white/60 text-[#5A4210]" : "border-hairline bg-paper text-ink-2"
                }`}
              >
                {sl}
              </span>
            ) : null}
          </div>
        </div>
        {h.draw != null && h.draw !== "" ? (
          <div
            className={`tabnum shrink-0 rounded-[6px] border px-[7px] py-[3px] font-mono-tx text-[11px] font-bold ${
              matched ? "border-[#D4A93C] bg-white/55 text-[#5A4210]" : "border-hairline bg-paper-2 text-ink-2"
            }`}
          >
            <span className={`mr-[2px] font-medium ${matched ? "text-[#7A5A20]" : "text-ink-3"}`}>檔</span>
            {h.draw}
          </div>
        ) : null}
      </div>
    );
  };

  const EmptySide = ({ title }: { title: string }) => (
    <div className="px-4 py-6 text-center text-[12px] leading-relaxed text-ink-3">
      <strong className="mb-1 block text-[13px] text-ink-2">{title}</strong>
    </div>
  );

  return (
    <AppShell page="" ticker={metaLine || "載入賽事…"}>
      <section className="px-5 pb-2 pt-[22px]">
        <h1 className="font-serif-tc text-[24px] font-black leading-[1.15] tracking-[-0.005em] text-ink">
          <small className="mb-1.5 block font-mono-tx text-[10px] font-bold uppercase tracking-[0.22em] text-ink-3">
            Prediction vs Result
          </small>
          <span className="fx-spotlight block">預測與賽果</span>
        </h1>
        <p className="mt-2 text-[12px] leading-[1.55] text-ink-2">
          揀賽事日期同場次，比對天喜預測首 4 名同實際賽果首 4 名。左右兩邊同時出現嘅馬匹會用
          <b className="text-gold">金黃底</b>標記。
        </p>
      </section>

      <section className="grid grid-cols-2 gap-2.5 border-b border-hairline px-5 pb-3.5 pt-2">
        <div>
          <label htmlFor="cmp-date" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-3">
            賽事日期
          </label>
          <select
            id="cmp-date"
            value={date}
            onChange={(e) => {
              setRaceId("");
              setDate(e.target.value);
            }}
            className="w-full appearance-none rounded-[10px] border border-hairline bg-paper-2 px-3 py-[10px] font-sans-tc text-[13px] font-semibold text-ink"
          >
            {meetings.length === 0 ? <option>載入中…</option> : null}
            {meetings.map((mm: any) => (
              <option key={mm.id ?? mm.date} value={mm.date}>
                {mm.date}
                {mm.venueName ? ` · ${mm.venueName}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cmp-race" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-ink-3">
            場次
          </label>
          <select
            id="cmp-race"
            value={raceId}
            disabled={!races.length}
            onChange={(e) => setRaceId(e.target.value)}
            className="w-full appearance-none rounded-[10px] border border-hairline bg-paper-2 px-3 py-[10px] font-sans-tc text-[13px] font-semibold text-ink disabled:opacity-60"
          >
            {races.length === 0 ? <option>請先揀日期</option> : null}
            {races.map((r: any) => {
              const t = cleanTime(r.startTime);
              return (
                <option key={r.id} value={String(r.id)}>
                  R{r.raceNumber}
                  {t ? ` · ${t}` : ""}
                  {r.distance ? ` · ${r.distance}m` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </section>

      <div className="tabnum min-h-[18px] border-b border-hairline px-5 py-2.5 font-mono-tx text-[11px] tracking-[0.06em] text-ink-3">
        {metaLine}
      </div>

      {/* 賽日總覽：主指標、彩池命中，同逐場命中導覽條 */}
      {frozenSummary ? (
        <section className="mx-4 mt-3 rounded-[12px] border border-hairline bg-paper-2 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-serif-tc text-[13px] font-bold text-ink">
              賽日總覽
              <small className="ml-2 font-mono-tx text-[8px] uppercase tracking-[0.2em] text-ink-3">Meeting Recap</small>
            </p>
            <p className="tabnum font-mono-tx text-[10px] text-ink-3">{frozenSummary.racesEvaluated ?? 0} 場已評核</p>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <MeterBar
              label="四揀平均命中"
              en="Top4"
              value={`${num(frozenSummary.top4AvgIntersect, 2)}／4`}
              ratio={frozenSummary.top4AvgIntersect != null ? Number(frozenSummary.top4AvgIntersect) / 4 : null}
              tone="gold"
              sub="主指標"
            />
            <MeterBar
              label="三甲平均命中"
              en="Top3"
              value={`${num(frozenSummary.top3AvgIntersect, 2)}／3`}
              ratio={frozenSummary.top3AvgIntersect != null ? Number(frozenSummary.top3AvgIntersect) / 3 : null}
              tone="ink"
              sub="輔助指標"
            />
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-hairline pt-2">
            <Pill tone={frozenSummary.trioHits ? "win" : "ink"}>
              三重彩（頭三名複式） {frozenSummary.trioHits ?? 0} 場
            </Pill>
            <Pill tone={frozenSummary.first4Hits ? "win" : "ink"}>
              四重彩（頭四名複式） {frozenSummary.first4Hits ?? 0} 場
            </Pill>
            <Pill tone={frozenSummary.top3AnyHits ? "gold" : "ink"}>三甲任中 {frozenSummary.top3AnyHits ?? 0} 場</Pill>
          </div>

          {/* 逐場命中導覽：撳一下即跳到該場並列比對 */}
          <div className="no-scrollbar -mx-0.5 mt-2.5 flex gap-1 overflow-x-auto px-0.5">
            {frozenRaces.map((fr: any) => {
              const rid = races.find((r: any) => Number(r.raceNumber) === Number(fr.raceNumber))?.id;
              const n = Number(fr.top4IntersectCount ?? 0);
              const on = Number(selectedRaceNumber) === Number(fr.raceNumber);
              const tone =
                n >= 3 ? "border-win bg-win/10 text-win" : n >= 2 ? "border-gold-strong bg-gold-bg text-gold" : "border-hairline bg-paper text-ink-3";
              return (
                <button
                  key={fr.raceNumber}
                  type="button"
                  disabled={!rid}
                  onClick={() => rid && setRaceId(String(rid))}
                  className={`shrink-0 rounded-[6px] border px-2 py-1 text-center transition-colors ${tone} ${
                    on ? "ring-1 ring-gold-strong" : ""
                  }`}
                >
                  <span className="block font-mono-tx text-[9px] font-bold leading-none">R{fr.raceNumber}</span>
                  <span className="tabnum mt-[3px] block font-mono-tx text-[11px] font-extrabold leading-none">{n}/4</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 集成比重健康：α 過低即代表天喜LGB 未真正影響排名 */}
      <div className="mx-4 mt-2">
        <AlphaGuard alpha={frozenAlpha} frozen={frozenTop4.length > 0} />
      </div>

      <div className="px-4 pb-[22px] pt-4">
        <div className="mx-auto grid aspect-square max-w-[560px] grid-cols-2 grid-rows-[auto_1fr] overflow-hidden rounded-[14px] border border-hairline bg-paper shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_4px_10px_rgba(58,38,8,.08),0_18px_36px_-16px_rgba(90,66,16,.16)] max-[360px]:aspect-auto max-[360px]:min-h-[380px]">
          <div className="border-b border-r border-hairline bg-paper-2 px-3 py-2.5 text-center font-serif-tc text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink">
            預測
            <small className="mt-0.5 block font-mono-tx text-[9px] font-semibold tracking-[0.18em] text-ink-3">
              {picksSourceLabel}
              {frozenAlpha != null ? ` · α=${frozenAlpha.toFixed(2)}` : ""} · TOP 4
              <span className="mt-0.5 block font-sans-tc text-[9px] font-bold tracking-normal text-ink-3">
                {frozenTop4.length ? "賽前鎖定存檔版" : "即時重算版"}
              </span>

            </small>
          </div>
          <div className="border-b border-hairline bg-paper-2 px-3 py-2.5 text-center font-serif-tc text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink">
            賽果
            <small className="mt-0.5 block font-mono-tx text-[9px] font-semibold tracking-[0.18em] text-ink-3">
              Result · 1st – 4th
            </small>
          </div>
          <div className="flex min-w-0 flex-col border-r border-hairline" aria-label="預測首四名">
            {loading ? (
              <Loading />
            ) : left.length ? (
              left.map((h, i) => <Cell key={keyOf(h) || i} h={h} rank={i + 1} matched={isMatch(h, rightKeys)} />)
            ) : (
              <EmptySide title="未有預測" />
            )}
          </div>
          <div className="flex min-w-0 flex-col" aria-label="賽果首四名">
            {loading ? (
              <Loading />
            ) : right.length ? (
              right.map((h, i) => <Cell key={keyOf(h) || i} h={h} rank={i + 1} matched={isMatch(h, leftKeys)} />)
            ) : (
              <EmptySide title="賽果未出" />
            )}
          </div>
        </div>

        {left.length && right.length ? (
          <>
            <p className="tabnum mx-auto mt-[11px] max-w-[560px] text-center font-mono-tx text-[12px] tracking-[0.04em] text-ink-2">
              預測首 4 名命中：
              <b className={`font-extrabold ${hits >= 2 ? "text-win" : "text-ink"}`}>{hits} / 4</b>
            </p>
            {frozenRace ? (
              <div className="mx-auto mt-2 flex max-w-[560px] flex-wrap justify-center gap-1.5">
                <Pill tone={frozenRace.trioHit ? "win" : "ink"}>三重彩（頭三名複式）</Pill>
                <Pill tone={frozenRace.first4Hit ? "win" : "ink"}>四重彩（頭四名複式）</Pill>
                <Pill tone={frozenRace.top3AnyHit ? "gold" : "ink"}>三甲任中</Pill>
                <Pill>
                  三甲命中 {Number(frozenRace.top3IntersectCount ?? 0)} / 3
                </Pill>
              </div>
            ) : null}
          </>
        ) : null}

        <p className="mx-auto mt-3 max-w-[560px] px-2 text-center text-[11px] leading-[1.55] text-ink-3">
          <span className="mr-1 inline-block h-[10px] w-[14px] rounded-[2px] border border-[#D4A93C] bg-gradient-to-b from-[#FFF4C2] to-[#F6E08C] align-[-1px]" />
          同時出現於預測與賽果嘅馬匹
        </p>
      </div>

      <footer className="mx-5 mb-6 mt-[18px] border-t border-hairline pt-3.5 text-[11px] leading-[1.55] text-ink-3">
        <strong className="text-ink-2">天喜為分析平台，不提供投注服務。</strong>
        投注請透過合法渠道（HKJC）進行。此處顯示之預測、賽果、馬匹資料純屬分析展示，非投注建議。
      </footer>
    </AppShell>
  );
}
