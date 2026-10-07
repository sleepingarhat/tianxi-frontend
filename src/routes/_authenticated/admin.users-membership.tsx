import { createFileRoute } from "@tanstack/react-router";

import { AdminHead, Kpi, NoteBox, Panel } from "@/components/admin/kit";

export const Route = createFileRoute("/_authenticated/admin/users-membership")({
  head: () => ({ meta: [{ title: "會員 · 天喜監控端" }, { name: "robots", content: "noindex" }] }),
  component: Members,
});

function Members() {
  return (
    <>
      <AdminHead title="會員" en="Users & Membership" desc="Whop 日票／月票、會員狀態同 Telegram VIP 權限。" />
      <NoteBox tone="gold">未接駁 Whop：提供 Whop API key 之後，呢頁會自動顯示真實會員數字。而家所有數字都係空位，唔係真數。</NoteBox>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="有效會員" value="—" />
        <Kpi label="日票 Day Pass" value="—" />
        <Kpi label="月票 Month Pass" value="—" />
        <Kpi label="Telegram VIP" value="—" />
      </div>
      <Panel title="會員狀態分佈" en="active / expired / cancelled" className="mt-4">
        <p className="py-6 text-center text-[12px] text-ink-3">等待接駁 Whop</p>
      </Panel>
    </>
  );
}
