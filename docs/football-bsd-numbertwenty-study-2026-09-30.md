# BSD 陣容快照 + numbertwenty 方法研究（2026-09-30）

## BSD（sports.bzzoiro.com）
- 接口：`/api/v2/events/{id}/lineups/` → `lineup_status`（predicted／confirmed）、`beta`、主客 `formation`、`confidence`、`players`、`substitutes`（含 `ai_score`）、`unavailable_players`。
- 預測：`/api/v2/predictions/`，`model_version = dc-blend-v1`（Dixon-Coles 混合），出主和客機率、預期入球、最可能比分。算法細節冇公開。
- 管線：雙引擎 T−60 鎖定時寫 `football_lineup_snapshots`（只增不改）；每小時 `football-lineup-settle` 喺完場 2 小時後讀官方正選，寫 `football_lineup_settle`（正選命中人數、陣式啱唔啱）。
- 規則：研究軌，權重 0，唔入正式戰績，唔郁凍結預測／指紋。儲夠一季先跑研究閘。

## numbertwenty.io
- 目的：賽後「應得結果」，賽前預測只係副產品。
- 特徵：全場統計每對拆「差距」＋「調和平均」；特徵早期固定。
- 近鄰：白化 Mahalanobis（FAISS），只用過去場次；相近聯賽池按 Wasserstein 近似選，樣本夠自動淡出。
- 投票：Cauchy 核加權；9 狀態（1X2 × O/U2.5 × BTTS）Dirichlet 貝葉斯校準，令判和比例等於聯賽真實和局率。
- 不確定性：Dirichlet（隨機）＋ Student-t 放大（樣本少／場次特別）。
- 對天喜：校準思路同 dual-v1「除歷史率投票」一致；賽後統計賽前唔可得，唔入凍結預測，只可做研究軌賽後頁。
