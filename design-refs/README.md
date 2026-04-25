# TIANXI Design References

Mobile mockups for the 6 core pages. All are dark-mode 綠啡紅 aesthetic, **v2 Beta** style (NO PRICING, 限時免費 Launch positioning, 2026-04-25 policy).

## 6 頁 · 3x 高清 PNG 直連

Canva / Figma / whatever design tool 用 — 右 click 連結另存 → upload：

| # | 頁面 | 3x PNG Raw URL |
|---|------|---|
| 01 | **主版面 Hub** (首頁) | [01-home-v2-beta-1125x5100.png](https://raw.githubusercontent.com/sleepingarhat/tianxi-frontend/main/design-refs/hub/01-home-v2-beta-1125x5100.png) |
| 02 | **我的儀表板** Dashboard | [02-dashboard-v2-beta-1125x4800.png](https://raw.githubusercontent.com/sleepingarhat/tianxi-frontend/main/design-refs/dashboard/02-dashboard-v2-beta-1125x4800.png) |
| 03 | **選馬神器** Predictor (王牌) | [03-predictor-v2-beta-1125x5400.png](https://raw.githubusercontent.com/sleepingarhat/tianxi-frontend/main/design-refs/predictor/03-predictor-v2-beta-1125x5400.png) |
| 04 | **賽馬日程** Schedule | [04-schedule-v2-beta-1125x4500.png](https://raw.githubusercontent.com/sleepingarhat/tianxi-frontend/main/design-refs/schedule/04-schedule-v2-beta-1125x4500.png) |
| 05 | **馬匹百科** Encyclopedia | [05-encyclopedia-v2-beta-1125x4500.png](https://raw.githubusercontent.com/sleepingarhat/tianxi-frontend/main/design-refs/encyclopedia/05-encyclopedia-v2-beta-1125x4500.png) |
| 06 | **馬圈聊天室** Chat | [06-chat-v2-beta-1125x4200.png](https://raw.githubusercontent.com/sleepingarhat/tianxi-frontend/main/design-refs/chat/06-chat-v2-beta-1125x4200.png) |

## 每頁 3 個格式

每個子資料夾裡都有：
- `*-v2-beta.svg` — 向量（Canva 免費版 import 唔到，Pro 限定）
- `*-v2-beta-1125x*.png` — ⭐ **3x 高清 · 推薦用呢個**
- `*-v2-beta-375x*.png` — 1x 預覽（Canva 放大會矇，淨係做 thumbnail 用）

## 設計原則

- **綠啡紅 dark mode**（user 2026-04-24 directive：深色減少長時間研究馬簿對眼睛的疲勞）
- **NO PRICING 至上**（user 2026-04-25 directive：上線時不要定收費，先累積用戶）
- **Beta pill** 顯示於每頁頂：「● Beta 免費 · 全功能開放」
- **分析 / 追蹤 導向**（user 2026-04-24 directive：唔係投注平台）
- **決定權永遠交返俾你**（Hero copy，強調用戶自主）

## 檔案結構

```
design-refs/
├── README.md              ← 你而家睇緊呢份
├── hub/                   ← 主版面 (首頁)
├── dashboard/             ← 我的儀表板
├── predictor/             ← 選馬神器
├── schedule/              ← 賽馬日程
├── encyclopedia/          ← 馬匹百科
├── chat/                  ← 馬圈聊天室
└── scripts/
    └── generate_v2beta_pages.py   ← Python SVG generator for 02-06
```

## 關於 reference 資料

呢啲係**線框 / 描圖底稿** (wireframe / tracing reference)，唔係最終設計。功能係：
1. 俾 design 團隊用作 Figma / Canva layout 參考
2. 定下 dark mode 色、spacing、typography scale
3. 同 frontend dev 對齊 spec（每個 element 嘅位置、size、color）

最終 UI 會用 React / React Native 實作，tokens 存喺 `shared/design-tokens.ts`。
