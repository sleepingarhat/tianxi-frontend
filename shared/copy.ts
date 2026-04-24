/**
 * 天喜文案 · 三端唯一真相
 *
 * ⚠️ 硬規則（user directive 2026-04-24）：
 *   - 禁止以「命中率」做賣點
 *   - 4 大賣點：靈活因子 · 獨門 Elo · 龐大數據庫 · 賠率不加權
 *   - 語氣：粵語為主、略帶港風、專業而唔離地
 */

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
    id: "no-odds-weighting",
    icon: "🚫",
    title: "賠率不加權",
    subtitle: "避開大眾偏見",
    body:
      "賠率反映嘅係市場情緒，唔係事實。我哋只用 HKJC 原始觀察事實" +
      "（名次、時間、走位、分段、檔位）計算，拒絕跟風，拒絕幻覺源。",
  },
] as const;

export const hero = {
  eyebrow: "香港賽馬 · AI 預測平台",
  headline: "唔同其他 AI—我哋將決定權交返俾你",
  sub:
    "11 年數據、獨門 Elo、靈活因子。天喜幫你分析，最後仲係你話事。" +
    "市場呢個人人跟風嘅地方，清醒先係贏嘅開始。",
  ctaPrimary: "立即試用",
  ctaSecondary: "睇 Demo",
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

  /** 主頁 CTA 區（底部、推 waitlist / signup） */
  bottomCta: {
    title: "準備好親身感受？",
    sub: "首 3 個月半價 · 創始會員名額有限",
    primary: "加入候補",
    primaryRoute: "/waitlist",
    secondary: "睇定價",
    secondaryRoute: "/pricing",
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
    subtitle: "你揀因子，AI 幫你計",
    body:
      "揀你信嘅因子（Elo / 形態 / 檔位 / 負磅 / 分段 / 騎練合拍度 …），" +
      "天喜即刻用你嘅 profile 幫你排順序。" +
      "仲可以同 AI 對話追問 —「點解 #5 排第一？」、「近 3 場走位有冇伏？」。",
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

export const faq = [
  {
    q: "你哋點解唔公佈命中率？",
    a:
      "賽馬 AI 公佈嘅「命中率」大部分靠揀時間窗同場次篩選做出嚟。" +
      "我哋選擇唔做呢件事 — 你應該信你自己嘅判斷，唔係信一個由我哋加工嘅數字。",
  },
  {
    q: "賠率點解唔加權？",
    a:
      "賠率係市場情緒嘅總和，而市場長期對冷門馬估價過低、對熱門馬估價過高。" +
      "如果我哋跟賠率加權，就同其他 AI 一樣跟風，冇 edge。",
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
