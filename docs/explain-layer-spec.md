# 解釋層規格 · 交 Lovable / 引擎跟進

狀態：第一刀已用公開凍結對帳計好分層數。真正 TreeSHAP 未跑——現有 GitHub Action 只有 `feature_importance(gain)`，booster 檔唔喺呢個沙盒。

## 口徑

單位係場。四揀 = 凍結 `predictedTop4`。命中 = 同實際頭 4 名 `horseId` 重疊隻數。

只中 N = 剛好 N，唔係至少 N。

六環單關 = 四揀包到實際第 1＋第 2。  
複式連贏（頭 3）= 系統頭 3 包到實際 1–2。  
複式位置Q（頭 3）= 系統頭 3 至少 2 隻入實際頭 3。

樣本：hit-rate API，2026-03-27 至 2026-09-16，35 個完整賽日、349 場（4 揀同頭 4 齊）。

## 全窗結果（寫入 UI 預設）

平均只中 2.04 匹。

| | 場 | 比率 |
|---|---:|---:|
| 只中 4 | 11 | 3.2% |
| 只中 3 | 93 | 26.6% |
| 只中 2 | 155 | 44.4% |
| 只中 1 | 78 | 22.4% |
| 只中 0 | 12 | 3.4% |

分層平均重疊：跑馬地 2.18 ＞ 沙田 1.96；跑馬地一哩 2.40 最高；長途樣本 3 場唔好當結論。Oracle 255 場平均 2.05，Elo 後備 94 場 2.01，而家唔好話 ensemble 完勝。

## 檔案

```
lovable-explain/
  LOVABLE_PROMPT.md          ← 貼去 Lovable
  SPEC.md                    ← 呢份
  ENGINE_HOOK.md             ← 之後喺 tianxi-backend 加 SHAP
  data/global-stratified.json
  data/latest-meetings.json  ← 最近 4 個賽日四揀＋賽果
  data/feature-catalog.json  ← LGB FEATURE_COLS 中文對照
  data/api-explain-global.mock.json
```

## 產品規則（同凍結品牌一致）

1. 解釋頁只讀。唔寫 prediction_log。
2. 對外文案停喺「覆蓋／打分」，唔升到「因果」。
3. 今季 36 場單獨一欄，字細過全窗。
4. SHAP 未上線之前，單場原因用凍結 `reason` 字串。
5. 六環全中唔展示為賣點（36 日 0 次）。

## Lovable 收貨清單

- [ ] `/explain` 有免責＋只中 0–4 圖
- [ ] 分層表數字同 JSON 一致
- [ ] `/explain/2026-09-16` 八場四揀同實際頭 4
- [ ] 冇「勝出原因」字眼
- [ ] 預留 shapTop5 空位
