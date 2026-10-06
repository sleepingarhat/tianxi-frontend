# 天喜足球特徵字典 feature_dict v0.1

日期：2026-09-13　來源：用戶 2026-09-13 提供之「賽前可用特徵總表」，逐項轉成可落地欄位規格。
原則：**只有開波前已知（as-of kickoff − 凍結點）嘅欄位准入模**。完場才出現嘅射門／控球／評分／本場 xG 一律列入排除區。

## 欄位規格說明

| 欄 | 意思 |
|---|---|
| `column` | 資料庫欄位名（snake_case，silver/gold 層一致） |
| `group` | 對應總表章節 |
| `refresh` | 更新時機：`static`（一次寫入）／`daily`／`round`（每輪）／`T-24h`／`T-1h`／`live` |
| `freeze` | 兩個凍結點快照：`T-24h`（暫定／黃燈）、`T-1h`（鎖定／綠燈）；`both` = 兩版都存 |
| `log` | 是否可寫入 `prediction_log`（進入排名運算）：`yes` / `odds-track`（只入 with_odds 軌）／`no`（只作診斷或展示） |
| `v` | 落地階段 v0／v1／v2 |

---

## 0. 樣本鍵（非特徵，必備）

| column | refresh | 說明 |
|---|---|---|
| `match_id` | static | 內部穩定 ID |
| `kickoff_utc`, `kickoff_local` | daily | 改期以原定／實際兩欄並存 |
| `season`, `round_no` | static | |
| `competition_id`, `stage` | static | 聯賽／小組／淘汰第幾回合 |
| `home_team_id`, `away_team_id` | static | canonical id；別名經 `team_names` 對照 |
| `venue_id`, `is_neutral` | static | |

## 1. 賽事情境（v0，log = yes）

`is_home`（主/客/中立）、`rank_diff`、`points_diff`、`gd_diff`（榜差一律 shift 一輪）、`pts_to_relegation`、`pts_to_europe`、`pts_to_title`、`already_qualified`、`already_eliminated`、`dead_rubber`、`tie_first_leg_agg`、`tie_leg_is_home`、`away_goals_rule`、`intl_break_adjacent`、`natl_callups`、`is_derby`、`rivalry_score`、`comp_intensity`。
refresh：`round`（榜類）／`static`（賽制類）；freeze：both。

## 2. 賽程、休息、負荷（v0，log = yes）

`rest_hours_home` / `_away`、`matches_last_7d/14d/21d`（主客分開）、`midweek_euro_prev`、`back_to_back`、`three_in_eight`、`travel_km`、`tz_shift_hours`、`is_long_trip`、`prev_match_extra_time`、`prev_red_card_carry`。
refresh：daily；freeze：both。

## 3. 歷史賽果滾動（v0，log = yes）

每項出 6 個變體：`_l5`、`_l10`、`_home_l5`、`_away_l5`、`_ema`（時間衰減 λ）、`_vs_tier`（對強／中／弱分檔）。

`wins`/`draws`/`losses`/`win_rate`、`gf_pg`、`ga_pg`、`gd_pg`、`clean_sheet_rate`、`failed_to_score_rate`、`ht_lead_conv`、`ht_deficit_recovery`、`over25_rate`、`btts_rate`、`streak_win_len`、`streak_loss_len`。
refresh：round；freeze：T-24h（賽果不會臨場變）。

## 4. 評分系統（v0，log = yes）

`tx_elo`（總）、`tx_elo_home_split` / `_away_split`、`elo_diff`、`pi_rating_home` / `_away`、`berrar_score`、`glicko_rating` / `_rd`、`dc_attack`（α）、`dc_defence`（β）、`dc_home_gamma`、`dc_rho`、`attack_dyn_post_window`（轉會窗後加快更新旗標）、`uefa_coeff`、`league_strength_coeff`。
refresh：round（逐場迭代，**禁止全歷史重擬合**）；freeze：both。

## 5. 對賽 H2H（v0，log = yes，樣本少自動降權）

`h2h_n`、`h2h_w`/`d`/`l`、`h2h_gf_pg`、`h2h_ga_pg`、`h2h_same_venue_*`、`h2h_same_manager_*`、`h2h_shrink_weight`（= n/(n+k) 收縮權重）。
規則：`h2h_n < 4` 時 shrink_weight 主導，不得作主特徵。

## 6. 傳統比賽統計滾動（v0，log = yes 但低權重）

主客分開、近 5／10：`shots_pg`、`sot_pg`、`sot_rate`、`corners_pg`、`fouls_pg`、`offsides_pg`、`yellows_pg`、`reds_pg`、`possession_pg`、`pass_acc_pg`、`saves_pg`。
註：控球與射門次數誤導性高，特徵重要度需低於 xG 層；若 gain 排名壓過 xG 層要視為警號。

## 7. 進階隊級 xG（v1，log = yes，預測黃金層）

`xg_pg`、`xga_pg`、`xgd_pg`、`xpts_pg`、`npxg_pg`、`npxga_pg`、`npxgd_pg`、`xg_per_shot`、`np_goals_minus_npxg`（終結運氣，均值迴歸用）、`xg_when_leading`／`_level`／`_trailing`、`ppda`、`ppda_against`、`field_tilt`、`progressive_carries_pg`、`box_touches_pg`、`setpiece_xg_pg`、`openplay_xg_pg`、`xt_pg`、`pass_value_pg`。
refresh：round；freeze：T-24h。滾動一律 `shift(1)`，嚴禁把本場 xG 算入自己近況。

## 8. 陣容、傷停、輪換（v1，log = yes，但需 uncertainty 同行）

`xi_source`（`official` / `predicted`）、`xi_strength`、`bench_strength_top5`、`availability_ratio`、`minutes_uncertainty`、`missing_count`、`missing_key_gk`、`missing_key_cb`、`missing_key_cm`、`missing_key_fw`、`ilw`（傷兵戰力損失＝身價佔比 × 近況上場比例）、`squad_value_total`、`squad_value_loss_ratio`、`suspensions`、`late_intl_returns`、`unregistered_signings`、`rotation_index`（與上場首發重疊率）、`gk_changed`。
refresh：T-24h 用預測陣容（黃燈）、T-1h 用官方陣容（綠燈）；freeze：both。
**回測只准用賽前時間戳版本**，用賽後名單即洩漏。

## 9. 球員級聚合（v1／tracking 部分 v2）

`key_fwd_xg_l5`、`key_fwd_xa_l5`、`key_fwd_npxg_l5`、`minutes_played_l5`、`consecutive_starts`、`player_rating_l5`、`return_from_injury_games`、`xi_minutes_weighted_strength`、`team_dependency_top_scorer_share`。
v2（需 tracking）：`sprints_pg`、`hi_distance_pg`、`accelerations_pg` → 合成 `tfi`（疲勞指數）。
球員 ELO 按位置分軌、按上場分鐘加權更新，只作球隊層修正特徵，不作終端。

## 10. 戰術／陣型（v1）

`formation_home` / `_away`（one-hot 或 embedding）、`formation_matchup_id`（對位克制）、`def_line_height`、`def_width`、`style_possession_vs_counter`、`games_since_new_manager`、`style_delta_new_manager`。
embedding 只准用截至當時資料訓練（禁用含未來賽季全資料）。

## 11. 教練、球會離場因素（v1，部分 log = no）

`manager_tenure_days`、`manager_ppg_since`、`manager_league_win_rate`、`manager_vs_opponent_win_rate`、`window_net_spend`、`key_departures`、`wage_bill_rank`（少用）、`news_sentiment`（NLP，噪聲大 → log = no，只作展示）。

## 12. 裁判、場地、環境（v0 天氣可即刻做）

`referee_id`、`ref_yellows_pg`、`ref_reds_pg`、`ref_pens_pg`、`ref_home_bias`、`pitch_surface`、`pitch_length_m`、`pitch_width_m`、`attendance`、`attendance_pct`、`is_behind_closed_doors`、`temp_c`、`rain_mm`、`wind_kph`、`extreme_weather_flag`、`kickoff_slot`（午／黃昏／夜）、`first_home_after_travel`。
天氣用 Open-Meteo 歷史逐小時（1940 起）→ **足球天氣特徵唔需要等一季，可即刻回測**，與賽馬不同。

## 13. 市場／賠率（分兩軌，log = odds-track）

**硬規則：`market_beta = 0`，賠率永不進入 `no_odds` 主軌排名。** 以下欄位只入 `with_odds` 對照軌、gate 基準與殘差診斷。

`odds_open_h/d/a`、`odds_close_h/d/a`、`odds_t2h_h/d/a`、`p_impl_h/d/a`（去水後）、`overround`、`ah_line`、`ah_price_h/a`、`ou_line`、`ou_price_o/u`、`corner_line`、`drift_open_close`（走水 Δ）、`bookmaker_dispersion`、`pinnacle_flag`、`exchange_flag`、`hkjc_had`、`hkjc_hha`、`hkjc_hdc`、`hkjc_hil`、`hkjc_crs`、`betfair_matched`、`betfair_hot_cold`、`inplay_*`（只入即場模型，賽前凍結不含）。
評估規則：要打市場，**訓練不可用終盤再同終盤比**；一律同一凍結點（T-24h 或 T-2h）對照。

## 14. 衍生交互（v0 起，log = yes）

`elo_diff_x_home`、`xgd_diff`（`xgd_home − xgd_away`）、`fatigue_diff`、`ilw_diff`、`rest_days_diff`、`atk_x_def_home`（主 α × 客 β → λ_home）、`atk_x_def_away`（→ λ_away）、`ou_line_minus_model_lambda_sum`（市場與模型分歧，log = odds-track）、`rank_diff_minus_elo_diff`（表榜滯後）。

## 15. 標籤／輸出（不可當特徵）

`y_1x2`（主／和／客）、`lambda_home`、`lambda_away` → 比分矩陣 → `y_over_under`、`y_btts`、`y_ah_result`、`y_correct_score`、`scoreline_distance`。
主指標 RPS；輔助類別平均 Brier、log-loss、逐類別 ECE。

## 16. 刻意排除（洩漏或無效，永不採用）

- 本場完場 shots／possession／player rating／本場 xG
- 當季最終排名倒推季初場次
- 賽後確認版傷停、凍結點後才公布的首發
- 隨機 K-fold 驗證（必用時序 forward chaining）
- 二分類「勝／不勝」當主任務（和局基準率約 23–25%，會誤導）
- 全資料集（含測試期）算標準化均值／標準差
- Elo 全歷史重擬合

以上全部在 `/football/features` 頁列為「永不採用」並附原因，與賽馬特徵選取頁同一玩法。

---

## 落地優先

**v0（純 CSV 就做得到）**：§0 樣本鍵、§1 情境、§2 賽程休息、§3 歷史滾動、§4 Elo／泊松攻防、§5 H2H、§6 傳統統計、§12 天氣場地、§13 開盤去水 1X2＋讓球／大小球線（對照軌）、§14 基本交互。

**v1**：§7 xG／npxG／xGD、§8 傷停陣容＋身價、§9 球員級聚合、§10 陣型、§11 教練、歐戰週中標記、初終盤走水、馬會 overlay。

**v2 研究**：事件座標、PPDA 細層、球員分鐘疲勞 TFI、tracking、新聞 NLP。

## 加特徵流程（硬規矩）

1. 先凍結 v0 欄位，跑出基準 RPS／Brier／ECE 與對開盤 CLV。
2. 每次只加**一組**特徵，時序 forward chaining 驗證，逐賽季報指標波動。
3. 三項任一未升即不上線：RPS 未顯著改善、逐季波動放大、ECE 惡化。
4. 通過者寫入 `prediction_log`，並在 `/football/features` 標「已採用」及權重；未通過標「未採用」並保留回測數字。
