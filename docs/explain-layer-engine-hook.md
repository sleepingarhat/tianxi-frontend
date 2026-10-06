# 引擎倉後續（唔係 Lovable 範圍）

喺 `tianxi-backend/scripts/backtest/lgb_walkforward.py` 而家只有：

```python
booster.feature_importance(importance_type="gain")
```

要加真正單場五因子，喺 **同一個已凍結 booster** 上跑 TreeSHAP，寫入新表，唔改 `prediction_log` 排名。

建議表 `explain_log`（append-only）：

- date, race_number, horse_id
- model_version, booster_sha
- shap_top5_json   -- [{feature, shap, abs}]
- gain_global_json -- 可選，每日一份就夠
- created_at

約束：

- 特徵必須係該場 as-of，同 LGB 推論同一行
- 臨場盤繼續唔入
- fail-closed：冇 booster 就唔出 shapTop5，前端顯示規則 reason
- 分層 gain 按 venue × dist_band 存，唔好只存一條全局 bar

FEATURE_COLS 完整名單見 `data/feature-catalog.json`。

唔好喺呢一步引入 MLP / TabNet / horse-id embedding。
