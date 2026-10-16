import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AdminHead, Kpi, NoteBox, Panel } from "@/components/admin/kit";
import { FREE_STAGE_GOAL_MEMBERS, freeStageProgress } from "@/lib/freeStage";
import { getMemberAccountStats, listAdminMembers, setTestAccount, type AdminMemberRow } from "@/lib/members.functions";

export const Route = createFileRoute("/_authenticated/admin/users-membership")({
  head: () => ({ meta: [{ title: "會員 · 天喜監控端" }, { name: "description", content: "會員 · 天喜監控端：香港賽馬專用監控與唯讀對帳。" }, { property: "og:title", content: "會員 · 天喜監控端" }, { property: "og:description", content: "會員 · 天喜監控端：香港賽馬專用監控與唯讀對帳。" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Members,
});

function Members() {
  const fetchStats = useServerFn(getMemberAccountStats);
  const stats = useQuery({
    queryKey: ["member-account-stats"],
    queryFn: () => fetchStats(),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });

  const total = stats.data?.total ?? null;
  const pct = total == null ? null : freeStageProgress(total);
  const remaining = total == null ? null : Math.max(0, FREE_STAGE_GOAL_MEMBERS - total);

  return (
    <>
      <AdminHead
        title="會員"
        en="Users & Membership"
        desc="登記帳戶人數同免費階段門檻進度；收費未開放，付款流程已接駁（Stripe）。"
      />
      <NoteBox tone="gold">
        免費階段：會籍同付款未開放，現階段唔收款。
        下面「登記帳戶」係真實人數，免費會員累積 {FREE_STAGE_GOAL_MEMBERS.toLocaleString()} 人先開始收費同推出 iOS App。
      </NoteBox>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="登記帳戶"
          value={stats.isLoading ? "—" : total == null ? "讀取失敗" : total.toLocaleString()}
          sub={`目標 ${FREE_STAGE_GOAL_MEMBERS.toLocaleString()} 人${stats.data?.tests ? `・已剔除 ${stats.data.tests} 個測試帳號` : ""}`}
          tone="gold"
        />
        <Kpi label="已驗證電郵" value={stats.data ? stats.data.confirmed.toLocaleString() : "—"} />
        <Kpi label="近 7 日新增" value={stats.data ? stats.data.last7.toLocaleString() : "—"} />
        <Kpi label="近 30 日新增" value={stats.data ? stats.data.last30.toLocaleString() : "—"} />
      </div>
      {stats.isError ? (
        <p className="mt-2 text-[11px] text-lose">會員人數讀取失敗：{(stats.error as Error)?.message || "請稍後重試"}</p>
      ) : null}

      <Panel title="免費階段進度" en="Free stage → goal" className="mt-4">
        <div className="flex items-end justify-between gap-2">
          <p className="font-serif-tc text-[13px] font-bold text-ink">
            {total == null ? "—" : total.toLocaleString()} / {FREE_STAGE_GOAL_MEMBERS.toLocaleString()} 人
          </p>
          <p className="font-mono-tx text-[11px] font-bold text-gold">{pct == null ? "—" : `${pct}%`}</p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-hairline">
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-500"
            style={{ width: `${pct ?? 0}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
          {remaining == null
            ? "讀取中…"
            : remaining === 0
              ? "已達標：可以開始收費同推出 iOS App（需用戶拍板先執行）。"
              : `仲差 ${remaining.toLocaleString()} 人。未達標之前全站繼續免費，唔會收款。`}
        </p>
      </Panel>

      <MemberList />

    </>
  );
}

const fmt = (v: string | null) => (v ? new Date(v).toLocaleString("zh-HK", { dateStyle: "short", timeStyle: "short" }) : "—");

function MemberList() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listAdminMembers);
  const mark = useServerFn(setTestAccount);
  const list = useQuery({ queryKey: ["admin-member-list"], queryFn: () => fetchList(), staleTime: 60_000 });
  const toggle = useMutation({
    mutationFn: (row: AdminMemberRow) => mark({ data: { userId: row.id, isTest: !row.is_test } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-member-list"] });
      qc.invalidateQueries({ queryKey: ["member-account-stats"] });
    },
  });
  const rows = list.data ?? [];
  return (
    <Panel title="註冊帳戶清單" en="Accounts · admin only" className="mt-4">
      <p className="mb-3 text-[11px] leading-relaxed text-ink-3">
        只限管理員睇到。標記為「測試」嘅帳號唔計入登記人數同 {FREE_STAGE_GOAL_MEMBERS} 人門檻，亦唔佔創始會員名額；隨時可以取消標記。
      </p>
      {list.isLoading ? <p className="py-4 text-center text-[12px] text-ink-3">讀取中…</p> : null}
      {list.isError ? <p className="py-4 text-center text-[12px] text-lose">{(list.error as Error).message}</p> : null}
      <ul className="divide-y divide-hairline">
        {rows.map((row) => (
          <li key={row.id} className={`flex items-center gap-3 py-2.5 ${row.is_test ? "opacity-60" : ""}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono-tx text-[12px] text-ink">{row.email ?? "（冇電郵）"}</p>
              <p className="mt-0.5 flex flex-wrap gap-x-2 text-[10.5px] text-ink-3">
                <span>註冊 {fmt(row.created_at)}</span>
                <span>最後登入 {fmt(row.last_sign_in_at)}</span>
                <span>{row.confirmed ? "已驗證" : "未驗證"}</span>
                {row.provider && row.provider !== "email" ? <span>{row.provider}</span> : null}
                {row.is_admin ? <span className="text-gold">管理員</span> : null}
              </p>
            </div>
            <button
              type="button"
              disabled={toggle.isPending}
              onClick={() => toggle.mutate(row)}
              className={`shrink-0 rounded-md border px-2.5 py-1 text-[11px] ${row.is_test ? "border-gold text-gold" : "border-hairline text-ink-2"}`}
            >
              {row.is_test ? "測試 ✓" : "標記測試"}
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
