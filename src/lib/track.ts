/** GA4 轉換事件：統計碼未載入就略過，絕不阻塞註冊／付款流程。 */
export type TrackEvent = "sign_up_start" | "sign_up" | "login" | "begin_checkout" | "purchase";

export function track(name: TrackEvent, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    g?.("event", name, params);
  } catch {
    /* ignore */
  }
}
