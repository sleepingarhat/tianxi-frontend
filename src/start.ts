import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { isArchivedProductPath } from "@/lib/product-scope";

const productScopeMiddleware = createMiddleware().server(async ({ request, next }) => {
  const path = new URL(request.url).pathname;
  if (path.startsWith("/api/") && isArchivedProductPath(path)) {
    return Response.json({ ok: false, status: "archived", message: "此產品已暫時封存，天喜現時專注香港賽馬。" }, {
      status: 410,
      headers: { "cache-control": "no-store", "x-robots-tag": "noindex" },
    });
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    try {
      const { safeErrorMessage, writeOpsEvent } = await import("./lib/ops-history.server");
      await writeOpsEvent({
        eventKey: `server:${safeErrorMessage(error).slice(0, 120)}:${new Date().toISOString().slice(0, 13)}`,
        kind: "api_error",
        severity: "error",
        source: "tanstack-server",
        statusCode: 500,
        message: safeErrorMessage(error),
      });
    } catch {
      // 持久日誌不可取代原本錯誤回應。
    }
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [productScopeMiddleware, errorMiddleware, csrfMiddleware],
}));
