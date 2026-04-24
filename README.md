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

## 🚀 5 個主要版面

| 版面 | 圖示 | 內容 |
|---|---|---|
| 儀表板 | 📊 | Elo 排行、今日賽事、數據庫統計（**無命中率**） |
| 選馬助手 | 🔮 | 即時賠率 + 靈活因子選擇 + AI 對話 |
| 賽馬日曆 | 📅 | 未來排位表、過往賽果快速跳轉 |
| 馬匹百科 | 📖 | 每匹馬嘅 profile、形態、Elo 曲線 |
| 馬迷聊天室 | 🌐 | Telegram 風格社群、話題室、實時討論 |

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
