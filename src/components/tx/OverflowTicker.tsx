import { useEffect, useRef, useState, type ReactNode } from "react";

/** Only overflowing, single-line messages move; the text itself stays selectable and readable. */
export function OverflowTicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  const viewport = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const outer = viewport.current;
    const inner = text.current;
    if (!outer || !inner) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    const update = () => {
      animation?.cancel();
      const distance = Math.max(0, inner.scrollWidth - outer.clientWidth);
      setOverflow(distance > 2);
      if (distance > 2 && !motion.matches) {
        animation = inner.animate(
          [{ transform: `translateX(-${distance}px)` }, { transform: "translateX(0)" }, { transform: `translateX(-${distance}px)` }],
          { duration: Math.max(7000, distance * 48), iterations: Infinity, easing: "ease-in-out" },
        );
      }
    };
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    motion.addEventListener("change", update);
    const pause = () => animation?.pause();
    const resume = () => animation?.play();
    outer.addEventListener("pointerenter", pause);
    outer.addEventListener("pointerleave", resume);
    outer.addEventListener("focusin", pause);
    outer.addEventListener("focusout", resume);
    document.fonts.ready.then(update);
    update();
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      outer.removeEventListener("pointerenter", pause);
      outer.removeEventListener("pointerleave", resume);
      outer.removeEventListener("focusin", pause);
      outer.removeEventListener("focusout", resume);
      animation?.cancel();
    };
  }, [children]);

  return (
    <span ref={viewport} tabIndex={overflow ? 0 : undefined} className={`block min-w-0 ${overflow ? "overflow-x-auto [scrollbar-width:none] [mask-image:linear-gradient(to_right,#000_calc(100%-16px),transparent)]" : "overflow-hidden"} ${className}`} title={overflow && typeof children === "string" ? children : undefined}>
      <span ref={text} className="block w-max max-w-none whitespace-nowrap">{children}</span>
    </span>
  );
}