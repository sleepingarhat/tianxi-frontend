import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

/**
 * 分享卡：喺瀏覽器即時用 canvas 畫 1080×1350 品牌圖（深翠綠＋金），
 * 手機用系統分享表連圖一齊分享；唔支援就下載圖片並複製連結。
 */
export type ShareSpec =
  | { kind: "result"; date: string; venue: string; race: number; meta: string; hits: number; picks: { no: string; name: string; hit: boolean; finish?: number | null }[]; dayAvg?: string | null; url: string }
  | { kind: "founding"; joined: number; goal: number; weeks: number; value: number; url: string };

function v(name: string, fb: string) {
  if (typeof document === "undefined") return fb;
  const s = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return s || fb;
}

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

async function draw(spec: ShareSpec): Promise<Blob> {
  const W = 1080, H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;
  const deep = v("--tx-deep", "#0f5a3e"), fg = v("--tx-deep-fg", "#f1ecdc"), gold = v("--tx-gold-strong", "#d4a63a"), goldBg = v("--tx-gold-bg", "#f7efd6");
  const serif = '"Noto Serif TC", serif', sans = '"Noto Sans TC", sans-serif', mono = '"JetBrains Mono", monospace';
  await document.fonts?.ready;

  c.fillStyle = deep; c.fillRect(0, 0, W, H);
  // 細格紋理
  c.globalAlpha = 0.07; c.strokeStyle = fg; c.lineWidth = 1;
  for (let x = 0; x < W; x += 54) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
  for (let y = 0; y < H; y += 54) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.globalAlpha = 1;
  // 金框
  c.strokeStyle = gold; c.lineWidth = 4; rr(c, 40, 40, W - 80, H - 80, 36); c.stroke();

  // 頁頭
  c.fillStyle = gold; c.font = `900 64px ${serif}`; c.fillText("天喜", 96, 158);
  c.fillStyle = fg; c.font = `700 26px ${mono}`; c.fillText("TIANXI · HONG KONG RACING", 260, 150);

  if (spec.kind === "result") {
    c.fillStyle = fg; c.globalAlpha = 0.75; c.font = `500 30px ${sans}`;
    c.fillText(`${spec.date} · ${spec.venue} · R${spec.race}`, 96, 236); c.globalAlpha = 1;
    c.font = `500 26px ${sans}`; c.globalAlpha = 0.6; c.fillText(spec.meta, 96, 280); c.globalAlpha = 1;

    c.fillStyle = gold; c.font = `900 220px ${mono}`; c.fillText(`${spec.hits}`, 90, 500);
    c.fillStyle = fg; c.font = `700 72px ${mono}`; c.fillText("/ 4", 250, 500);
    c.font = `700 40px ${serif}`; c.fillText("凍結四揀入前四", 470, 430);
    c.globalAlpha = 0.7; c.font = `500 28px ${sans}`; c.fillText("賽前鎖定 · 賽後官方對帳", 470, 482); c.globalAlpha = 1;

    let y = 580;
    spec.picks.slice(0, 4).forEach((p, i) => {
      c.fillStyle = p.hit ? goldBg : "rgba(255,255,255,0.06)";
      rr(c, 96, y, W - 192, 116, 22); c.fill();
      const ink = p.hit ? deep : fg;
      c.fillStyle = p.hit ? deep : gold; c.font = `900 56px ${mono}`; c.fillText(`${i + 1}`, 130, y + 78);
      c.fillStyle = ink; c.font = `700 30px ${mono}`; c.fillText(`#${p.no}`, 210, y + 74);
      c.font = `700 46px ${serif}`; c.fillText(p.name.slice(0, 8), 320, y + 76);
      c.textAlign = "right"; c.font = `700 32px ${sans}`;
      c.fillText(p.hit ? `✓ 第 ${p.finish ?? "?"} 名` : "—", W - 130, y + 74);
      c.textAlign = "left";
      y += 132;
    });
    if (spec.dayAvg) {
      c.fillStyle = fg; c.globalAlpha = 0.8; c.font = `500 30px ${sans}`;
      c.fillText(`全日四揀平均命中 ${spec.dayAvg} / 4`, 96, y + 30); c.globalAlpha = 1;
    }
  } else {
    c.fillStyle = gold; c.font = `700 36px ${sans}`; c.fillText(`首 ${spec.goal} 名註冊會員專享`, 96, 270);
    c.fillStyle = fg; c.font = `900 108px ${serif}`; c.fillText("免費一年", 96, 420);
    c.fillText("Pro 會籍", 96, 545);
    c.fillStyle = gold; c.font = `900 64px ${serif}`; c.fillText(`（${spec.weeks} 週）`, 560, 545);
    c.fillStyle = fg; c.font = `500 36px ${sans}`; c.fillText("開收費閘後自動生效，唔使付款", 96, 630);
    // 價值徽章
    c.fillStyle = gold; rr(c, 96, 680, 520, 120, 60); c.fill();
    c.fillStyle = deep; c.font = `900 56px ${mono}`; c.fillText(`HK$${spec.value.toLocaleString()}`, 136, 762);
    c.font = `700 28px ${sans}`; c.fillText("總值", 480, 758);
    // 名額進度
    const left = Math.max(0, spec.goal - spec.joined), ratio = Math.min(1, spec.joined / spec.goal);
    c.fillStyle = fg; c.font = `700 44px ${sans}`; c.fillText(`已註冊 ${spec.joined} / ${spec.goal}`, 96, 900);
    c.textAlign = "right"; c.fillStyle = gold; c.fillText(`尚餘 ${left} 個名額`, W - 96, 900); c.textAlign = "left";
    c.fillStyle = "rgba(255,255,255,0.12)"; rr(c, 96, 935, W - 192, 26, 13); c.fill();
    c.fillStyle = gold; rr(c, 96, 935, Math.max(26, (W - 192) * ratio), 26, 13); c.fill();
    c.fillStyle = fg; c.globalAlpha = 0.75; c.font = `500 30px ${sans}`;
    c.fillText("賽前凍結四揀 · 賽後逐場公開對帳 · 而家全站免費", 96, 1040); c.globalAlpha = 1;
  }

  // 頁腳
  c.fillStyle = gold; rr(c, 96, H - 176, W - 192, 92, 46); c.fill();
  c.fillStyle = deep; c.font = `800 40px ${sans}`; c.textAlign = "center";
  c.fillText(spec.kind === "founding" ? "立即註冊 → tianxi.racing" : "逐場核對 → tianxi.racing", W / 2, H - 116);
  c.textAlign = "left";
  return new Promise((res) => cv.toBlob((b) => res(b!), "image/png"));
}

export function ShareButton({ spec, label = "分享", className = "" }: { spec: ShareSpec | null; label?: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const key = spec ? JSON.stringify(spec) : "";
  // iPhone Safari 要求撳掣後即刻叫分享；所以預先畫好張圖，撳嗰下唔使再等。
  useEffect(() => {
    let alive = true;
    setBlob(null);
    if (spec) draw(spec).then((b) => { if (alive) setBlob(b); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function fallback(b: Blob | null, text: string, url: string) {
    if (b) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b); a.download = "tianxi-share.png"; a.click();
    }
    navigator.clipboard?.writeText(`${text} ${url}`).catch(() => {});
    toast.success(b ? "已下載分享圖，連結已複製" : "連結已複製");
  }

  async function go() {
    if (!spec || busy) return;
    const text = spec.kind === "result"
      ? `天喜賽前凍結四揀：${spec.date} ${spec.venue} R${spec.race} 中 ${spec.hits}/4`
      : `天喜首 ${spec.goal} 名註冊會員送一年 Pro（總值 HK$${spec.value.toLocaleString()}），而家全站免費`;
    setBusy(true);
    try {
      const b = blob ?? (await draw(spec));
      const file = new File([b], "tianxi-share.png", { type: "image/png" });
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "天喜賽馬", text: `${text} ${spec.url}` });
        } else if (navigator.share) {
          await navigator.share({ title: "天喜賽馬", text, url: spec.url });
        } else fallback(b, text, spec.url);
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        // 系統唔俾分享（例如預覽框內或權限限制）：改為下載圖片＋複製連結
        fallback(b, text, spec.url);
      }
    } catch {
      toast.error("分享失敗，請再試");
    } finally { setBusy(false); }
  }
  return (
    <button type="button" onClick={go} disabled={!spec || busy} aria-label={label}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold disabled:opacity-50 ${className}`}>
      <Share2 className="h-3.5 w-3.5" aria-hidden />{busy ? "準備中…" : label}
    </button>
  );
}
