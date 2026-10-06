export type FeatureId =
  | "h2h"
  | "distance"
  | "draw"
  | "time"
  | "finish"
  | "jt"
  | "form"
  | "track"
  | "rest"
  | "weight"
  | "careerWin"
  | "careerTop3"
  | "distStarts"
  | "drawStarts"
  | "comboTop3"
  | "formSlope"
  | "formTop3"
  | "weightAvg5"
  | "goingTop3";

export type FeatureDef = {
  id: FeatureId;
  label: string;
  shortLabel: string;
  /** 該特徵專屬欄的標題，例如「勝次」、「時間」 */
  metricLabel: string;
  note: string;
  /** 對應特徵目錄（74 項）嘅 id，用嚟同引擎特徵對照 */
  catalogId?: string;
};

/** 可即場排序嘅特徵；用戶可只選其中數個來運算綜合特徵排序。 */
export const FEATURES: FeatureDef[] = [
  { id: "h2h", label: "同場對賽勝次", shortLabel: "同場對賽", metricLabel: "勝次", note: "本場馬匹互相交手的往績勝次" },
  { id: "distance", label: "最佳同程", shortLabel: "最佳同程", metricLabel: "同程冠", note: "相同賽程的歷史勝率", catalogId: "dist_top3" },
  { id: "distStarts", label: "同程出賽次數", shortLabel: "同程仗數", metricLabel: "同程仗", note: "跑過本場距離幾多次（經驗深度）", catalogId: "dist_starts" },
  { id: "draw", label: "最佳檔位", shortLabel: "最佳檔位", metricLabel: "檔位", note: "同場地同賽程的檔位上名率", catalogId: "draw_top3" },
  { id: "drawStarts", label: "同檔出賽次數", shortLabel: "同檔仗數", metricLabel: "同檔仗", note: "同馬場、同距離、同檔的出賽數", catalogId: "draw_starts" },
  { id: "time", label: "同程最快時間", shortLabel: "最快時間", metricLabel: "時間", note: "同賽程個人最快完成時間" },
  { id: "finish", label: "同程最快末段", shortLabel: "最快末段", metricLabel: "末段", note: "最後一段最快段速", catalogId: "sect_late_kick" },
  { id: "jt", label: "最強騎練合作", shortLabel: "騎練合作", metricLabel: "合作勝", note: "現任騎師與練馬師合作往績" },
  { id: "form", label: "近期狀態", shortLabel: "近期狀態", metricLabel: "近五仗", note: "最近五次出賽平均名次", catalogId: "form_avgpos_w" },
  { id: "formTop3", label: "近五仗上名率", shortLabel: "近五上名", metricLabel: "上名", note: "近五仗入前三比率", catalogId: "form_top3rate_w" },
  { id: "formSlope", label: "名次趨勢", shortLabel: "名次趨勢", metricLabel: "斜率", note: "名次向好定向差（進步／退步）", catalogId: "form_pos_slope" },
  { id: "track", label: "場地適應", shortLabel: "場地適應", metricLabel: "同場勝", note: "同一馬場的適應度" },
  { id: "comboTop3", label: "同場地×距離上名", shortLabel: "場地×距離", metricLabel: "上名", note: "馬場加距離組合的上名次數", catalogId: "combo_top3" },
  { id: "goingTop3", label: "同場地狀況上名", shortLabel: "同地質", metricLabel: "上名", note: "相同場地狀況（going）下入前三次數", catalogId: "going_top3" },
  { id: "careerWin", label: "總勝率", shortLabel: "總勝率", metricLabel: "冠／仗", note: "全部往績勝率" },
  { id: "careerTop3", label: "總上名率", shortLabel: "總上名", metricLabel: "上名／仗", note: "全部往績入前三比率" },
  { id: "rest", label: "賽事間隔", shortLabel: "賽事間隔", metricLabel: "相隔日子", note: "距離上仗的休賽日子", catalogId: "days_since_last" },
  { id: "weight", label: "負磅優勢", shortLabel: "負磅優勢", metricLabel: "負磅", note: "今場實際負磅", catalogId: "actual_weight" },
  { id: "weightAvg5", label: "近五仗平均負磅", shortLabel: "平均負磅", metricLabel: "平均磅", note: "近五仗負磅水平，反映評分走勢", catalogId: "weight_avg5" },
];

export const FEATURE_MAP: Record<FeatureId, FeatureDef> = Object.fromEntries(
  FEATURES.map((f) => [f.id, f]),
) as Record<FeatureId, FeatureDef>;

/** 特徵目錄 id → 可排序特徵 id */
export const CATALOG_TO_FEATURE: Record<string, FeatureId> = Object.fromEntries(
  FEATURES.filter((f) => f.catalogId).map((f) => [f.catalogId!, f.id]),
);

export type FeatureStat = {
  /** 該特徵的專屬顯示值 */
  metric: string;
  /** 勝率 % */
  win: number;
  /** 上名率 % */
  place: number;
  /** 0-100 標準化分數，用於運算綜合排序 */
  score: number;
};

export type Horse = {
  no: number;
  name: string;
  age: number;
  jockey: string;
  trainer: string;
  draw: number;
  weight: number;
  odds: number;
  oddsDelta: number;
  stats: Record<FeatureId, FeatureStat>;
};
