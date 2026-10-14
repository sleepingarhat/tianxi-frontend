import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getAnalyticsId } from "@/lib/analytics.functions";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    if (window.location.hostname === "localhost" || window.location.hostname.includes("id-preview")) return;
    let cancelled = false;
    getAnalyticsId().then(({ id }) => {
      if (cancelled || !id || window.gtag) return;
      idRef.current = id;
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
      };
      window.gtag("set", "developer_id.dZjgwMW", true);
      window.gtag("js", new Date());
      window.gtag("config", id);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (window.gtag && idRef.current) window.gtag("event", "page_view", { page_path: pathname });
  }, [pathname]);

  return null;
}
