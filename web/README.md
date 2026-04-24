# web · Next.js 15 (Desktop)

**框架**：Next.js 15 (App Router) / React 19 / TypeScript / Tailwind CSS

**入口**：`web/app/layout.tsx`

## 頁面

- `/` — Landing（Hero + 4 賣點 + 5 功能預覽 + 定價 + 等候名單）
- `/dashboard` — 儀表板
- `/predictor` — 選馬助手（即時 + AI chat SSE）
- `/calendar` — 賽馬日曆
- `/encyclopedia/[horseId]` — 馬匹百科
- `/chat` — 聊天室（Telegram 風格）
- `/pricing` — 定價
- `/waitlist` — 等候名單

## 設計繼承

舊 `tianxi-web` repo（2026-04-20 session ship）內容將會移植入嚟 —
包括 Landing 4 sections（DataGate / AntiPublicBias / Demo / Pricing）。
但要刪除所有「44.4% top-3 hit rate」類命中率 copy。

## 狀態

🚧 待 scaffold（下一個 session）

## 起動（之後）

```bash
# Sandbox 注意：NODE_ENV=production 會略過 devDeps
NODE_ENV=development npm install --legacy-peer-deps --include=dev
NODE_ENV=development npm run dev
```

參考 sandbox-nextjs-notes.md 寫嘅時間估算（冷啟動約 5-10 分鐘首編）。
