import { SkeletonRows } from "./components/tx/ui";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 200,
    defaultPendingComponent: () => (
      <div className="mx-auto max-w-[440px] animate-fade-in p-4">
        <SkeletonRows rows={4} />
      </div>
    ),
  });

  return router;
};
