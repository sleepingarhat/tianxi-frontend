import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/racing-data-scale")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { syncRacingDataScale } = await import("@/lib/racingDataScale.server");
        const result = await syncRacingDataScale();
        return Response.json(result, { status: result.ok ? 200 : 502 });
      },
    },
  },
});
