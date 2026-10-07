import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/tx/AppShell";
import { Button } from "@/components/ui/button";
import bodyHtml from "@/lib/marksix-body.html?raw";

const CSS = ["/marksix/tokens.css", "/marksix/shell.css", "/marksix/marksix.css"];

export const Route = createFileRoute("/marksix")({
  head: () => ({
    meta: [
      { title: "六合彩 · 八字 × 奇門遁甲 · 天喜 TIANXI" },
      {
        name: "description",
        content: "六合彩官方攪珠結果、號碼冷熱統計，以及八字與奇門遁甲取數系統：15 碼輸出與近百期回測。",
      },
      { property: "og:title", content: "六合彩 · 八字 × 奇門遁甲 · 天喜 TIANXI" },
      { property: "og:description", content: "攪珠結果、號碼統計與命理取數回測。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      ...CSS.map((href) => ({ rel: "stylesheet", href })),
      // 腳本全部自存同源，唔再靠第三方 CDN；預先並行下載，執行次序不變
      ...SCRIPTS.map((href) => ({ rel: "preload", as: "script", href })),
    ],
  }),
  component: MarkSixPage,
});

const SCRIPTS = [
  "/marksix/lunar.js",
  "/marksix/engine.js",
  "/marksix/tianxi-mingpan.js",
  "/marksix/tianxi-zishi.js",
  "/marksix/site-app.js",
  "/marksix/tianxi-clock24.js",
  "/marksix/natal-ui.js",
];

const LOAD_TIMEOUT_MS = 12_000;

function isContentReady() {
  const result = document.getElementById("m6-result");
  if (!result) return false;
  return !result.textContent?.includes("載入中");
}

function MarkSixPage() {
  const booted = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "timeout">("loading");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const added: HTMLScriptElement[] = [];
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const markReady = () => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      if (pollId) clearInterval(pollId);
      setStatus("ready");
    };

    const markTimeout = () => {
      if (cancelled) return;
      if (pollId) clearInterval(pollId);
      setStatus("timeout");
    };

    function load(i: number) {
      if (cancelled) return;
      if (i >= SCRIPTS.length) {
        document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
        window.dispatchEvent(new Event("load"));
        return;
      }
      const s = document.createElement("script");
      s.src = SCRIPTS[i]!;
      s.async = false;
      s.dataset["m6"] = "1";
      s.onload = () => load(i + 1);
      s.onerror = () => load(i + 1);
      document.body.appendChild(s);
      added.push(s);
    }

    // legacy scripts populate DOM asynchronously after the script chain finishes
    pollId = setInterval(() => {
      if (isContentReady()) markReady();
    }, 300);

    timeoutId = setTimeout(markTimeout, LOAD_TIMEOUT_MS);

    load(0);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (pollId) clearInterval(pollId);
      added.forEach((el) => el.remove());
    };
  }, [tick]);

  const handleRetry = () => {
    setStatus("loading");
    setTick((t) => t + 1);
  };

  return (
    <AppShell page="marksix" ticker="六合彩 · 八字 × 奇門遁甲取數系統">
      <nav aria-label="六合彩功能分支" className="grid grid-cols-5 gap-1.5 border-b border-hairline bg-paper-2 px-3 py-2">
        {[{ hash: "marksix-next", label: "下一期" }, { hash: "marksix-stats", label: "號碼統計" }, { hash: "marksix-engine", label: "排盤" }, ].map((item) => (
          <Button key={item.label} asChild variant="outline" size="sm" className="h-8 border-hairline bg-paper px-1 text-[10px] text-ink"><Link to="/marksix" hash={item.hash}>{item.label}</Link></Button>
        ))}
        <Button asChild variant="outline" size="sm" className="h-8 border-gold bg-paper px-1 text-[10px] text-ink"><Link to="/marksix-results">預測vs攪珠</Link></Button>
      </nav>
      <div className="relative">
        {status === "timeout" && (
          // 逾時唔再遮住全頁：頁面照用，只喺頂部提示可以重試
          <div className="mb-2 flex flex-wrap items-center gap-2 rounded-[8px] border border-[var(--tx-gold)]/40 bg-[var(--tx-paper)] px-3 py-2">
            <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-[var(--tx-ink-secondary)]">
              部分資料載入較慢（網絡或數據源延遲），已顯示可用內容。可按右邊重試。
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleRetry}
              className="bg-[var(--tx-gold)] text-[var(--tx-ink)] hover:bg-[var(--tx-gold)]/90"
            >
              重試
            </Button>
          </div>
        )}
        <div className="tx-m6" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        {status === "loading" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--tx-paper)]/95 p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--tx-gold)] border-t-transparent" />
              <p className="text-sm text-[var(--tx-ink-secondary)]">六合彩資料載入中…</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
