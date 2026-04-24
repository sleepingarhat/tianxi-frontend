/**
 * 天喜設計 Token
 * 紅藍綠賽馬主題 · HKJC 官方感 · 三端共用
 *
 * 紅 = 贏 / 強勢 / 警戒
 * 藍 = 主色 / HKJC 信賴感
 * 綠 = 跑 / 上升 / 已達成
 */

export const colors = {
  // 品牌主色
  brand: {
    red: "#C8102E",       // HKJC 紅 · 主要 CTA、冠軍、警報
    blue: "#003DA5",      // HKJC 深藍 · 主導航、標題
    green: "#00843D",     // 草地綠 · 正向指標、Elo 上升
    gold: "#D4A11E",      // 金 · 獎盃、精華賽
  },

  // 文字
  text: {
    primary: "#0A1628",
    secondary: "#3D4A5C",
    tertiary: "#6B7685",
    onDark: "#FFFFFF",
    onBrand: "#FFFFFF",
  },

  // 背景
  bg: {
    base: "#FFFFFF",
    subtle: "#F5F7FA",
    muted: "#EBEFF3",
    dark: "#0A1628",
    darkSubtle: "#14243C",
  },

  // 語意色
  semantic: {
    win: "#C8102E",       // 冠軍紅
    place: "#003DA5",     // 亞季藍
    show: "#00843D",      // 季軍綠
    upset: "#D4A11E",     // 爆冷金
    danger: "#8B0000",
    warning: "#E8A100",
    success: "#00843D",
    info: "#003DA5",
  },

  // 邊框 / 分隔
  border: {
    subtle: "#E2E7ED",
    default: "#C5CDD6",
    strong: "#8A96A3",
  },
} as const;

export const typography = {
  // 三端共用嘅 font stack · 優先系統中文
  fontFamily: {
    sans: `-apple-system, BlinkMacSystemFont, "PingFang HK", "Noto Sans HK", "Microsoft JhengHei", "Segoe UI", sans-serif`,
    mono: `"SF Mono", Menlo, Consolas, "Noto Sans Mono CJK HK", monospace`,
    // 數字 / Elo 分數用 tabular
    tabular: `"SF Mono", "Roboto Mono", "Noto Sans Mono CJK HK", monospace`,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
  },

  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    black: "900",
  },

  lineHeight: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
} as const;

export const shadow = {
  sm: "0 1px 2px rgba(10, 22, 40, 0.05)",
  md: "0 2px 6px rgba(10, 22, 40, 0.08), 0 1px 2px rgba(10, 22, 40, 0.04)",
  lg: "0 8px 24px rgba(10, 22, 40, 0.12)",
  xl: "0 20px 48px rgba(10, 22, 40, 0.16)",
} as const;

export const motion = {
  duration: {
    fast: 120,
    base: 200,
    slow: 320,
    slower: 480,
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.2, 0, 0, 1.15)",
    decelerated: "cubic-bezier(0, 0, 0, 1)",
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
