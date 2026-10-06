// 天喜 · 逐匹解釋（點解揀佢）
// 用同場全體馬匹嘅特徵分做標準化（z-score），再按天喜LGB 特徵重要度（gain）加權，
// 得出「邊幾項推高、邊幾項拉低」呢匹馬嘅排名。屬局部解釋，唔等於模型內部 SHAP 值。

import { FEATURE_CATALOG } from "./feature-catalog";
import { FEATURES, FEATURE_MAP, type FeatureId, type Horse } from "./race-data";

const GAIN = new Map<string, number>(
  FEATURE_CATALOG.filter((f) => f.status === "adopted" && f.gain).map((f) => [f.id, f.gain!]),
);
const MAX_GAIN = Math.max(1, ...GAIN.values());

/** 每個可即場排序特徵嘅權重（0-1）；冇對應目錄項嘅用中性權重。 */
export function featureWeight(id: FeatureId): number {
  const catalogId = FEATURE_MAP[id]?.catalogId;
  const gain = catalogId ? GAIN.get(catalogId) : undefined;
  if (gain == null) return 0.25;
  return Math.max(0.05, gain / MAX_GAIN);
}

export type WhyFactor = {
  id: FeatureId;
  label: string;
  metricLabel: string;
  metric: string;
  note: string;
  rank: number;
  total: number;
  /** 同場標準化分數 */
  z: number;
  weight: number;
  /** z × 權重，正＝推高、負＝拉低 */
  contribution: number;
};

export type WhyResult = {
  up: WhyFactor[];
  down: WhyFactor[];
  /** 全部貢獻總和，正＝整體推高 */
  net: number;
  /** 顯示用強度（0-1），以同場最大絕對貢獻為分母 */
  maxAbs: number;
  total: number;
};

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}

function std(xs: number[], m: number) {
  if (xs.length < 2) return 0;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1));
}

/** 計算一匹馬喺同場內每項特徵嘅加權貢獻。 */
export function explainHorse(horses: Horse[], horseNo: number, limit = 4): WhyResult | null {
  const target = horses.find((h) => h.no === horseNo);
  if (!target || horses.length < 2) return null;

  const factors: WhyFactor[] = [];
  for (const def of FEATURES) {
    const stat = target.stats?.[def.id];
    if (!stat) continue;
    const scores = horses.map((h) => h.stats?.[def.id]?.score ?? 0);
    const m = mean(scores);
    const sd = std(scores, m);
    if (!isFinite(sd) || sd < 1e-6) continue;
    const z = (stat.score - m) / sd;
    const weight = featureWeight(def.id);
    const sorted = scores.slice().sort((a, b) => b - a);
    const rank = sorted.findIndex((s) => s <= stat.score) + 1 || horses.length;
    factors.push({
      id: def.id,
      label: def.label,
      metricLabel: def.metricLabel,
      metric: stat.metric,
      note: def.note,
      rank,
      total: horses.length,
      z,
      weight,
      contribution: z * weight,
    });
  }
  if (!factors.length) return null;

  const sorted = factors.slice().sort((a, b) => b.contribution - a.contribution);
  const up = sorted.filter((f) => f.contribution > 0.05).slice(0, limit);
  const down = sorted
    .filter((f) => f.contribution < -0.05)
    .slice(-limit)
    .reverse();

  return {
    up,
    down,
    net: factors.reduce((a, f) => a + f.contribution, 0),
    maxAbs: Math.max(...factors.map((f) => Math.abs(f.contribution)), 0.001),
    total: horses.length,
  };
}

/** 白話一句：例如「近五仗名次全場第 1（近五仗 2.4）」 */
export function factorSentence(f: WhyFactor): string {
  return `${f.label}全場第 ${f.rank}／${f.total}（${f.metricLabel} ${f.metric}）`;
}
