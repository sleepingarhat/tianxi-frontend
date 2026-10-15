import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/racecourse-photos")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { syncRacecoursePhotos } = await import("@/lib/racecoursePhotos.server");
        const result = await syncRacecoursePhotos();
        return Response.json(result, { status: result.ok ? 200 : 502 });
      },
    },
  },
});
