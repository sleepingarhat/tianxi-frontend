import { createFileRoute, redirect } from "@tanstack/react-router";

// /pricing 舊連結轉址去會員頁，避免 404。
export const Route = createFileRoute("/pricing")({
  beforeLoad: () => {
    throw redirect({ to: "/membership", replace: true });
  },
});
