# 天喜系統藍圖（2026-10-07 更新版）

本文件係藍圖現行版本，取代舊藍圖中與下列內容衝突嘅部分。凡改藍圖，須同步更新本文件、腦圖、roadmap.md、AGENTS.md、開發者日誌同 GitHub 源碼。

## 一、三端架構

```text
天喜
├── 前端（tianxi.racing，Lovable 發布，源碼鏡像 tianxi-frontend）
│   ├── 首頁：三產品儀表板（儀表板／賽馬／足球／六合彩）
│   ├── 賽馬：選馬、排位、賽果、預測與賽果、策略盈虧、公開戰績、回測、健康
│   ├── 足球：總覽、賽程、雙引擎戰績、逐場入球對照、因子特徵、研究
│   └── 六合彩：命盤取號、預測 vs 攪珠結果
├── 後端
│   ├── 賽馬：tianxi-racing（Cloudflare Worker + D1 + GitHub Actions）
│   ├── 足球：網站伺服器路由 + tianxi-football 倉定時任務
│   └── 六合彩：tianxi-marksix 倉每晚收料
└── 監控端（/admin，管理員專用）
    ├── 系統總覽 /admin/overview
    ├── 引擎健康 /admin/engine-health
    ├── 資料新鮮度 /admin/data-freshness
    ├── 預測鎖定 /admin/prediction-lock
    ├── 模型版本 /admin/model-versions
    ├── 盈虧 /admin/pnl
    ├── 會員 /admin/users-membership（待接 Whop）
    ├── 日誌 /admin/logs
    ├── 設定 /admin/settings
    └── 運維工具 /admin/console（舊監控台）
```

## 二、運行流程

```text
賽馬：排位表收料 → 預測 → 首場前 90 分鐘鎖全日（prediction_log 存全場排序，只增不改）
      → 賽果／派彩收料 → join 名次 → 命中率、盈虧、孖T／三T（第 5 選讀凍結排序）
足球：fixtures → 雙引擎 dual-v2 → 開賽前 6 小時逐場鎖定（無賠率照鎖，標「無賠率」）
      → 完場收賽果 → 命中率／盈虧（現行 $100 注）→ 鏡像入倉
六合彩：攪珠 → 22:30／23:00／23:30 收料 → 派彩 → 預測 vs 攪珠結果
監控：各接口 → 監控端九頁 → Telegram 告警（12 小時去重）
```

## 三、監控端設計規範

- 架構參考 satnaing/shadcn-admin：側欄、頂欄、⌘K 全局搜尋、手機抽屜選單。
- 表格：TanStack Table（排序、搜尋、分頁，窄畫面橫向捲動）。
- 圖表：ECharts。
- 視覺：TianXi x Linear 深色精密風——畫布 #0B1612、面板 #0F1A16／#16231F、hairline 金邊 rgba(212,161,30,0.18)、金 #D4A11E、成功 #00843D、失敗 #C8102E；卡角 12px、按鈕 6px、膠囊 9999px。金色只用於重點、選中、重要數字；綠紅只表示成功失敗。
- 動效：數字 count up、正常狀態 soft pulse、表格行 hover、更新掣轉圈；尊重 reduced-motion。
- 只讀原則：監控端唔改凍結資料、模型、賠率權重（永遠 0）；研究同生產分離。

## 四、break-ui 驗收

- 開發環境底部置中「真實／Demo data／Worst case」切換器，正式站不出現。
- Worst case 數據：超長德文隊名、超長聯賽名、無賠率、0-0／10-0／無比分、延期腰斬、浮點尾數、超長指紋、1,200 行、從未運行／失敗任務。
- 2026-10-07 驗收：九頁桌面 1280px 同 320px 最壞數據，冇橫向溢出、冇 NaN／undefined／Invalid Date、冇程式錯誤。
- 報告格式：Broken／Ugly／Fragile＋待決問題＋扛得住嘅地方；先報告後修。

## 五、待辦

- 會員頁接 Whop（等 API key）。
- logloss／ECE 逐季輸出（後端未提供）。
