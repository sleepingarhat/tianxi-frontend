# 天喜前端 · tianxi-frontend

> 香港獨一無二最有影響力嘅賽馬數據 + AI 預測平台 · 三端統一

**iOS · Android · Web** — 同一套設計語言、同一份文案、同一套 API。

---

## 🎯 產品定位

- **面向用戶收費** · 非免費玩具、非專家後台
- **核心賣點**（不是命中率）：
  1. **靈活嘅因子選擇** — 用戶揀自己信嘅因子，唔係我哋揀
  2. **獨門 Elo 計分** — 馬 / 騎師 / 練馬師三條獨立 Elo 曲線
  3. **龐大全面嘅數據庫** — 11 年、886 場賽馬日、8,361 場賽事、106,004 行馬匹出賽紀錄
  4. **賠率不加權** — 避開大眾偏見；只用 HKJC 原始事實
- **風格**：紅藍綠賽馬配色、馬場相、HKJC 官方感
- **未來擴展**：賽馬 → 足球 → 其他運動

---

## 📦 Monorepo 結構

```
tianxi-frontend/
├── app/           Expo (iOS + Android + mobile web)
├── web/           Next.js 15 (desktop landing + dashboard)
├── shared/        設計 token、文案、型別、定價、API client
│   ├── design-tokens.ts
│   ├── copy.ts
│   ├── pricing.ts
│   └── api.ts
├── package.json   npm workspaces root
└── README.md
```

**同步原則**：`shared/` 係唯一真相來源。`app/` 同 `web/` 唔可以各自定義顏色 / 文案 / 價錢。

---

## 🚀 主版面（Hub）+ 5 個功能版面

**1 主 + 5 功能** 結構。主版面係用戶入口，承擔介紹、導航、推廣角色。

### 🏠 主版面（Hub / Home · `/`）

導航中心 + 系統介紹 + 收費計劃 + 王牌功能展示 + 優勢標語 + **焦點新聞**。
用戶打開 app / web 第一眼見到嘅就係呢度。

内容 sections：
1. Hero + 4 大賣點
2. **王牌功能 spotlight**（靈活因子 × 獨門 Elo）
3. 5 個版面嘅導航卡
4. 焦點新聞卡（每日自動更新 · 見下文「新聞爬取」）
5. 系統優勢標語（marquee）
6. 收費計劃摘要
7. 底部 CTA（加入候補 / 睇定價）

### 5 個功能版面

| 版面 | 圖示 | Route | 內容 |
|---|---|---|---|
| 儀表板 | 📊 | `/dashboard` | Elo 排行、今日賽事、數據庫統計（**用戶端唔 render 命中率**） |
| 選馬助手 | 🔮 | `/predictor` | 即時賠率 + 靈活因子選擇 + AI 對話（王牌） |
| 賽馬日曆 | 📅 | `/calendar` | 未來排位表、過往賽果快速跳轉 |
| 馬匹百科 | 📖 | `/encyclopedia` | 每匹馬嘅 profile、形態、Elo 曲線 |
| 馬迷聊天室 | 🌐 | `/chat` | Telegram 風格社群、話題室、實時討論 |

---

## 📰 焦點新聞爬取

主版面嘅「今日焦點」section 需要**新聞爬取器**，計劃部署去 `tianxi-database`：

- **目標 scraper**：`NewsScraper.py`（新增）
- **來源**（優先次序）：HKJC News、South China Morning Post Racing、Oriental Daily 馬經版、Apple Daily 馬經、Google News RSS `site:racing.hkjc.com`
- **輸出**：
  - `data/news/YYYY-MM/news_items.csv`（title, url, source, published_at, summary, image_filename, tags）
  - `data/news/images/<slug>.jpg`（壓縮縮圖）
- **觸發**：每 6 小時 cron + 賽馬日前後 1 小時加頻
- **status**: 🚧 未部署（P2 feature · 主版面 MVP 可先留 empty state）

---

## 📊 命中率政策（重要）

**用戶端**：一切位置**唔顯示命中率**。避免令用戶猶豫 / 同其他 AI 比較。
**內部端**：命中率係必須追蹤嘅系統健康指標（用於升級改良）。代碼隔離 — 見 `shared/internal.ts`。
**揭示門檻**：整體 top-1 命中率 > 80% + 通過 checklist + user 親自拍板 → 先考慮對外展示。
目前 2026-04-22 實測 top-1 = 11.1%，遠低於門檻。

---

## 🔌 API 來源

- **數據層**：[`tianxi-database`](https://github.com/sleepingarhat/tianxi-database) 公開 CSV + `data/index.json` manifest
- **Elo 輸出**：GHA artifact `elo-v11-bulk-db`（SQLite）
- **實時賠率**：HKJC GraphQL endpoint（`info.cld.hkjc.com/graphql/base/`）
- **AI 對話**：後端 SSE streaming endpoint（planned）

---

## 💳 定價（繼承舊設計，可調整）

| 方案 | 價錢 | 說明 |
|---|---|---|
| 週票 | HK$48 | 試水 |
| **月費** | **HK$388** | ⭐ 主推 |
| 季票 | HK$2,988 | 相當於月費 8.5 折 |

---

## 🛠️ 開發

```bash
# 1. 克隆 + 安裝
git clone https://github.com/sleepingarhat/tianxi-frontend.git
cd tianxi-frontend
npm install

# 2. 開 web 端
npm run dev:web

# 3. 開 mobile 端（Expo）
npm run dev:app
```

---

## 📋 進度

- [x] 倉庫建立
- [x] Monorepo skeleton + `shared/` tokens & copy
- [ ] `web/` 由 `tianxi-web` (舊) 移植入來
- [ ] `app/` Expo scaffold
- [ ] 5 版面逐個實作
- [ ] API client (`shared/api.ts`) 接通 tianxi-database
- [ ] Waitlist + Stripe 接入

---

## 關聯倉庫

- [tianxi-database](https://github.com/sleepingarhat/tianxi-database) — 數據源 + scraper + GHA workflows

---

_天喜數據庫 · 香港賽馬 AI 數據平台 · Powered by 獨立因子 · 不賣命中率_
