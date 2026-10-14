import { createServerFn } from "@tanstack/react-start";

// GA4 measurement ID is public by design; stored as a secret so it can change without code edits.
export const getAnalyticsId = createServerFn({ method: "GET" }).handler(async () => {
  const id = (process.env["GOOGLE_ANALYTICS_MEASUREMENT_ID"] ?? "").trim();
  return { id: /^G-[A-Z0-9]+$/i.test(id) ? id : null };
});
