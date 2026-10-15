import { createFileRoute } from "@tanstack/react-router";

// 公開監察：俾 GitHub 監察器讀，只回傳數量同最後運行時間，冇私隱資料。
export const Route = createFileRoute("/api/public/racecourse-photos-status")({
  server: {
    handlers: {
      GET: async () => {
        const { publicClient } = await import("@/lib/racecoursePhotos.functions");
        const sb = publicClient();
        const [{ data: runs }, { data: photos }] = await Promise.all([
          sb.from("racecourse_photo_runs").select("ran_at,ok,scanned,accepted,added,message").order("ran_at", { ascending: false }).limit(1),
          sb.from("racecourse_photos").select("venue").eq("active", true),
        ]);
        const last = runs?.[0] ?? null;
        const ageH = last ? (Date.now() - Date.parse(last.ran_at)) / 3600_000 : null;
        const st = (photos ?? []).filter((p) => p.venue === "ST").length;
        const hv = (photos ?? []).filter((p) => p.venue === "HV").length;
        const healthy = !!last && last.ok && ageH! < 8 * 24 && st > 0 && hv > 0;
        return Response.json({ healthy, lastRun: last, ageHours: ageH, active: { ST: st, HV: hv } }, {
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
