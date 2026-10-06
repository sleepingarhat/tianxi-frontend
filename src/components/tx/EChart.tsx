import { useEffect, useRef } from "react";
import * as echarts from "echarts";

/**
 * 共用 ECharts 容器：只喺瀏覽器掛載後初始化（SSR 輸出空 div，唔會 hydration mismatch）。
 * 視窗改變自動 resize；卸載時 dispose。
 */
export function EChart({
  option,
  height = 180,
  className,
  ariaLabel,
}: {
  option: echarts.EChartsOption;
  height?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el);
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  return <div ref={ref} role="img" aria-label={ariaLabel} className={className} style={{ height, width: "100%" }} />;
}
