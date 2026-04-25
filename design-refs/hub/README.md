# Hub (主版面) · Canva 導入用原圖

呢度嘅 PNG 係設計參考圖 · 375 × 1700 px mobile portrait · 可以直接拖入 Canva 做底稿。

## 檔案

| 檔案 | 格式 / 尺寸 | 用途 |
|---|---|---|
| `01-home-v2-beta.svg` | **SVG 向量** · 375 × 1700 logical | ⭐ **Canva import 最清** · 無限放大無失真 |
| `01-home-v2-beta-1125x5100.png` | PNG 3x · 1125 × 5100 px · ~900 KB | 高清 raster · 縮細顯示時字 crisp |
| `01-home-v2-beta-375x1700.png` | PNG 1x · 375 × 1700 px · ~200 KB | 原解析度（放大會矇 · 唔建議做底稿）|

### 點揀？

- **Canva** · 直接 import SVG（右 click Upload 揀 .svg 檔）→ 字完全清
- **Canva import 唔到 SVG** 嘅話 → 用 1125×5100 PNG
- **文件預覽／縮圖** 用場景 → 375×1700 PNG（細檔案快）

## Canva 導入方法

### 方法 A · 直接下載 + 拖入

1. 打開呢三個 raw URL 之一（推薦 SVG）：
   ```
   # SVG 最清 (⭐ 推薦)
   https://raw.githubusercontent.com/sleepingarhat/tianxi-frontend/main/design-refs/hub/01-home-v2-beta.svg

   # 3x 高清 PNG
   https://raw.githubusercontent.com/sleepingarhat/tianxi-frontend/main/design-refs/hub/01-home-v2-beta-1125x5100.png

   # 1x 原圖（細件）
   https://raw.githubusercontent.com/sleepingarhat/tianxi-frontend/main/design-refs/hub/01-home-v2-beta-375x1700.png
   ```
2. 右 click 「儲存影像 / 連結另存」
3. Canva 打開 design → 側邊欄 **Uploads** → **Upload files** → 選剛下載嘅檔
4. 拖入 canvas · 設 transparency **30%** 做描圖底稿

### 方法 B · URL 匯入（Canva Pro 功能）

Canva Pro 用戶可以用 **Uploads → Import from URL** 直接貼上 raw URL。

## 設計規格對應

- Canvas 預設 375 × 1600 px（Canva design title 已設）
- PNG 實際 375 × 1700 px · 底部 100 px 可以 overlap 作 scroll hint
- Dark mode 基底色 `#0B1612`（深夜草地）
- Brand accent：綠 `#3BBF7A` · 啡 `#D4B78A` · 紅 `#E6435A`

## 憲法對齊

- ✅ Beta 免費期 banner + section（取代舊 pricing tiles）
- ✅ CTA「免費開始用」+ 副「唔使信用卡 · 電郵註冊即用」
- ✅ 4 大賣點：靈活因子 / Elo / 數據庫 / 賠率不加權
- ✅ 5 版面 nav card（選馬神器 王牌 flagship）
- ✅ Footer：唔係投注建議 · 不賣命中率
- ❌ 不含：HK$ 金額、「升級」、「睇計劃」、命中率數字

## 下一步

- [ ] 02-06 其他 5 頁同步更新到 v2 Beta 風格
- [ ] 圖層分解版（Canva 導入後可能需要 layer 拆解）
- [ ] SVG source（`tmp/hub-v2.svg` 本地 work-in-progress，稍後整理）
