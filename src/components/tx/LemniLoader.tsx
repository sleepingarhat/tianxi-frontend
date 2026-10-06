// 天喜 TIANXI · Lemniscate Bloom loader（搬自舊站 shell.js）
// 伯努利雙紐線粒子流：a = 25 + 10.8s
//   x(t) = 50 + a cos t / (1 + sin²t)
//   y(t) = 50 + a sin t cos t / (1 + sin²t)
import { useEffect, useRef } from "react";

const COUNT = 62;
const TRAIL = 0.68;
const DUR = 3500;
const PULSE = 2800;
const A = 25;
const BOOST = 10.8;

function point(progress: number, detail: number) {
  const t = progress * Math.PI * 2;
  const scale = A + detail * BOOST;
  const s = Math.sin(t);
  const denom = 1 + s * s;
  return {
    x: 50 + (scale * Math.cos(t)) / denom,
    y: 50 + (scale * s * Math.cos(t)) / denom,
  };
}
const norm = (p: number) => ((p % 1) + 1) % 1;

const SIZE = { sm: "h-[1.05em] w-[1.05em]", md: "h-16 w-16", lg: "h-[104px] w-[104px]" } as const;

export function LemniLoader({
  label = "載入中…",
  size = "md",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const g = gRef.current;
    if (!g) return;
    const reduce =
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const dots = Array.from(g.querySelectorAll("circle"));
    if (reduce || !dots.length) return;
    let raf = 0;
    const frame = (now: number) => {
      const pulse = (now % PULSE) / PULSE;
      const detail = 0.52 + ((Math.sin(pulse * Math.PI * 2 + 0.55) + 1) / 2) * 0.48;
      const progress = (now % DUR) / DUR;
      for (let i = 0; i < dots.length; i++) {
        const tail = i / (COUNT - 1);
        const pt = point(norm(progress - tail * TRAIL), detail);
        const fade = Math.pow(1 - tail, 0.56);
        const node = dots[i]!;
        node.setAttribute("cx", pt.x.toFixed(2));
        node.setAttribute("cy", pt.y.toFixed(2));
        node.setAttribute("r", (0.9 + fade * 2.7).toFixed(2));
        node.setAttribute("opacity", (0.04 + fade * 0.96).toFixed(3));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const staticPath = (() => {
    let d = "";
    for (let n = 0; n <= 240; n++) {
      const p = point(n / 240, 1);
      d += `${n === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
    }
    return d;
  })();

  const inline = size === "sm";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={
        inline
          ? "inline-flex items-center gap-1.5 align-middle"
          : `flex w-full flex-col items-center justify-center gap-2.5 px-2 ${
              size === "lg" ? "min-h-[160px] py-7" : "min-h-[96px] py-[18px]"
            }`
      }
    >
      <div className={`${SIZE[size]} text-tx-accent`}>
        <svg viewBox="0 0 100 100" aria-hidden="true" className="block h-full w-full overflow-visible">
          <path
            d={staticPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="4.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.1"
          />
          <g ref={gRef}>
            {Array.from({ length: COUNT }).map((_, i) => (
              <circle key={i} fill="currentColor" cx="50" cy="50" r="1" opacity="0.2" />
            ))}
          </g>
        </svg>
      </div>
      {label ? (
        <div
          className={
            inline
              ? "text-inherit"
              : "text-center font-sans-tc text-[13px] leading-[1.35] tracking-[0.02em] text-ink-3"
          }
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}
