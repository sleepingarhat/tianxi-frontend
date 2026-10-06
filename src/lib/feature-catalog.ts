// 天喜 · 特徵目錄（單一真相）
// status: adopted＝生產採用（天喜LGB 52 項）／pending＝已開發未上線（回測未過關或覆蓋不足）
//         never＝永不採用（會偷答案或與現有特徵重複）
// gain: 最近一次 walk-forward 回測嘅 LightGBM 重要度（gain），只有採用者有值。

export type FeatureStatus = "adopted" | "pending" | "never";

export type FeatureGroup =
  | "elo"
  | "form"
  | "condition"
  | "pairing"
  | "pace"
  | "sectional"
  | "class"
  | "pedigree"
  | "gear"
  | "comment"
  | "layoff"
  | "market";

export const GROUP_LABEL: Record<FeatureGroup, string> = {
  elo: "天喜ELO 三軸",
  form: "近況往績",
  condition: "距離／場地／檔位",
  pairing: "騎練配合",
  pace: "步速走位",
  sectional: "分段時間",
  class: "班次變化",
  pedigree: "血統",
  gear: "配備變化",
  comment: "賽事評語",
  layoff: "休賽復出",
  market: "市場盤口",
};

export const SOURCE_LABEL: Record<string, string> = {
  result: "歷史賽果",
  card: "排位表",
  sectional: "分段時間表",
  pedigree: "血統資料",
  comment: "賽事評語",
  odds: "即時賠率",
  elo: "天喜ELO 計算",
};

export type FeatureRow = {
  id: string;
  zh: string;
  note: string;
  group: FeatureGroup;
  source: keyof typeof SOURCE_LABEL;
  status: FeatureStatus;
  gain?: number;
  reason?: string;
};

export const FEATURE_CATALOG: FeatureRow[] = [
  // ── 天喜ELO 三軸 ──
  { id: "h_elo", zh: "馬匹天喜ELO", note: "由 2016 年起逐場重播對戰結果計出嘅馬匹實力分（起步 1500）。", group: "elo", source: "elo", status: "adopted", gain: 798 },
  { id: "j_elo", zh: "騎師天喜ELO", note: "騎師獨立一條 ELO，同場結果單獨更新。", group: "elo", source: "elo", status: "adopted", gain: 1527 },
  { id: "t_elo", zh: "練馬師天喜ELO", note: "練馬師獨立一條 ELO。", group: "elo", source: "elo", status: "adopted", gain: 1134 },
  { id: "factor_bonus", zh: "場次因子加成", note: "檔位＋負磅兩項因子計出嘅微調分。", group: "elo", source: "card", status: "adopted", gain: 817 },
  { id: "elo_composite", zh: "ELO 綜合分", note: "馬／騎／練 0.7／0.2／0.1 合成分。", group: "elo", source: "elo", status: "never", reason: "同三條原始 ELO 重複；一放入去模型第一棵樹就直接切它，令之後嘅樹全部變雜訊。" },
  { id: "baseline_score", zh: "ELO 基準總分", note: "天喜ELO 最終輸出分。", group: "elo", source: "elo", status: "never", reason: "同上，屬 ELO 輸出本身；集成階段已經另外混入 12%。" },

  // ── 近況往績 ──
  { id: "form_n", zh: "近況樣本數", note: "近 5 場有效出賽數。", group: "form", source: "result", status: "adopted", gain: 60 },
  { id: "form_avgpos_w", zh: "近 5 場加權平均名次", note: "越近嘅一場權重越高。全模型第一重要特徵。", group: "form", source: "result", status: "adopted", gain: 5986 },
  { id: "form_top3rate_w", zh: "近 5 場加權上名率", note: "近況入前三比率（加權）。", group: "form", source: "result", status: "adopted", gain: 1241 },
  { id: "form_pos_slope", zh: "名次趨勢斜率", note: "名次係向好定向差（進步／退步）。", group: "form", source: "result", status: "adopted", gain: 989 },
  { id: "days_since_last", zh: "距上仗日數", note: "休息長短。", group: "form", source: "result", status: "adopted", gain: 504 },
  { id: "weight_avg5", zh: "近 5 仗平均負磅", note: "近期負磅水平，反映評分走勢。", group: "form", source: "result", status: "adopted", gain: 708 },

  // ── 距離／場地／檔位 ──
  { id: "distance", zh: "今場距離", note: "本場路程（米）。", group: "condition", source: "card", status: "adopted", gain: 96 },
  { id: "field_size", zh: "出賽匹數", note: "全場馬匹數。", group: "condition", source: "card", status: "adopted", gain: 127 },
  { id: "draw", zh: "檔位", note: "今場閘位。", group: "condition", source: "card", status: "adopted", gain: 970 },
  { id: "actual_weight", zh: "實際負磅", note: "今場負磅。", group: "condition", source: "card", status: "adopted", gain: 440 },
  { id: "dist_starts", zh: "同程出賽次數", note: "此馬跑過本場距離幾多次。", group: "condition", source: "result", status: "adopted", gain: 930 },
  { id: "dist_top3", zh: "同程上名次數", note: "同距離入前三次數。", group: "condition", source: "result", status: "adopted", gain: 382 },
  { id: "going_starts", zh: "同場地狀況出賽數", note: "相同going 下嘅出賽數。", group: "condition", source: "result", status: "adopted", gain: 566 },
  { id: "going_top3", zh: "同場地狀況上名數", note: "相同going 下入前三次數。", group: "condition", source: "result", status: "adopted", gain: 227 },
  { id: "draw_starts", zh: "同檔位出賽數", note: "同馬場、同距離、同檔嘅出賽數。", group: "condition", source: "result", status: "adopted", gain: 506 },
  { id: "draw_top3", zh: "同檔位上名數", note: "同檔入前三次數。", group: "condition", source: "result", status: "adopted", gain: 1121 },
  { id: "combo_starts", zh: "同場地×距離出賽數", note: "馬場＋距離組合往績深度。", group: "condition", source: "result", status: "adopted", gain: 633 },
  { id: "combo_top3", zh: "同場地×距離上名數", note: "此組合入前三次數。", group: "condition", source: "result", status: "adopted", gain: 543 },
  { id: "is_sprint", zh: "短途賽", note: "1000–1200m 標記。", group: "condition", source: "card", status: "adopted", gain: 21 },
  { id: "is_middle", zh: "中距離賽", note: "1400–1650m 標記。", group: "condition", source: "card", status: "adopted", gain: 16 },
  { id: "is_distance", zh: "長途賽", note: "1800m 以上標記。", group: "condition", source: "card", status: "adopted", gain: 0 },
  { id: "draw_x_sprint", zh: "檔位×短途 交互", note: "短途內欄優勢由模型自行學。", group: "condition", source: "card", status: "adopted", gain: 284 },
  { id: "going_code", zh: "場地狀況代碼", note: "好地／好地至軟等直接編碼。", group: "condition", source: "card", status: "pending", reason: "重要度為 0：同場全部馬匹數值一樣，模型切唔出分別；已用『同場地往績』代替。" },

  // ── 騎練配合 ──
  { id: "tv_starts", zh: "練馬師×馬場 出賽數", note: "練馬師喺該馬場嘅出賽深度。", group: "pairing", source: "result", status: "adopted", gain: 435 },
  { id: "tv_top3", zh: "練馬師×馬場 上名數", note: "練馬師該馬場上名紀錄。", group: "pairing", source: "result", status: "adopted", gain: 652 },
  { id: "jv_starts", zh: "騎師×馬場 出賽數", note: "騎師喺該馬場出賽深度。", group: "pairing", source: "result", status: "adopted", gain: 422 },
  { id: "jv_top3", zh: "騎師×馬場 上名數", note: "騎師該馬場上名紀錄。", group: "pairing", source: "result", status: "adopted", gain: 543 },
  { id: "jdb_starts", zh: "騎師×檔位 出賽數", note: "騎師喺該檔位嘅出賽深度。", group: "pairing", source: "result", status: "adopted", gain: 372 },
  { id: "jdb_top3", zh: "騎師×檔位 上名數", note: "騎師該檔位上名紀錄。", group: "pairing", source: "result", status: "adopted", gain: 802 },
  { id: "jg_starts", zh: "騎師×場地狀況 出賽數", note: "騎師喺該going 出賽深度。", group: "pairing", source: "result", status: "adopted", gain: 457 },
  { id: "jg_top3", zh: "騎師×場地狀況 上名數", note: "騎師該going 上名紀錄。", group: "pairing", source: "result", status: "adopted", gain: 505 },
  { id: "tg_starts", zh: "練馬師×場地狀況 出賽數", note: "練馬師該going 出賽深度。", group: "pairing", source: "result", status: "adopted", gain: 443 },
  { id: "tg_top3", zh: "練馬師×場地狀況 上名數", note: "練馬師該going 上名紀錄。", group: "pairing", source: "result", status: "adopted", gain: 530 },

  // ── 步速走位 ──
  { id: "horse_pace_n", zh: "步速樣本數", note: "近 8 仗可算步速嘅場數。", group: "pace", source: "result", status: "adopted", gain: 225 },
  { id: "horse_pace_early", zh: "前段位置傾向", note: "此馬習慣搶前定守後。", group: "pace", source: "result", status: "adopted", gain: 558 },
  { id: "horse_pace_style", zh: "跑法分類", note: "領放／跟前／後上分類。", group: "pace", source: "result", status: "adopted", gain: 6 },
  { id: "race_n_leaders", zh: "全場領放馬數", note: "本場有幾多匹習慣搶前。", group: "pace", source: "result", status: "adopted", gain: 56 },
  { id: "race_n_closers", zh: "全場後上馬數", note: "本場有幾多匹習慣後上。", group: "pace", source: "result", status: "adopted", gain: 224 },
  { id: "horse_pace_clash", zh: "步速衝突度", note: "此馬跑法喺本場係唔係撞正一堆同型馬。", group: "pace", source: "result", status: "adopted", gain: 8 },
  { id: "paceclash_x_distance", zh: "步速衝突×長途 交互", note: "長途賽步速衝突影響更大。", group: "pace", source: "result", status: "adopted", gain: 0 },

  // ── 分段時間 ──
  { id: "sect_n", zh: "分段樣本數", note: "近 6 仗有分段資料嘅場數。", group: "sectional", source: "sectional", status: "adopted", gain: 28 },
  { id: "sect_early_avg", zh: "前段平均位置", note: "分段表計出嘅前段走位。", group: "sectional", source: "sectional", status: "adopted", gain: 500 },
  { id: "sect_late_kick", zh: "末段爆發力", note: "後半段追上幾多位。", group: "sectional", source: "sectional", status: "adopted", gain: 816 },
  { id: "sect_early_z", zh: "前段速度 Z 值", note: "用真實分段時間（唔係名次）計嘅前段速度標準分。", group: "sectional", source: "sectional", status: "pending", reason: "回測加入後前三命中無提升，且舊年份分段時間覆蓋不足；保留待資料補齊再試。" },
  { id: "sect_fin_z", zh: "尾段速度 Z 值", note: "尾段真實速度標準分。", group: "sectional", source: "sectional", status: "pending", reason: "同上：覆蓋不足，回測未過關。" },

  // ── 班次變化 ──
  { id: "class_now_num", zh: "今場班次", note: "本場班次數值化。", group: "class", source: "card", status: "adopted", gain: 112 },
  { id: "last_class_num", zh: "上仗班次", note: "上一場班次。", group: "class", source: "result", status: "adopted", gain: 48 },
  { id: "class_delta", zh: "升／降班幅度", note: "今場相對上仗係升班定降班。", group: "class", source: "result", status: "adopted", gain: 66 },

  // ── 血統 ──
  { id: "sire_top3_sm", zh: "父系後代上名率", note: "以賽日之前資料計嘅平滑上名率（無偷答案）。", group: "pedigree", source: "pedigree", status: "adopted", gain: 719 },
  { id: "sire_dist_top3_sm", zh: "父系同距離上名率", note: "父系喺本場距離帶嘅後代成績。", group: "pedigree", source: "pedigree", status: "adopted", gain: 464 },
  { id: "damsire_top3_sm", zh: "母系父上名率", note: "外祖父後代上名率。", group: "pedigree", source: "pedigree", status: "adopted", gain: 737 },

  // ── 配備變化 ──
  { id: "gear_first_n", zh: "首次配戴件數", note: "今場首次戴嘅配備數量。", group: "gear", source: "card", status: "pending", reason: "回測未過關：香港排位表配備變動場次太少，訊號稀疏。" },
  { id: "gear_off_n", zh: "取消配戴件數", note: "今場除去嘅配備數量。", group: "gear", source: "card", status: "pending", reason: "同上：覆蓋不足。" },
  { id: "gear_changed", zh: "配備有變", note: "今場配備同上仗有無分別。", group: "gear", source: "card", status: "pending", reason: "回測未過關。" },
  { id: "gear_blinkers", zh: "戴眼罩／半罩", note: "限制視野類配備。", group: "gear", source: "card", status: "pending", reason: "回測未過關。" },

  // ── 賽事評語 ──
  { id: "cmt_n", zh: "評語樣本數", note: "近 8 仗有官方評語嘅場數。", group: "comment", source: "comment", status: "pending", reason: "評語文字覆蓋不平均（舊年份缺失），回測無提升。" },
  { id: "cmt_trouble", zh: "受阻比率", note: "評語提及受阻嘅加權比率。", group: "comment", source: "comment", status: "pending", reason: "同上。" },
  { id: "cmt_wide", zh: "走大疊比率", note: "評語提及走外疊嘅加權比率。", group: "comment", source: "comment", status: "pending", reason: "同上。" },
  { id: "cmt_badstart", zh: "出閘失準比率", note: "評語提及出閘失誤嘅加權比率。", group: "comment", source: "comment", status: "pending", reason: "同上。" },

  // ── 休賽復出（Stage 14）──
  { id: "layoff_band", zh: "休賽日數分段", note: "把休息長短分為幾個等級。", group: "layoff", source: "result", status: "pending", gain: 0, reason: "2026-09 回測：加入後非開鑼日前三命中由 87.2% 跌至 84.8%，未上線。" },
  { id: "is_layoff55", zh: "長休復出（>55 日）", note: "首次復出標記。", group: "layoff", source: "result", status: "pending", gain: 12, reason: "同一輪回測拖低命中，仍在做開鑼日專屬驗證。" },
  { id: "cb_starts", zh: "復出戰出賽數", note: "此馬過去復出戰次數。", group: "layoff", source: "result", status: "pending", gain: 193, reason: "重要度不低，但整體命中未提升；待開鑼日 A/B 完成。" },
  { id: "cb_top3", zh: "復出戰上名數", note: "此馬復出戰入前三次數。", group: "layoff", source: "result", status: "pending", gain: 279, reason: "同上。" },
  { id: "season_starts", zh: "本季已出賽次數", note: "喺當季嘅第幾次出賽。", group: "layoff", source: "result", status: "pending", gain: 332, reason: "同上。" },
  { id: "is_season_debut", zh: "賽季首戰", note: "開鑼日／賽季第一戰標記。", group: "layoff", source: "result", status: "pending", gain: 0, reason: "同上。" },
  { id: "field_layoff_frac", zh: "全場長休比例", note: "本場有幾多成馬匹係長休復出（開鑼日極高）。", group: "layoff", source: "result", status: "pending", gain: 295, reason: "設計用意係開鑼日自動調低近況訊號權重；仍在驗證。" },
  { id: "layoff_x_form", zh: "休賽×近況 交互", note: "把休息長短同近況耦合。", group: "layoff", source: "result", status: "pending", gain: 280, reason: "同上。" },

  // ── 市場盤口 ──
  { id: "win_odds", zh: "獨贏賠率", note: "市場賠率，網站只作對照顯示。", group: "market", source: "odds", status: "never", reason: "刻意零權重：賠率係大眾意見，落入模型會令預測跟熱門走，失去搏冷價值，亦令命中率評核唔再獨立。" },
  { id: "beaten_lengths", zh: "落後馬鼻距", note: "賽後輸幾多個馬位。", group: "market", source: "result", status: "never", reason: "屬賽果本身，用嚟做特徵就係偷答案；只保留作將來輔助訓練目標。" },
];

export const FEATURE_STATS = {
  total: FEATURE_CATALOG.length,
  adopted: FEATURE_CATALOG.filter((f) => f.status === "adopted").length,
  pending: FEATURE_CATALOG.filter((f) => f.status === "pending").length,
  never: FEATURE_CATALOG.filter((f) => f.status === "never").length,
  maxGain: Math.max(...FEATURE_CATALOG.map((f) => f.gain ?? 0)),
};

export const STATUS_LABEL: Record<FeatureStatus, string> = {
  adopted: "已採用",
  pending: "未採用",
  never: "永不採用",
};
