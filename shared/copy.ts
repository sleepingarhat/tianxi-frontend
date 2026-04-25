/**
 * 天喜文案 · 三端唯一真相
 *
 * ⚠️ 硬規則（user directive 2026-04-24）：
 *   - 禁止以「命中率」做賣點
 *   - 4 大賣點：靈活因子 · 獨門 Elo · 龐大數據庫 · 賠率不加權
 *   - 語氣：粵語為主、略帶港風、專業而唔離地
 *
 * ⚠️ LAUNCH 策略（user directive 2026-04-25）：
 *   - 上線時 NO PRICING · 標榜「限時免費試用 · 全功能開放」
 *   - 禁用「升級」「付費解鎖」「睇計劃」「睇定價」字眼
 *   - 任何原本導向 `/pricing` 嘅 CTA 要改去 `/beta` 或 `/signup`
 *   - 見 shared/pricing.ts 嘅 PRICING_ENABLED flag + betaProgram export
 */

/** Launch 階段免費試用 slogan 集合 · 散落各 hero / banner / CTA 用 */
export const betaLaunch = {
  primary: "限時免費試用 · 全功能開放",
  secondary: "Beta 用戶優先 · 幫我哋一齊改進天喜",
  short: "全功能免費試用",
  chip: "Beta 免費",
  banner: "天喜 Beta 版全功能免費試用中 · 立即加入",
  thanks: "多謝你成為早期用戶，你嘅每一個 click 都係我哋改進嘅養份。",
  vague: "限時", // intentionally no end date — user directive
  ctaJoin: "免費開始用",
  ctaJoinSub: "唔使填信用卡 · 電郵註冊即用",
  featureListTitle: "Beta 期間全部免費",
  featureList: [
    "AI 選馬建議 · 全日全部場次",
    "自選因子 + 自訂權重比例",
    "Elo 深度回溯 + 進階聊天頻道",
    "心水追蹤無上限",
    "賽後對賬通知 · 完全無廣告",
  ] as const,
} as const;

export const brand = {
  name: "天喜",
  nameEn: "Tianxi",
  tagline: "香港賽馬 AI 數據平台",
  taglineLong: "香港獨一無二最有影響力嘅賽馬數據 + AI 預測平台",
  domain: "tianxi.ai",
} as const;

/** 4 大賣點 · 貫穿所有 landing / marketing / onboarding */
export const sellingPoints = [
  {
    id: "flexible-factors",
    icon: "🎛️",
    title: "靈活嘅因子選擇",
    subtitle: "你信咩，就用咩",
    body:
      "市面啲 AI 將成堆因子黑箱式塞俾你。天喜反過嚟：每個因子都攤開俾你揀。" +
      "信形態？揀形態。信 Elo？加埋 Elo。一切由你話事。",
  },
  {
    id: "proprietary-elo",
    icon: "📈",
    title: "獨門 Elo 計分",
    subtitle: "馬 · 騎師 · 練馬師 三條曲線",
    body:
      "11 年、39,617 場出賽紀錄餵出嚟嘅 Elo v1.1。" +
      "馬有馬嘅 Elo、騎師有騎師嘅、練馬師有練馬師嘅。獨立計分，獨立演化。",
  },
  {
    id: "massive-database",
    icon: "🗄️",
    title: "龐大全面嘅數據庫",
    subtitle: "886 場賽馬日 · 8,361 場賽事 · 106,004 行",
    body:
      "由 2016 到今日、每一場賽事嘅 5 份檔案（賽果 / 評述 / 派彩 / 分段 / 片段）" +
      "加埋每匹馬嘅 profile、形態、晨操、傷患、轉廄全紀錄。",
  },
  {
    id: "pure-physics",
    icon: "⚖️",
    title: "賠率不加權 · 純物理向量",
    subtitle: "別人分析「錢點投」· 天喜分析「馬點跑」",
    body:
      "賠率反映嘅係人嘅情緒同資金流向，唔係馬嘅實力。" +
      "我哋勝率模型完全唔用賠率做因子（β=0 硬編碼），" +
      "因子只用原始物理事實：名次、時間、走位、分段、檔位、負磅、場地、途程、班次。" +
      "計出嚟嘅理論機率再同市場賠率對比 —— 理論 70% 入三甲、賠率卻去到 15 倍？" +
      "市場低估咗，呢匹就係「值博馬」。",
    // 內部 tag
    conceptKey: "pure-physics",
  },
] as const;

/**
 * 3 Pillars · 支撐「賠率不加權」嘅學術 + 市場事實
 * 用於 /why-beta-zero 頁、主頁 "Why β=0" section、predictor 解釋彈窗
 */
export const pillars = [
  {
    id: "odds-not-probability",
    num: "01",
    title: "賠率 ≠ 真實機率",
    body:
      "HKJC 獨贏池官方抽水 17.5%，其他彩池高達 20%。" +
      "即係話每 100 蚊落注，長期得返 80-82.5 蚊。" +
      "賠率由「公眾投注金額」反推，先天就係負 EV — 跟賠率買，數學上必敗。",
    citation: "HKJC 官方 Take-out rate (17.5%-20%)",
  },
  {
    id: "human-bias",
    num: "02",
    title: "人為干擾太多",
    body:
      "熱門－冷馬偏誤 (Favorite-Longshot Bias) 係賽馬市場最穩定嘅異象：" +
      "熱門被低估、冷馬被高估。公眾情緒、明星騎師、媒體 tier 榜、" +
      "甚至賽前 tipster 文章，全部會扭曲賠率，但同馬嘅真實實力無關。",
    citation: "Snowberg & Wolfers 2010 (NBER / JPE) · Figlewski 1979 (JPE)",
  },
  {
    id: "pure-physics-β0",
    num: "03",
    title: "純歷史數據 + 統計機率",
    body:
      "Benter (1994) 經典論文示範：用多因子 logistic regression + β=0 " +
      "（即完全排除賠率作為 regressor）建立嘅模型，長線可以穩定打敗市場。" +
      "天喜沿用呢條思路 —— 只用物理觀察量，機率由數據自己講。",
    citation: "Benter 1994 · 多因子 logistic · β=0 硬編碼",
  },
] as const;

/**
 * 學術 / 市場事實引用 · 三端共用
 * - `key`: 用於主頁 + 賣點解釋卡（用戶級可讀）
 * - `architecture`: 用於 /docs 或 whitepaper（技術深入）
 */
export const citations = {
  thesis:
    "別人嘅系統分析嘅係「錢點投」；天喜分析嘅係「馬點跑」。",
  key: [
    {
      source: "HKJC Take-out",
      journal: "HKJC 官方",
      year: "ongoing",
      note: "獨贏 17.5% · 其他彩池最高 20% · 市場長期負 EV",
      tag: "market-structure",
    },
    {
      source: "Snowberg & Wolfers",
      journal: "NBER Working Paper / Journal of Political Economy",
      year: "2010",
      note: "Favorite-Longshot Bias · 橫跨多市場實證 · 公眾情緒扭曲賠率",
      tag: "behavioral",
    },
    {
      source: "Figlewski",
      journal: "Journal of Political Economy",
      year: "1979",
      note: "賽馬市場效率性測試 · 開創性 · 賠率遠離真實機率",
      tag: "efficiency",
    },
    {
      source: "Benter",
      journal: "Computer Based Horse Race Handicapping",
      year: "1994",
      note: "多因子 logistic regression · β=0 純物理因子可長線跑贏市場",
      tag: "model-architecture",
    },
  ],
  architecture: [
    { source: "Ji", year: "2023", topic: "Horse racing ML survey" },
    { source: "Lewis", year: "2020", topic: "Sports analytics deep learning" },
    { source: "Guo", year: "2017", topic: "Elo system extensions" },
    { source: "Kaufman", year: "2011", topic: "Pairwise rating systems" },
    { source: "López de Prado", year: "2018", topic: "Financial ML · backtest bias" },
    { source: "Ali", year: "1977", topic: "Probability judgments at racetrack" },
    { source: "Snyder", year: "1978", topic: "Horse racing market efficiency" },
  ],
  /** 關鍵字 · 用於 SEO meta + keyword chips */
  keywords: [
    "賠率 ≠ 真實機率",
    "Favorite-Longshot Bias",
    "β=0 硬編碼",
    "純物理向量",
    "錢點投 vs 馬點跑",
    "HKJC 17.5% Take-out",
    "Snowberg & Wolfers",
    "Figlewski",
    "Benter",
  ] as const,
} as const;

export const hero = {
  eyebrow: "香港賽馬 · AI 預測平台",
  headline: "唔同其他 AI—我哋將決定權交返俾你",
  sub:
    "11 年數據、獨門 Elo、靈活因子。天喜幫你分析，最後仲係你話事。" +
    "市場呢個人人跟風嘅地方，清醒先係贏嘅開始。",
  // Launch 階段 CTA · 2026-04-25 user directive
  ctaPrimary: "免費開始用",
  ctaPrimarySub: "唔使信用卡 · 電郵註冊即用",
  ctaSecondary: "睇 Demo",
  // Beta 告示 chip · 掛喺 hero headline 上面
  betaRibbon: betaLaunch.primary,
  trustLine: "超過 886 場賽馬日嘅真實數據 · 不含任何「命中率」宣傳",
} as const;

/**
 * 主版面 (Hub / Home) · 獨立於 5 個 feature 版面
 * 導航中心 + 介紹 + 定價 + 王牌展示 + 新聞
 */
export const hub = {
  eyebrow: "天喜 · 主頁",
  welcomeTitle: "歡迎返嚟 · 今日馬場有料到",

  /** 5 個版面嘅導航卡（順序決定主頁顯示次序） */
  navCards: [
    { featureKey: "dashboard",   accent: "blue",  route: "/dashboard" },
    { featureKey: "predictor",   accent: "red",   route: "/predictor", featured: true },
    { featureKey: "calendar",    accent: "green", route: "/calendar" },
    { featureKey: "encyclopedia", accent: "gold", route: "/encyclopedia" },
    { featureKey: "chatroom",    accent: "blue",  route: "/chat" },
  ] as const,

  /** 王牌功能 spotlight（主頁 hero-band 下一個 section） */
  flagship: {
    title: "王牌功能：靈活因子 × 獨門 Elo",
    sub: "行業唯一俾用戶自選因子，配合 3 條獨立 Elo 曲線即時計算",
    bullets: [
      "12 個因子隨意開關 · 可保存多個個人策略",
      "馬 / 騎師 / 練馬師三條 Elo，獨立演化",
      "即時 AI 對話追問：「點解 #5 排第一？」",
    ],
    cta: "試用選馬助手",
    ctaRoute: "/predictor",
  },

  /** 系統介紹（condensed，用 shared.sellingPoints 做詳細版） */
  intro: {
    title: "唔止係一個 AI · 係一套完整嘅賽馬數據生態",
    body:
      "11 年、886 場賽馬日、8,361 場賽事、106,004 行出賽紀錄。" +
      "每一個數字都有 HKJC 原始 source 可追溯。" +
      "我哋唔賣預測結論，只賣決策工具 — 最後嘅 judgement 仲係你。",
  },

  /** 系統優勢標語（scroller / marquee 用） */
  tagline: [
    "靈活因子 · 你揀你信",
    "獨門 Elo · 3 條曲線",
    "886 賽馬日 · 11 年數據",
    "賠率不加權 · 避開跟風",
    "HKJC 原始事實 · 可追溯",
    "別人分析「錢點投」· 天喜分析「馬點跑」",
    "β=0 硬編碼 · Benter 1994 傳承",
  ] as const,

  /** 焦點新聞區域（由 NewsScraper 產出 · 每日刷新） */
  news: {
    sectionTitle: "今日焦點",
    sectionSub: "賽馬日頭條 · 每日自動更新",
    emptyState: "今日暫無新聞，請查閱其他版面",
    // 數據源：tianxi-database/data/news/YYYY-MM/news_items.csv
    // 圖片源：tianxi-database/data/news/images/<slug>.jpg
    scraperTodo: true, // NewsScraper.py 未部署 · 見 tianxi-database plan.md
  },

  /**
   * 主頁 CTA 區（底部）
   * 2026-04-25 user directive: launch 階段 NO PRICING.
   * 舊 copy「首 3 個月半價 · 創始會員名額有限」+「睇定價」已移除。
   */
  bottomCta: {
    title: "準備好親身感受？",
    sub: "Beta 版全功能免費試用 · 唔使信用卡",
    primary: "免費開始用",
    primaryRoute: "/signup",
    secondary: "了解 Beta 計劃",
    secondaryRoute: "/beta",
  },

  /**
   * Beta 專區卡（取代舊 v0.3 設計嘅「收費計劃」section）
   * Hub 頁第 3 個 section = betaSection instead of pricing tiers.
   */
  betaSection: {
    eyebrow: "Beta 免費期",
    title: "全功能開放 · 唔使俾錢",
    sub:
      "我哋仲喺 beta 階段，想收集真實使用數據令系統做得更好。" +
      "呢段時間全部功能免費解鎖，唔設訂閱、冇廣告。",
    bullets: [
      "AI 建議 · 每日每場全部解鎖",
      "自選因子 + 自訂權重比例",
      "Elo 深度回溯 + 進階聊天室",
      "心水追蹤無上限 + 賽後對賬通知",
    ] as const,
    fineprint:
      "日後我哋會根據使用情況考慮轉化方案。" +
      "早期用戶會收到通知，並會獲得優先過渡條件。",
    cta: "立即免費註冊",
    ctaRoute: "/signup",
  },
} as const;

export const features = {
  dashboard: {
    icon: "📊",
    title: "儀表板",
    subtitle: "一眼睇晒今日全局",
    body:
      "今日邊場、Elo 前十匹活躍馬、馬房熱度、數據庫實時計數。" +
      "全部數字來自原始 HKJC 事實，冇任何人為加工。",
    notShown: ["命中率", "勝算百分比", "贏錢保證"],
  },
  predictor: {
    icon: "🔮",
    title: "選馬助手",
    subtitle: "你揀因子，AI 幫你計 · 仲會標記「值博馬」",
    body:
      "揀你信嘅因子（Elo / 形態 / 檔位 / 負磅 / 分段 / 騎練合拍度 …），" +
      "天喜即刻用你嘅 profile 幫你排順序。" +
      "系統會自動比對理論機率 vs 市場賠率，標記值博機會（Value Gap）。" +
      "仲可以同 AI 對話追問 —「點解 #5 排第一？」、「近 3 場走位有冇伏？」。",
    valueHorseNote:
      "值博馬 = 理論勝率 × 賠率 > 1 · 由純物理因子模型 + 即時賠率交叉計算",
  },
  calendar: {
    icon: "📅",
    title: "賽馬日曆",
    subtitle: "由 2016 到明年",
    body:
      "152 個已確認賽馬日 · 一 click 跳入任何一場嘅排位表 / 賽果 / 派彩 / 片段。",
  },
  encyclopedia: {
    icon: "📖",
    title: "馬匹百科",
    subtitle: "每匹馬嘅完整檔案",
    body:
      "血統、年齡、評分變化、Elo 曲線、晨操紀錄、傷患史、轉廄史、每場走位。" +
      "就好似 Wikipedia，不過係 HKJC 專屬版。",
  },
  chatroom: {
    icon: "🌐",
    title: "馬迷聊天室",
    subtitle: "Telegram 風格 · 實時討論",
    body:
      "官方主題室、場次即時室、私密群組。" +
      "睇馬唔再孤獨，一齊分析、一齊討論。",
  },
} as const;

/**
 * Elo 解釋器 · 會員教育內容
 * 用於：predictor 解釋彈窗、/why-elo 專題頁、onboarding 第 2 屏、FAQ 深入版
 *
 * 用戶指令 2026-04-24：
 *   「我哋ELO嘅獨有算法、ELO係啲咩？同馬會評分有咩分別？點解我哋更準確？
 *    呢啲都係我哋要話俾會員聽嘅。」
 */
export const eloExplainer = {
  /** 主標題 + 一句 elevator pitch */
  headline: "獨門 Elo v1.1 · 同馬會評分完全係兩件事",
  elevator:
    "Elo 唔係主觀打分、係由每場對戰自動計出嚟嘅客觀實力數字。" +
    "我哋仲將同一套邏輯拆成馬、騎師、練馬師三條獨立曲線 —— 全行只此一家。",

  /** 「咩係 Elo」· 基礎概念（俾新會員睇） */
  whatIsElo: {
    title: "Elo 係啲咩？",
    body:
      "Elo 呢套評分系統 1960 年代由 Arpad Elo 為國際象棋發明，" +
      "之後擴展到足球、網球、圍棋、電競。核心邏輯：" +
      "兩個對手交手，贏嘅一方加分、輸嘅減分；" +
      "分數差距愈大、冷門爆出嘅加減幅度愈勁。" +
      "經過幾十場對戰之後，每個選手嘅分數會自然收斂到真實實力水平。",
    whyItWorks: [
      "完全由結果驅動 · 冇主觀裁判",
      "對戰愈多、收斂愈準",
      "可以直接比較 A vs B 嘅預期勝率",
      "新選手加入唔會影響舊分數（相對公平）",
    ],
  },

  /** 核心比較：Elo vs HKJC 評分 */
  vsHkjcRating: {
    title: "同馬會評分有咩分別？",
    subtitle: "一個係人打分、一個係數據自己計",
    table: [
      {
        dimension: "計算方式",
        hkjc: "HKJC 評磅員人手調整",
        tianxi: "每場結果自動計算（Logistic probability）",
      },
      {
        dimension: "主觀 vs 客觀",
        hkjc: "包含評磅員主觀判斷",
        tianxi: "100% 數據驅動 · 冇人為干預",
      },
      {
        dimension: "調整頻率",
        hkjc: "賽後幾日先出新評分 · 有時滯",
        tianxi: "每場完賽立即更新",
      },
      {
        dimension: "覆蓋維度",
        hkjc: "只有馬嘅評分 · 騎師練馬師冇",
        tianxi: "馬 / 騎師 / 練馬師 三條獨立曲線",
      },
      {
        dimension: "對手強弱",
        hkjc: "冇直接反映當日對手 field",
        tianxi: "每場計算 field 平均 Elo · 贏強敵加更多",
      },
      {
        dimension: "跨屆比較",
        hkjc: "負磅制度導致評分被壓縮",
        tianxi: "絕對數值 · 可跨年份比較金鎗六十 vs 活力先鋒",
      },
      {
        dimension: "可驗證性",
        hkjc: "評磅員理由冇公開",
        tianxi: "開源公式 · 每場 delta 可追溯到原始賽果",
      },
    ] as const,
  },

  /** 我哋嘅 v1.1 算法特點 */
  ourAlgorithm: {
    title: "天喜 Elo v1.1 · 獨有之處",
    bullets: [
      {
        key: "three-curves",
        icon: "🐎🏇👔",
        title: "三條獨立曲線",
        body:
          "馬有馬嘅 Elo、騎師有騎師嘅、練馬師有練馬師嘅。" +
          "一場賽果同時更新 3 條曲線，各自演化。" +
          "市面 99% 系統只計馬匹 Elo —— 我哋係全港唯一計齊三者。",
      },
      {
        key: "field-aware",
        icon: "⚔️",
        title: "Field-aware 對手加權",
        body:
          "贏一場全 G1 高磅對手，同贏一場 Class 5 新馬賽，加分幅度完全唔同。" +
          "我哋按當日 field 平均 Elo 動態調節 K-factor，" +
          "確保強弱對手嘅分差得到合理反映。",
      },
      {
        key: "multi-axis",
        icon: "📐",
        title: "5 個 Elo 軸",
        body:
          "唔係只有一個「總 Elo」。" +
          "每匹馬同時有 overall、turf_sprint (< 1200m)、turf_mile (1400-1600m)、" +
          "turf_middle (1800-2000m)、turf_staying (> 2000m) 五條獨立曲線。" +
          "一匹短途機器落長途可能跌一大截 —— 呢個訊號其他系統收唔到。",
      },
      {
        key: "11y-training",
        icon: "📚",
        title: "11 年 · 39,617 場訓練",
        body:
          "由 2016 年第一場賽事餵起、每一場結果逐步校準。" +
          "K-factor、field weight、起步 rating 全部經過 backtest grid search，" +
          "Brier score 持續優化。",
      },
      {
        key: "decay",
        icon: "⏳",
        title: "Time-decay · 新鮮度加權",
        body:
          "隔咗 6 個月冇出賽嘅馬，Elo 自動加入 uncertainty band。" +
          "半退役或者復出馬嘅分數會標記為「stale」，避免誤導。",
      },
    ] as const,
  },

  /** 為乜我哋更準 */
  whyMoreAccurate: {
    title: "點解天喜 Elo 比馬會評分更貼近真實？",
    reasons: [
      {
        num: "1",
        title: "冇人為壓縮",
        body:
          "馬會評分受負磅制度牽制 —— 強馬贏太多會被加磅壓低評分，" +
          "目的係為咗平衡賽事、令賠率更吸引投注。" +
          "但呢個係「政策目標」，唔係「實力量度」。" +
          "Elo 冇呢個包袱，純粹反映「邊匹馬實際更強」。",
      },
      {
        num: "2",
        title: "對手強度內建",
        body:
          "馬會評分睇絕對名次、唔睇當日對手陣容。" +
          "Elo 每場都問：「呢班對手嘅平均分幾多？」" +
          "打贏強 field +20，打贏弱 field 可能只 +3。",
      },
      {
        num: "3",
        title: "騎師練馬師獨立追蹤",
        body:
          "一匹馬換騎師、轉練馬師之後表現大變係常態。" +
          "我哋可以拆解：「係馬狀態改變、定係騎師 Elo 突破、定係練馬師策略調整？」" +
          "馬會評分混埋一齊 · 成件事變黑箱。",
      },
      {
        num: "4",
        title: "即時、可審計、開源公式",
        body:
          "賽後 1 小時內自動更新；每場 delta 可追溯到單場數據；" +
          "公式公開（基於 Elo + Benter 1994 multi-factor 框架）。" +
          "你可以自己抽一場賽果、手計我哋嘅 rating、結果一樣。",
      },
    ] as const,
  },

  /** 實測 benchmark（用內部資料 · 唔暴露命中率） */
  benchmark: {
    title: "Elo v1.1 經過點樣測試？",
    body:
      "11 年 · 8,361 場 · 106,004 行 出賽紀錄做 backtest。" +
      "Brier score、calibration curve、field-rank correlation " +
      "全部 track 緊，每個版本升級都要打得贏舊版。",
    note:
      "具體命中率數字屬於內部監察指標 · 係為咗持續改良系統。" +
      "我哋唔會將未經充分驗證嘅數字擺出嚟賣，呢個係我哋對會員嘅承諾。",
  },

  /** CTA · 跳去 predictor 試用 */
  cta: {
    primary: "試用選馬助手 · 親身體驗 Elo",
    primaryRoute: "/predictor",
    secondary: "睇 Elo 榜",
    secondaryRoute: "/dashboard?tab=elo-leaderboard",
  },
} as const;

export const faq = [
  {
    q: "你哋點解唔公佈命中率？",
    a:
      "賽馬 AI 公佈嘅「命中率」大部分靠揀時間窗同場次篩選做出嚟。" +
      "我哋選擇唔做呢件事 — 你應該信你自己嘅判斷，唔係信一個由我哋加工嘅數字。",
  },
  {
    q: "賠率點解唔加權？咁即係完全唔用賠率？",
    a:
      "「不加權」係專指勝率模型入面嘅因子 — 我哋計勝率嗰陣唔會將賠率當一個 factor，" +
      "因為賠率反映嘅係人嘅情緒同資金流向，唔係馬嘅實力。" +
      "但我哋一樣會抓齊獨贏、位置、各彩池嘅最終賠率做分析。" +
      "即時賠率最大用途係 —— 同我哋嘅理論機率交叉對比搵出「值博馬」：" +
      "例如理論 70% 入三甲、但市場俾咗 15 倍賠率，即係市場低估，呢啲就係機會。",
  },
  {
    q: "咩叫「純物理向量 (Pure Physics)」？",
    a:
      "意思係我哋所有因子都源自原始物理事實 —— 名次、時間、走位、分段、檔位、" +
      "負磅、場地、途程、班次。冇任何由「別人計好嘅結論」（賠率、HKJC 評分、" +
      "媒體 tier 榜、其他 AI 嘅預測）滲入 model。只有咁樣先唔會跟風，先有真 edge。",
  },
  {
    q: "Elo 同 HKJC 評分有咩分別？",
    a:
      "HKJC 評分係人為打分，主觀成份高。Elo 係按每場實際對手強弱 + 名次差距自動調整，" +
      "完全由數據主導。而且我哋有馬、騎師、練馬師三條獨立曲線。",
  },
  {
    q: "數據更新頻率？",
    a: "每個賽馬日完成後 1 小時內自動更新到 GitHub 公開倉。用戶透過 API 即刻攞到。",
  },
  {
    q: "支唔支持手機？",
    a: "三端同步。iOS / Android / 桌面 Web 都用同一套資料、同一套 UI 語言。",
  },
] as const;

export const waitlist = {
  title: "成為創始會員",
  sub: "首批會員享 3 個月半價 · 終生優先新功能",
  placeholderEmail: "你嘅電郵",
  cta: "加入候補",
  successMsg: "收到，我哋上線前會通知你。",
} as const;

export const footer = {
  disclaimer:
    "天喜提供嘅係賽馬數據分析工具，唔係投注建議。" +
    "賭博有風險，請量力而為。18 歲以上方可參與投注。",
  copyright: (year: number) =>
    `© ${year} 天喜數據庫 · Tianxi Data Platform · 不賣命中率`,
} as const;
