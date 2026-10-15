import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRacingDataScale } from "@/lib/racingDataScale.functions";

// 首頁「點解揀天喜」：只講可核對嘅現行事實；數據規模由賽果檔逐個點算，每個賽馬日自動更新。
const PILLARS = [
  {
    no: "01",
    title: "自家數據管道",
    desc: "馬會冇公開數據接口。天喜自己將賽果、派彩、分段時間、晨操、傷患、血統、排位同賠率整理成結構化數據，資料來源同源碼公開放喺 GitHub。",
  },
  {
    no: "02",
    title: "每日自動運行、出錯會自己補",
    desc: "非賽馬日自動跳過；賽馬日自動收料、同步、健康檢查同賽後 Elo 更新。漏咗或者遲咗嘅賽果會自動追補，不用人手執數。",
  },
  {
    no: "03",
    title: "模型唔過閘唔上線",
    desc: "Elo＋LightGBM 混合，唔係靠聊天機械人估。研究版同正式版分開，新版要先過研究閘，由天喜拍板先定版；舊版成績獨立保留，唔會混埋計。",
  },
  {
    no: "04",
    title: "賽前凍結，公開對帳",
    desc: "四揀喺開跑前凍結，凍結之後唔改。賽後用馬會官方派彩逐場對帳，負數照實列出。你可以自己核對每一場。",
  },
];

const COMPARE: [string, string, string][] = [
  ["數據來源", "自家結構化數據管道", "多數靠人手睇或第三方"],
  ["預測方法", "Elo＋LightGBM，有回測", "黑箱 AI 問答或憑感覺 tips"],
  ["預測時間", "賽前凍結，唔可以事後改", "好多冇時間證明"],
  ["戰績", "逐場官方派彩對帳，負數照列", "多數只講中咗嗰幾場"],
];

export function MoatSection() {
  return (
    <section className="border-t border-hairline bg-paper-2/60 px-5 py-10 md:px-10 md:py-14">
      <p className="font-mono-tx text-[11px] font-bold text-gold">WHY TIANXI · 點解揀天喜</p>
      <h2 className="mt-2 font-serif-tc text-[26px] font-bold leading-tight text-ink md:text-[34px]">
        數據管道＋模型閘＋<span className="text-gold">公開可驗證軌跡</span>
      </h2>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-ink-2">
        天喜唔係概念，而係每日都喺度運行嘅系統：自家香港賽馬數據層、每日自動收料同審計、Elo＋LightGBM 賽前凍結預測，加埋公開網站逐場對帳。本地少有平台可以做到每一步都俾你核對。
      </p>
      <DataScaleStrip />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {PILLARS.map((p) => (
          <div key={p.no} className="rounded-[10px] border border-hairline bg-paper p-4">
            <p className="font-mono-tx text-[11px] font-bold text-gold">{p.no}</p>
            <h3 className="mt-1 text-[16px] font-bold text-ink">{p.title}</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{p.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[10px] border border-hairline bg-paper">
        <table className="w-full min-w-[480px] text-left text-[12px]">
          <thead className="bg-paper-3 text-ink-3">
            <tr><th className="px-3 py-2 font-bold">比較</th><th className="px-3 py-2 font-bold text-gold">天喜</th><th className="px-3 py-2 font-bold">一般貼士／AI 問答</th></tr>
          </thead>
          <tbody>
            {COMPARE.map(([k, a, b]) => (
              <tr key={k} className="border-t border-hairline">
                <td className="px-3 py-2 font-bold text-ink">{k}</td>
                <td className="px-3 py-2 text-ink">{a}</td>
                <td className="px-3 py-2 text-ink-3">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-bold">
        <Link to="/engine" className="text-gold underline underline-offset-4">睇實時數據規模同引擎健康 →</Link>
        <Link to="/prediction-vs-result" className="text-gold underline underline-offset-4">逐場核對預測與賽果 →</Link>
      </div>
      <p className="mt-3 text-[10px] text-ink-3">預測只供參考，唔保證中獎；過往成績唔代表將來表現。</p>
    </section>
  );
}

function DataScaleStrip() {
  const q = useQuery({ queryKey: ["racing-data-scale"], queryFn: () => getRacingDataScale(), staleTime: 3600_000 });
  const d = q.data;
  if (!d || !d.meetings) return null;
  const rowsLabel = d.rows >= 10000 ? `${(d.rows / 10000).toFixed(1)} 萬` : d.rows.toLocaleString();
  const items: [string, string, string][] = [
    [d.meetings.toLocaleString(), "個賽馬日", `${d.first?.slice(0, 4) ?? ""}–${d.last?.slice(0, 4) ?? ""}`],
    [d.races.toLocaleString(), "場賽事", "逐場賽果"],
    [rowsLabel, "行賽果", `${d.rows.toLocaleString()} 匹次`],
  ];
  return (
    <div className="mt-6 rounded-[10px] border border-hairline bg-paper p-4">
      <div className="grid grid-cols-3 gap-2">
        {items.map(([v, l, sub]) => (
          <div key={l} className="min-w-0">
            <p className="tabnum font-mono-tx text-[22px] font-bold leading-none text-gold md:text-[30px]">{v}</p>
            <p className="mt-1 text-[12px] font-bold text-ink">{l}</p>
            <p className="text-[10px] text-ink-3">{sub}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-ink-3">
        由天喜數據倉每個賽果檔逐場點算，最新賽馬日 {d.last}；每個賽馬日完賽後自動更新。
      </p>
    </div>
  );
}
