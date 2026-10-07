import { createFileRoute } from "@tanstack/react-router";

import { AdminHead, DataTable, Kpi, NoteBox, Panel, useMemoCols } from "@/components/admin/kit";
import { membersFixture, useFixture, type MemberFixture } from "@/components/admin/fixtures";

export const Route = createFileRoute("/_authenticated/admin/users-membership")({
  head: () => ({ meta: [{ title: "會員 · 天喜監控端" }, { name: "robots", content: "noindex" }] }),
  component: Members,
});

function Members() {
  const members = useFixture<MemberFixture[]>([], { demo: membersFixture("demo"), worst: membersFixture("worst") });
  const cols = useMemoCols<MemberFixture>(() => [
    { accessorKey: "name", header: "會員" },
    { accessorKey: "email", header: "電郵" },
    { accessorKey: "plan", header: "計劃" },
    { accessorKey: "status", header: "狀態" },
    { accessorKey: "vip", header: "Telegram VIP", cell: (cell) => cell.getValue() ? "有" : "冇" },
    { accessorKey: "expiresAt", header: "到期", cell: (cell) => cell.getValue() ? new Date(String(cell.getValue())).toLocaleDateString("zh-HK") : "—" },
  ]);
  const active = members.filter((member) => member.status === "有效");
  return (
    <>
      <AdminHead title="會員" en="Users & Membership" desc="Whop 日票／月票、會員狀態同 Telegram VIP 權限。" />
      <NoteBox tone="gold">未接駁 Whop：提供 Whop API key 之後，呢頁會自動顯示真實會員數字。而家所有數字都係空位，唔係真數。</NoteBox>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="有效會員" value={members.length ? active.length.toLocaleString() : "—"} />
        <Kpi label="日票 Day Pass" value={members.length ? members.filter((member) => member.plan === "日票").length.toLocaleString() : "—"} />
        <Kpi label="月票 Month Pass" value={members.length ? members.filter((member) => member.plan === "月票").length.toLocaleString() : "—"} />
        <Kpi label="Telegram VIP" value={members.length ? members.filter((member) => member.vip).length.toLocaleString() : "—"} />
      </div>
      <Panel title="會員狀態分佈" en="active / expired / cancelled" className="mt-4">
        {members.length ? <DataTable data={members} columns={cols} pageSize={25} /> : <p className="py-6 text-center text-[12px] text-ink-3">等待接駁 Whop</p>}
      </Panel>
    </>
  );
}
