# app · Expo (iOS + Android + mobile web)

**框架**：Expo SDK 52+ / React Native / React 19

**入口**：`app/_layout.tsx`（Expo Router）

## 5 個主要 tab

1. 📊 儀表板 — `app/(tabs)/index.tsx`
2. 🔮 選馬助手 — `app/(tabs)/predictor.tsx`
3. 📅 賽馬日曆 — `app/(tabs)/calendar.tsx`
4. 📖 馬匹百科 — `app/(tabs)/encyclopedia.tsx`
5. 🌐 聊天室 — `app/(tabs)/chat.tsx`

## 設計來源

全部顏色 / 文案 / 定價由 `@tianxi/shared` import，唔准喺 app 內 hard-code。

```ts
import { colors, typography } from "@tianxi/shared/design-tokens";
import { hero, sellingPoints } from "@tianxi/shared/copy";
```

## 狀態

🚧 待 scaffold（下一個 session）

## Expo 起動（之後）

```bash
npm install
npm run start        # QR code for iOS / Android
npm run ios          # simulator
npm run android      # emulator
npm run web          # Expo web build
```
