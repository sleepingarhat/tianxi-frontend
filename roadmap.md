# tianxi-web roadmap
## 剩餘待辦總覽（2026-10-08 逐項去重後）
**等用戶／外部供應**：Whop 會員（等 API key／帳戶資料）、宣傳片／海報／App Store 介紹圖（用戶暫停）、知乎／Reddit 正文（等用戶貼）、Google 分享連結內容、研究員 AI 問答摘要拍板。
**等資料累積**：BSD 快照儲夠一季 → 預測缺陣主力研究閘；closeGap ≥200 場；近盤 ≥200 場重量；GOAL 快照 1–3 個月 → 價值注重跑；天氣特徵一季；足球綠燈完場樣本 → 結算驗收＋對外對照表；第二層 −1 校準重量。
**等賽馬日／等開放**：lock-tick 第二次實測；馬會足智彩賠率接口；次級聯賽補徽；API-Football ToS；TheSports 15 日試用。
**可即做（研究閘先報告、用戶拍板先升級）**：賽馬四揀追市場熱門 2.31；F-R2 入 S5 全閘；S23 刀4 主客分拆生產移植；正式和局全閘；足球用馬會有盤場次實測對比調整雙引擎（本輪新增）；引擎軌 A/B 拆分；β 全窗口回測；新馬血統回測；α 自動歸零處理；儀表板提速；upcoming.json watchdog；採集器韌性四件；T−24h 提醒；card_delta；ADMIN_TOKEN 輪換。


## 進行中
- [x] 2026-10-08 賽馬對照：移除檔位、完整馬名及清晰跑法、小型賠率；只列所選場次命中派彩。策略逐個彩池加入孖T／三T命中口數、總成本、派彩及累計盈虧，輸注成本保留；真資料核對孖T 1/9口、三T 0/2口，106口舊資料缺第五選未納入，明確標示不完整歷史範圍。
- [x] 2026-10-07 按原始產品化藍圖及新增修改要求核對完成度；完成報告 docs/blueprint/completion-audit-2026-10-07.md，明確分清未做、部分完成、待證據及新決定取代項。
- [x] 藍圖補齊：互動UI／流程腦圖、盈虧日期／策略篩選與跨場累計、馬會有盤嚴格限定、完整逐季評核、持久日誌、設定及逐頁壓測 — 2026-10-08 完成（見 2026-10-06/07 條目）
- [x] GitHub五倉產品說明更新＋歷史 roadmap 重複項目清理 — 2026-10-08 完成
- [x] 2026-10-08 路線圖逐項去重＋剩餘待辦總覽（見頂部）。
- [x] 2026-10-08 足球：用馬會有盤場次跑預測 vs 實測賽果對比 — 57 場結算：雙引擎 56.1% vs 市場熱門 61.4%，但平注 +$109.8 vs +$79.4（和局揀選 31.2% 命中係價值來源）；P_D 平均高估 6.7 點判為抽樣偏差，模型暫不調整；候選調整（B 引擎混合 50/50→60/40）等樣本 ≥200 場再重量。報告 docs/football-ledger-review-2026-10-08.md。
- [ ] 足球雙引擎 P_D 混合比重重量：等鎖定帳累積 ≥200 場已結算場次，過研究閘由用戶拍板先開 dual-v3。
- [x] 2026-10-07 監控端模型說明取消截斷、手機改直列完整版本資訊；盈虧頁補孖T／三T賽日選擇及二拖三成本、正獎／安慰獎核對，與四揀累計分開。
- [x] 2026-10-07 足球「逐場入球對照」頁：揀場次睇雙引擎預期入球 vs 實際、平均入球基準、主和客命中 vs 隨機；回測頁加「目標超過市場熱門」對比卡
- [x] 2026-10-07 監控端引擎健康頁加足球實戰 logloss／Brier／ECE＋校準曲線（按版本獨立計）；賽馬只鎖排名，無機率指標
- [x] 2026-10-07 核實賽馬預測／孖T三T／派彩表已讀真馬會數據（10-07 跑馬地 9 場排位、派彩 CSV 已出）
- [ ] 賽馬四揀平均中匹數超過市場熱門 2.31（現 1.99，未達標；凍結四揀唔改）：手段＝特徵消融＋alpha 校準＋引擎調參，研究閘先報告、用戶拍板先改
- [x] 2026-10-06 Telegram 告警：Bot @tianxienginebot 已連接（connector）；告警模組涵蓋數據庫健康、賽果同步（收料 workflow 失敗）、雙引擎狀態（T−6h 未鎖／快照失敗）；已接通，測試訊息發送成功
- [x] 2026-09-30 足球賽程卡排版修正：時間同隊徽重疊，改為頂行聯賽＋時間、隊名隊徽置中、底線機率條＋預測章；手機 420px 核對無溢出。純展示，不改預測及凍結。
- [x] 2026-09-30 賽馬首選欄位整理：綵衣靠左，馬號馬名齊線；勝算獨立排列，騎師獨立一行防止突出。足球近期賽程補聯賽及雙隊徽，對改 vs；對帳隊名補中文。純展示，不改預測及凍結。
- [x] 2026-09-30 足球逐場預測：今批英足協全國聯賽 24 隊補齊繁體中文／港式對照，英文只保留作內部資料配對，不再直接展示
- [x] 2026-09-30 賽馬展示細修：儀表板／排位／預測卡綵衣放大並平衡馬號、馬名比例；滾動表現柱圖與走勢圖加入數據網格、描線、掃描光及最新點動效，支援減少動態效果；數據及規則不變
- [x] 2026-09-29 GitHub 倉庫用途統一：九個天喜賽馬／足球／六合彩／官方網站公開倉庫保留穩定網址，公開介紹改為清晰中文，逐一交代數據庫、引擎、研究及後端用途
- [x] 2026-09-29 三產品視覺修正：App／頁頂 logo 統一翠綠底；賽馬、足球、六合彩產品頁標題統一為「天喜…引擎」；首頁編號加金框、主要入口改高對比金色按鈕，純展示改動
- [x] 2026-09-29 首頁三產品總儀表板：賽馬／足球／六合彩各自展示儀表板入口、可展開技術流程與公式、公開數據庫／引擎 GitHub、兩個核心操作及功能分支；底部導航收斂為儀表板／賽馬／足球／六合彩四項，純展示改動
- [x] 2026-09-29 全站 UI／UX 產品化：中央決策核心設計語言已延伸至全站（其後用戶否決，已還原舊版紙墨金；品牌深色轉翠綠 oklch(0.405 0.089 160.2)，頂欄／底部導航／深色區塊生效，桌面同手機巡查通過，功能、凍結數值、版本指紋、模型、API、鎖定與計分規則不變）
- [x] 2026-09-29 首頁產品化設計：選定「中央決策核心」，競技亮橙、Libre Baskerville＋IBM Plex Sans、bento-grid；三套產品首屏＋可點技術腦圖已落地，既有賽馬資料保留下移
- [ ] 2026-09-29 全站及公開倉庫內容深度核對：逐項核實文字、公式、流程、架構同現行版本一致；首頁改版完成後獨立執行
- [x] 2026-09-29 和局機率門檻：四季季外代理機率 ≥28% 1,583 場中 31.2%，≥30% 70 場中 32.9%；事後選門檻，需未見新季度驗證，唔改凍結預測
- [x] 2026-09-29 足球研究回測頁：可調強弱／場地／近期戰績權重、傷兵缺資料停用；2024/25 逐場賽果同詳情；足球頂欄 BBC 自動消息；價值注原始 ROI −16.43% 如實顯示
- [x] 2026-09-29 足球手機版：溢出單行文字往返捲動／選項對比／卡框對齊；撤下 +1 主客推薦展示，凍結帳與三格不動
- [x] 2026-09-29 和局深度獨立研究：五大聯賽 11 季來源、後四季共 7,156 場逐季樣本外；加接近度／低入球／Poisson 對角質量 RPS 0.20085，Bet365 全選 edge≥5 點 −11.44%（3,054 注、四季全負），只買和 −0.38%（190 注），唔轉正；報告 docs/football-draw-five-league-study-2026-09-29.md，唔改生產
- [ ] 正式和局全閘：待研究倉原始 S5 凍結逐場比分矩陣與有時間戳可買賠率，做五大逐季 RPS／格 log-loss／ECE／副閘／ROI；未過唔升指紋、唔開收費
- [x] 2026-09-29 新標誌統一：頁頂舊彩色「喜」字改用墨底金色馬／足球／「6」波定稿；分頁及手機主畫面圖示更新快取識別，開發日誌同步公開
- [x] 2026-09-28 選馬頁 H-E1 接線完成：「本場一句」晶片（HorseExplainChip）貼喺「點解揀佢」卡上面，只讀本場四揀同獨贏／位置機率填空，唔改排名、唔用 TreeSHAP；closeGap 仍為 null，頭馬接近章唔出；未鎖場標「初版 · 未鎖」
- [x] 2026-09-28 lock-tick：鎖點後、首場開跑前若全日快照未齊，補寫一次缺場（已鎖場次永不覆寫、已過賽日唔補）；9-27 第 2–11 場列「鎖後、唔計分」（後端 9e085d34、7c723ab1）。下個賽日實測待驗
- [ ] 賽馬 closeGap 分位校準：只用開賽前／鎖點快照，現得 18 場（需 ≥200 先寫死），維持 null、「頭馬接近」章唔出
- [x] H-R2 凍結 p vs 扣水 q 診斷：18 場鎖點快照，模型獨贏 logloss 2.281 vs 市場 1.979；高機率段過度自信；獨贏只旁註、四揀指紋唔改（後端 75870898）
- [x] 2026-09-28 PitchAPI xG 駁接回測（研究倉 59e3c78）：RPS 0.1996 無落差；只買和 thr5 +3.85%→+2.83%，未過商業閘，唔升指紋
- [x] 2026-09-28 南蒂羅爾隊徽補上，次級聯賽 191 隊全部真徽
- [ ] F-R2 入 S5 集成：評分軌過、未移植；要 ens_s5.py 全閘先講升指紋
- [x] 隊徽次級聯賽後備：西乙／英甲／英乙／德乙／意乙／法乙 2024–26 季 191 隊補 190 隊（南蒂羅爾庫入面冇，用派生識別標）
- [x] 2026-09-27 足球隊徽補齊：122 隊歷史降班隊（五大聯賽）隊徽由 football-logos.cc 縮至 256px 入 public/crests/，footballCrestsStatic.ts 做 API 對唔到名時嘅靜態後備，再對唔到先退派生盾形標；次級聯賽（西乙／英甲／英乙／德乙／意乙／法乙）由 API-Football 覆蓋
- [x] 2026-09-27 賽馬賽日後核對：9-27 沙田 11 場賽果入帳、命中率對帳完成（四揀平均 2.0／4、首選 27.3%、頭三有份 81.8%）；Stage 7 鎖點 bundle 驗證修正（numpy 訓練 booster 寫通用 Column_N 名，改為只核數量，tianxi-backend commit 246586c1）；賽馬 SHAP 第二刀過閘——鎖點 booster lgb-ensemble-20260926（指紋 8da20f27a75575a1e5c985b3）跑 TreeSHAP 出 reports/shap/latest.json（status=ok、52 特徵、4,000 行，commit 717e2fe）；產品 overlay 閘未過，前台紅綠唔上。凍結完整性：9-27 只有第 1 場有開賽前快照，第 2–11 場唔補寫、唔入凍結戰績
- [x] 2026-09-19 停賽守門：因董建華離世，今日賽事停賽；首頁／選馬／逐場卡／日程顯示停賽通告，前端停止今日預測查詢，避免 9 月 16 日舊資料冒充今日賽事；今日不生成、不鎖定、不入凍結對帳及開季戰績，模型線不變
- [x] S31 鎖點改追已批規格（T−1.5h）：新增 src/lib/lock-window.ts，鎖點時間＝fixture 首場 post_time − 90 分鐘（唔再等賽果入庫）；writePredictionLog／writeRaceDayReportCache 改用 predictionWritesAreFrozen（未到鎖點可刷新＝初版；到鎖點有快照即拒寫；到鎖點未有快照准寫一次）；讀取側 dateIsLocked 由鎖點一刻起讀凍結快照（today-picks／top-picks／picks-by-date／explain）；wrangler 加 */5 輕量 lock tick（heavy job 留原時段）＋ GET /api/analyze/lock-state、POST /admin/api/lock-tick；健康頁 LOCK_POLICY aligned=true、public_freeze 翻 PASS；主站加 /api/public/lock-state 代理，選馬頁初版章寫出實際鎖定時間。鎖後只准 join 名次，唔再寫預測欄；算法線同指紋一分不動
- [x] S32 凍結對帳表（先量、唔改模型）：後端 src/lib/freeze-ledger.ts ＋ GET /api/analyze/freeze-ledger，只讀已鎖 prediction_log（禁回測、禁 live 重算）；主尺＝四揀入圍數／頭四覆蓋／平均相交（賽日＋開季累積，Top3 旁註），副尺＝位置命中（位置格數按出賽匹數 ≥7 為 3、否則 2），旁註＝獨贏頭馬、市場大熱、模型 vs 扣水隱含獨贏 logloss、平注模擬 EV（只量市場硬度，永不回寫模型／指紋／健康頁）；主站加 /api/public/freeze-ledger 代理同 /freeze-ledger 頁（開季累積 → 逐賽日 → 逐場明細）；樣本先 9-6／9-9／9-13，9-16 鎖完完場後自動加行；場數少出表唔下結論
- [ ] S33 card_delta（鎖後變更 overlay）：換騎／蹄鐵／後備上陣只微調已鎖分數，永不入 LGB、永不改凍結欄；缺資料＝0、紅燈可睇唔入戰績
- [x] S35 開季收口三項（純展示層）：(1) 鎖同字統一——prediction-status.ts 加 DAY_LOCK_MINUTES_BEFORE_FIRST_POST=90／meetingLockMinutes()，全站只講「首場開跑前 90 分鐘一次鎖全日」，版本字只得「初版 · 未鎖」／「最終版 · 已鎖」一套，卡面唔再出現 18:40／開跑前 30 分鐘；(2) 少仗紅燈——SCARCE_START_THRESHOLD=2，四揀有第一／二次出賽即紅燈＋「少仗 N 匹」章，reason 寫明改用 ELO＋試閘／血統、唔用 min_data_in_leaf=80 葉、唔入戰績，出賽次數由 getHorseStarts server fn 批量讀 totalStarts（缺＝0，唔靠估），引擎監控加鎖點口徑／少仗紅燈兩行；(3) 首屏加獨立「本季開季窗」行（2026/27 起，按場數加權四揀平均），同近 90 日歷史窗分開標。模型線一分未動
- [ ] S34 少仗紅燈規則寫入健康頁（後端）：新馬／試閘場次標紅燈（α=0.88、96 匹有分只證明「有分」，唔證明新馬唔係亂估）；少仗退 Elo＋試閘／血統先驗
- [x] S30 賽馬引擎健康稽核修正：掛上 /api/analyze/engine-health（JSON／HTML）＋ /engine/health.json ＋ /admin/engine-health ＋ 主站代理 /api/public/engine-health；健康 payload 改 buildEngineHealth(db) 即時讀季節同最近凍結賽日（live 曲線／diagnostics 兩項 WATCH 自動翻）；鎖點規格（T−1.5h）同落地（第一場賽果入庫）未對齊已寫明，public_freeze 降 WATCH；today-picks 加 frozen／edition，選馬頁加「初版／最終版」章；SANITY 馬匹池路徑改 horses/profiles/horse_profiles.csv；工程債待辦：analyze.ts／admin.ts 拆檔、盤 prune 保留歷史 live snapshot
- [x] 全站頁面大標題加入聚光掃光；品牌「天喜 TIANXI」同步聚光，「ENTERTAINMENT」使用紙墨金金箔流光，並支援減少動態效果
- [x] 排位表手機版重整：統一所有馬匹號碼尺寸，取消厚重黑底；固定馬名／檔位欄邊界避免重疊，並參考香港賽馬會官方排位表重整資料層級與密度
- [ ] 會員／收費權限：建立付費會員方案；只有已驗證付費權限可見會員預測與獨家分數。「更高權重」候選必須先完成 walk-forward 回測並通過四揀主指標閘門，未通過前不可宣稱較準或套入生產
- [ ] 賽前預測通知：每個賽馬日首場前 24 小時提醒管理員當日各場四揀馬匹；避免重複通知，並在「預測與賽果」顯示當日凍結預測分數
- [x] 3 個 UI 設計方向已完成揀選；用戶選定放大版「中央決策核心」，競技亮橙產品語言已由首頁延伸至全站
- [x] 載入動效／骨架屏：共用 Loading 加骨架行＋全站換頁骨架
- [x] 2026-09-29 足球四倉（football-database／research／engine／backend）轉公開；全站同倉庫介面清理：引擎頁資料源卡改「核對軌」、開發日誌舊條目改寫、README 移除不採用清單，全站唔再列棄用技術介紹
- [x] 設計 app icon／品牌 logo：墨底金「喜」＋馬／足球／六合彩球，已做 favicon；「6」波改為金色（金環＋立體球形）同馬／足球統一（2026-09-29 定稿）
- [x] 六合彩頁手機載入穩定性：lunar-javascript 改自存同源（public/marksix/lunar.js，除去第三方 CDN 單點）、`/api/public/marksix-data?file=history` 代理只回 date/draw/numbers/special（1MB → 269KB）、site-app.js 資料請求加 15 秒逾時＋重試一次、逾時提示改為頂部細橫幅唔再全頁遮蓋

## 機率品質四步（研究文章落地）
- [x] 一、評估指標：`/api/analyze/prediction-accuracy`（Brier、log-loss、Brier 技巧分、ECE、校準斜率、9 段可靠度分箱）＋ `/engine/monitor` 顯示「機率品質」與可靠度圖
- [x] 二、機率校準：三甲機率 Platt scaling（a=0.5796、b=-0.414）已上線並套用；`/api/analyze/calibration`（公開讀取／管理員 fit=1&apply=1），時間切分 70% 擬合、30% 驗證：Brier 0.17914→0.17367、Log-loss 0.53694→0.52327；嚴格單調，唔改排序；`/engine/monitor` 加「機率校準 · 三甲」卡
- [x] 三、逐匹解釋（局部貢獻）：選馬頁新增「點解揀佢」面板 —— 同場特徵 z-score × 天喜LGB 特徵重要度權重，逐匹列推高／拉低項（`src/lib/why-picked.ts`、`src/components/tx/WhyPicked.tsx`）
- [x] 四、殘差診斷：`/api/analyze/residuals` ＋ 新頁 `/engine/residuals`（班次／路程／地質／賠率區間／馬場逐組偏差、Brier、四揀中匹、偏差警示）。結果：班次／路程／地質偏差 ≤1pp；賠率區間有系統性偏差——≤3.0 熱門三甲低估 19.1pp、3.1-6.0 低估 11.2pp、>25 大冷高估 4.0pp
- [~] 五之二（不用賠率權重嘅方案）：按賠率區間分段機率校準 —— `/api/analyze/calibration?days=365&fit=1&bands=1`（管理員），五段（≤3.0／3.1-6.0／6.1-12.0／12.1-25.0／>25）逐段擬合 Platt，只調三甲／四甲機率、唔改排名；門檻：每段 ≥200 匹、斜率 0.1-3、驗證集要贏過現行全局曲線。365 日 2,194 匹結果：≤3.0 樣本不足（95）、>25 擬合失敗、3.1-6.0 與 6.1-12.0 斜率失控，只有 12.1-25.0 合格（Brier 0.1338→0.1305）。生產維持全局曲線，分段未啟用（代碼已上線，`bands` 欄位預設空）
- [x] 五之三：非賠率特徵解釋「熱門真係強」——新增十項（同班次自身往績 hc_starts/hc_top3、慣常班次水平 class_hist_avg／升降 class_step、騎師／練馬師近 180 日滾動上名率、檔位相對位置 draw_pct 與 draw_x_dist），全部賽前 as-of、零賠率成份。1,730 場／21,323 匹、walk-forward（每 50 場重訓、1,530 場評估）三組 A/B：基準 四揀 1.9850／前三 1.2608／首選 21.37%／三甲任中 85.95%；+十項 1.9889／1.2503／20.52%／84.71%；+十項+Stage14 休賽 1.9582／1.2078／21.11%／84.77%。主指標僅 +0.004（雜訊）而前三與首選下跌 → 閘門不通過，生產特徵未改；代碼已入倉（44ae304f、afd040dc）待樣本累積後重測
- [x] 血統資料缺口已補：新增 `HorsePedigree_Scraper.py`（tianxi-database，自動由排位表／檔案／賽果找出馬匹，只抓血統未齊者，純 requests 免 Chrome）＋ `scripts/pedigree_to_d1_sql.py` ＋ 排程 `capy_pedigree.yml`（一／二／六 21:30 排位表模式抓新馬、三 05:00 全池補抓上限 600，跑完 commit CSV 並推 D1）。已即時執行：`horse_pedigree` 6,068 行、`horses.sire` 由 16 → 6,068，三項血統特徵有真實資料
- [ ] 新馬血統評分回測：用新血統資料測「無往績新馬用血統＋騎練＋首戰班次起步」是否勝過現行班次基準 ELO

- [~] 五、按殘差結果調整：已加入市場賠率先驗（同場 log 市場隱含機率 z-score × β，寫入 `app_settings.market_beta`，生產預設 β=0＝未啟用）＋ admin 回測接口 `/api/analyze/market-tune?days=&betas=&apply=1`（只有四揀平均與前三平均都不跌才會 apply）。45 日小樣本（18 場）：β=0 四揀 1.889／β=0.3 2.000／β=0.5 2.111／β=0.8 2.167，方向與殘差一致但樣本太小；365 日全窗口回測待跑完才決定是否上線


## 待做
- [ ] 驗證 ELO 三軸權重 0.7/0.2/0.1 是否最佳（grid search 回測）
- [ ] 驗證因子傾斜只用檔位＋負磅是否最佳；評估加入班次適配、賽道/going 適配、步速走位、休賽日數等場次因子
- [x] 檔位效應分層擴展 v3（場地狀況／出賽匹數／班次，共 4 層加權合成）：365 日 883 場 A/B — v1 2.009、v2 2.024、v3 2.020 四揀平均，差距屬雜訊，生產維持 v1（v3 代碼已部署但未套用）
- [x] 內部監控台搬入新站 `/admin`（Lovable Cloud 登入 + admin 角色守門；伺服器端代理 Worker `/admin/api/*`，含讀取與寫入操作）
- [x] 註冊帳戶後為該帳戶授予 admin 角色（user_roles）
- [x] 後端 tianxi-backend 倉庫同步：透過 GitHub 整合提交檔位 v3 代碼（commit c0c3949），倉庫與線上 Worker 一致
- [ ] Worker 端輪換 ADMIN_TOKEN（曾在對話中出現）

## 資料修補（見 AUDIT.md）
- [x] 2026-09-09 跑馬地賽果補回（採集程式瀏覽器逾時失敗）：8 場賽果＋官方派彩已入庫，戰績彙總與策略盈虧已重算；capy_race_daily 工作流加入 3 次自動重試
- [x] horse_form_records 回填 race_id（未配對由 102,566 降到 1,417）
- [x] 補 2020 年 190 場缺失賽果
- [x] 分段時間歷史回填（馬匹分段 220 → 8,685 場；大勢分段 0 → 8,685 場）
- [x] 補回 2017-06 完全缺失嘅 8 個賽馬日（72 場）
- [x] 12 個從未抓取賽馬日已抓回並入庫；往績未配對由 1,417 降到 68（46 條為從化境外賽、22 條為退出馬，屬無對應）
- [x] 新季開鑼：修好 tianxi-database 的 backend PAT，排位已入庫（2026-09-06 沙田 10 場 120 匹），/api/season 轉 in_season，賠率抓取閘門已解除
- [x] 資料修補後重跑 LGB 訓練/回測（2024-09-01→2026-07-15）：top1 21.3% / top2 58.1% / top3 85.9% / top4 97.2%；Elo top1 16.8%、市場 top1 31.3%
- [ ] 特徵排序表升級：由等權平均改為學習權重（用 LGB 特徵重要度／回歸擬合），並加入班次、賽事質素、樣本量收縮


- [x] 新特徵「特徵排序表」`/features`（真實 D1 資料，十項特徵 + 自選綜合排序）
  - [x] 同場對賽勝次（例：1號贏過同場馬匹共 7 次）
  - [x] 最佳同程統計（馬 x 程）冠/亞/季
  - [x] 最佳檔位統計（馬 x 檔，同賽道同路程近季，W% / P%）
  - [x] 同程最快時間（總時 / 相隔日子）
  - [x] 同程最快末段（末段時間 / 總時間）
  - [x] 最強騎練合作（騎 x 練，W% / P%）
  - [x] 綜合排序總覽（看某匹馬是否全項名列前茅）

## UI 資訊密度升級（參考 beam / boardui）
- [x] 全站大標題聚光及品牌「ENTERTAINMENT」金箔流光：強制文字裁切生效並提高金色掃光反差
- [x] 儀表板：主指標流光卡、圓環、狀態籌碼、兩欄資料格、賽日時間軸
- [x] 選馬神器 predictor：雙欄改為「天喜預測／市場穩陣」，統一馬號、馬名、檔位、三甲、引擎勝算與即時獨贏資料層級；兩欄每匹均顯示每 60 秒更新的獨贏賠率
- [x] 預測與賽果 prediction-vs-result：新增「賽日總覽」（四揀／三甲平均動態條、三重彩／四重彩／三甲任中場數、逐場 n/4 命中導覽條可直接跳場）＋逐場彩池命中膠囊＋α 健康卡
- [x] 策略盈虧 strategy-pnl（逐日紀錄改為最新日期置頂）


## 引擎集成權重
- [x] ensemble_alpha 已由 0 修正為 0.85（14 個賽日 143 場回測：四揀平均中匹 1.895→2.126），2026-09-08 套用並 fresh 重算
- [x] 前端顯示集成 α 與「LGB 是否真正影響排名」提示：新增 `AlphaGuard`（綠／黃／紅三級，α<0.5 判警示並提示查緊急覆寫；存檔版 α 與現行設定不同只作留意），已接入儀表板集成模型卡同預測與賽果頁
- [x] 查明原因：2026-05-27 /api/set-alpha 緊急覆寫（LGB degraded）未回復，影響 2026-05-27 之後所有賽日（含 09-06 開鑼日）
- [x] 引擎流程每步加上數學公式／方程式

## UI 動態化（2026-09-08 要求）
- [x] 鎖定（綠燈）時「天喜預測 / 市場穩陣」兩框變彩色框
- [x] 鎖定時上述三個外框加入流光閃爍（綠色／金色旋轉光束）
- [x] 集成模型三個圓圈改為動態填充進度條
- [x] 全站進度條加入動態填充動畫

## ELO 三軸權重掃描（α=0.85 固定，120 日 19 賽日 192 場）
- [x] 後端加入可調權重 + /api/analyze/elo-tune
- [x] 365 日全季掃描（865 場、12 組）：0.70/0.20/0.10 = 2.013 四揀平均，與最佳 0.65/0.25/0.10（2.014）差異在雜訊內 → 決定保留現行權重，不改
- [x] 紅／黃／綠狀態燈慢速呼吸閃爍（狀態卡 + 狀態籌碼）
- [x] 滾動表現柱形圖柱子出界（已限寬 overflow-hidden）

- [x] ELO 三軸權重定案：365 日重測推翻 120 日結果（0.50/0.35/0.15 反而最低 1.984），維持 0.70/0.20/0.10
- [x] 檔位效應按路程／賽道分層回測：後端加入 v2 檔位模型（場地×賽道 rail×路程分層、期望上位率用每場實際馬匹數、經驗貝葉斯收縮）＋ `/api/analyze/draw-tune` A/B；365 日 865 場結果 v1 2.034 vs v2 2.044（四揀平均），前三 1.298 vs 1.284，差異在雜訊內 → 生產維持 v1，未套用
- [x] 檔位因子倍數（scale）回測參數落地：後端 `computePicksFromEntries` 支援 `drawScaleOverride`，`/api/analyze/draw-tune?scales=` 可一次比較多個倍數（生產默認 ×1，未改設定）
- [ ] α 自動歸零問題：lgb_predict_upcoming gate 失敗（no race_logloss_curve / corr_lgb_elo NaN）會 set-alpha=0，2026-09-09 08:33 HKT 又觸發一次，已手動還原 0.85；待與用戶決定點改（例如閘門失敗時維持現值、或通知而非自動降）


## 馬會即時天氣（2026-09-09）
- [x] 接駁馬會馬場天氣站（風速追蹤器同源 GraphQL），`/api/public/hkjc-weather` 60 秒快取
- [x] 日程頁、選馬頁加入「馬場即時天氣」卡（氣溫／濕度／氣壓／平均風＋陣風／雨量／草地含水量／日照＋跑道 A-D 段風速）
- [x] 未跑賽日「同地質」改用馬會官方即日地質（wt_WeatherMeeting go_ch），冇官方值先退回同場最近賽日實際地質
- [x] 天氣存檔：`weather_snapshots` 表 + `/api/public/weather-archive`，每 5 分鐘一次，但只喺賽馬日首場前 3 小時至尾場後 1 小時之間先真正存檔（其餘時間即時略過，慳成本）
- [x] 天氣紀錄每晚 23:50 HKT 自動同步入 GitHub `tianxi-database/data/weather/YYYY-MM.csv`（`/api/public/weather-sync-github`），賽事資料集中管理
- [x] 每次改動同步更新開發者日誌 `/dev-log`（已補回 2026-09-06 → 09-09 全部條目）
- [ ] 天氣特徵研究：累積約一季後測「風向×跑法（前領/後上）」、「含水量×地質」、「氣溫濕度×路程」；命中率唔跌先入引擎
- [x] 場地圖指南針擺法／方向與官方對齊：羅盤整體逆時針 40° 偏左，NEWS 字母向內收並加入四方刻度及雙層圓框；縮短中央箭嘴，避免遮擋 N／S；下一賽馬日縮圖再向左移；特徵表拉開即時賠率與排序數值間距
- [x] 下一賽馬日資料補齊：天氣改讀馬會即時天氣，首場時間直接讀完整賽事表，移除錯誤「待公佈」

- [ ] 賽馬對帳頁加「引擎軌 A/B 拆分」（2026-09-13 用戶提問）：逐日／逐場次分開列天喜ELO 與天喜LGB 嘅頭馬命中率、四揀平均中匹數，避免單日十場波動被誤讀為某軌更準（現有回測基準：ELO 15.8%／35.9%，LGB 軌 17.7%／38.8%）

## 足球數據預測引擎（2026-09-12 起）
計劃書：`docs/football-engine-plan.md`（英超先跑通 → 五大聯賽；首個目標 1X2；照抄賽馬三倉架構）
- [x] 文獻研究：建模路線比較、gate 基準（RPS 為主指標）、校準方法、洩漏陷阱、walk-forward 設計
- [x] 資料源研究：football-data.co.uk（英超 1993 至今含收盤賠率）＋ Understat/FBref（xG 2014/15 起）＋ api-football（傷停陣容）
- [x] 自動更新設計：bronze/silver/gold 分層、GitHub Actions 每日增量＋每週全量校驗、team_mapping 對齊、資料品質告警、D1＋Postgres 雙層
- [x] S0 建三倉（2026-09-13）：`tianxi-football`（腳本／快照／mapping／Actions）、`tianxi-football`、`tianxi-football`；前端 `/football` 路由待建；D1 建庫待做
- [x] S1 基準線快照（2026-09-13，238,854 場／2000–2026／38 聯賽）：uniform RPS 0.2247、prior_asof RPS 0.2261（S2 gate）、market_devig RPS 0.2047（僅對照，最終逼近目標）；明細 `snapshots/baseline_snapshot.csv`
- [x] FootyStats 驗收腳本（`scripts/footystats_acceptance.py` ＋ Actions）：聯賽歷史深度、賽前欄位、xG 十項規格、速率上限；待開最低階付費帳戶勾 3–5 個聯賽跑完整驗收
- [x] S0 收尾（部分）：`/football` 前端路由骨架已上線（階段進度＋S1 基準線＋鐵律＋數據源授權表，2026-09-13）；仍欠：D1 建庫＋自建 football-data.co.uk 逐季採集器（不長期依賴第三方鏡射）
- [x] S2 天喜足球ELO（2026-09-13，主客獨立評分＋跨季回歸 0.70＋淨勝球加權 K＝22，時序前推）：RPS 0.2144、log-loss 1.0373、命中率 47.90%，三項全勝歷史頻率閘（0.2261／1.0699／44.52%）；五組參數 ±0.001 穩健；腳本 `scripts/elo_s2.py`、快照 `snapshots/elo_s2.json` 已入 tianxi-football
- [x] S3 Poisson / Dixon-Coles 入球模型（2026-09-13，在線攻防係數梯度更新＋主場優勢 γ=0.12＋跨季回歸 0.80＋ρ=-0.05 低比分修正，暖機 40 場，時序前推 205,326 場）：RPS 0.2149、log-loss 1.0367、命中率 47.42%，三項全勝歷史頻率閘；同一比分矩陣派生 1X2／OU2.5／BTTS 保證一致；OU2.5 log-loss 0.6918（僅僅贏基準率 0.6930）、BTTS 0.6939（輸基準率 0.6925，暫不上線，交 S4）；腳本 `scripts/dc_s3.py`、快照 `snapshots/dc_s3.json` 已入倉
- [x] S4 天喜足球LGB（2026-09-13，54 項賽前特徵、逐季 walk-forward 重訓、賠率零權重，實測 2012–2026 共 149,890 場）：RPS 0.2105、log-loss 1.0242、命中率 48.66%、ECE 1.36%，同批場次全勝 S3（0.2138／1.0322／48.39%）；BTTS log-loss 0.6903 贏基準率 0.6925（可上線）、OU2.5 0.6840；逐季 RPS 0.2086–0.2144 無崩季；和局召回率僅 2.9%（交 S5 校準）；腳本 `scripts/lgb_s4.py`、快照 `snapshots/lgb_s4.json` 已入倉
- [x] S5 α 集成 + 校準（2026-09-13，Elo／DC／LGB 對數空間加權，權重與校準器只用測試季之前兩季季外預測擬合，賠率零權重）：RPS 0.2098、log-loss 1.0203、命中率 49.04%、ECE 0.30%（S4 為 1.36%），三項全勝 S4／S3／S2；逐季 RPS 0.2081–0.2133 無崩季；和局召回率跌至 0.3%（集成更尖銳），但和局機率分區可靠（27.5% 預測 vs 27.6% 實際）→ 和局改以「價值注」用法，召回率降為診斷指標；腳本 `scripts/ens_s5.py`、快照 `snapshots/ens_s5.json` 已入倉
- [~] S6 足球預測頁 + 公開對帳
  - [x] 公開對帳頁 `/football/results`（2026-09-13）：總成績、六軌對照、逐季 15 行明細（權重＋校準器）、首選機率校準表、和局分區可靠度（取代召回率）、未過關項目公開（30–35%／35–40% 高估和局 → 價值注封頂 30%）
  - [x] 自建每日採集器（2026-09-13）：`ingest_results.py`（官方 CSV，22 聯賽 × 2000 起，逐季一檔 + manifest）、`ingest_fixtures.py`（未來一週賽程＋賽前平均賠率，抓唔到保留舊貨並標 stale）、`selfcheck.py`（新鮮度上限：賽程 12h／賽果 30h，缺快照即報）、`football_daily.yml`（每 6 小時，自檢失敗自動開／續 watchdog issue）
  - [x] 引擎流程頁 `/football/engine`（2026-09-13）：八步時序（T-7 日 → T-30 分凍結＋版本指紋）、紅黃綠燈定義、逐季集成權重＋校準器表、採用 54 項特徵按六組列出、明確不採用六項（賠率／假 xG 欄／賽中統計／和局重採樣／隨機切分／球員分數加總）附原因
  - [~] 逐場賽前凍結＋版本指紋＋紅黃綠燈（2026-09-13）：`scripts/predict_fixtures.py`（197,871 場歷史前推重建 Elo＋DC 在線狀態 → 190 場賽前機率、λ、最可能比分、OU2.5、BTTS、市場去水對照＋價值差、指紋、T-30 鎖定判斷）；已入 `football_daily.yml` 每 6 小時重算，`selfcheck.py` 加預測層 12h 新鮮度；站內 `/football/fixtures` ＋ 私有倉代理 `/api/public/football-predictions`。**未完**：LGB／集成逐場推論未接入 → 狀態一律紅燈（未校準），接入後才出黃／綠燈
  - [ ] 賽後逐場對帳（等本批凍結預測有賽果）
  - [x] S7 價值注盈虧回測（2026-09-13，149,890 場、賠率只作價值判定不入模）：八方案全負 —— 全市場最佳價門檻 0%／2%／5%／10% 分別 −2.24%／−2.36%／−2.50%／−2.85%，單一莊家 −8.85%／−9.90%，只買和局（機率封頂 30%）−3.54%／−3.47%，凱利（上限 2%）由 1000 輸光；逐季 15 季只有 2017（+0.02%）、2019（+0.29%）正數，2025 季 −10.04%；關鍵發現：跨莊比價值 7 個百分點（−9.9% → −2.2%）；腳本 `scripts/value_bets_s7.py`、快照 `snapshots/value_bets_s7.json` 已入倉；**商業閘門未過 → 價值注不上線，不開收費**
  - [ ] 價值注翻正（需 xG／賽前陣容／傷停 v1 特徵；不得以賠率入模）
- [ ] 用戶授權自動推進：每個「下一步」由我自行決策執行，直至足球引擎搭建完成（2026-09-13 起）
- [ ] S6 產品化（紅黃綠燈鎖定、特徵選取頁、可靠度圖、殘差診斷）
- [x] 定案（2026-09-12）：賠率零排名權重；球員層只做「陣容強度修正特徵」（球員ELO×分鐘加權 → 預期首發／板凳深度／可用率／輪換方差），不取代球隊層；球隊與球員名跟馬會官方繁中譯名（雙軌 team_names/player_names 對照表＋官方譯名爬取器）；足球頁併入現網 `/football/*`
- [ ] 待你確認：football-data.co.uk 商用授權、api-football 付費方案、arXiv:2512.12116 編號（內容與足球無關）、ResearchGate 該篇原文連結／PDF
- [ ] 足球賽前陣容／傷停免費源可行性評估（用戶提供清單 2026-09-13）：Big Balls Football API、WhoScored/FotMob/Sofascore/Transfermarkt 網站抓取、StatsBomb open data 歷史陣容——逐一驗證授權與穩定性
- [x] 特徵字典 v0.1 落地：`docs/football-feature-dict.md`（16 章欄位規格、refresh／freeze／可否入 prediction_log／v0-v2 分期、加特徵硬規矩）
- [ ] 研究 https://www.ai-prediction.info/ （2026-09-13 用戶要求）：其預測產出、指標展示、資料源與可借鑒之處
- [x] 競品研究 ai-prediction.info：定價 HK$3,800/月（6 個月 HK$7,800）、表現頁只有截圖無可核查指標、方法論不公開；結論寫入 `docs/football-engine-plan.md` §7
- [ ] 借鑒項 A：HKJC 七類盤口內在一致性檢查（反推 λ 交叉驗證模型）
- [ ] 借鑒項 B：Glicko-2 作為足球評分軌 A/B 候選（處理轉會／傷兵／換帥衝擊的不確定度）
- [x] 競品研究 data4mula.com：資訊架構、單場分析九大區塊、多莊 SD/CV 分歧度、四條盤路歷史帶；結論寫入 `docs/football-engine-plan.md` §8（Cloudflare 封鎖，不爬）
- [ ] feature_dict 補三組（來自 data4mula）：進失球六時段分佈 `goals_share_min_*`／`conceded_share_*`、球證贏盤率 `ref_home_cover_rate`、跨莊分歧度 `p_impl_sd`／`p_impl_cv`
- [ ] 前端借鑒：四條盤路歷史色帶（勝負／讓球／大細／單雙）、半全場與入球數分佈（由模型 λ 比分矩陣生成而非純歷史頻率）
- [ ] 研究開源專案 github.com/Scodive/MatchPredict（2026-09-13 用戶要求）：模型結構、特徵、資料源、有無回測與校準，判斷可否借鑒
- [x] 研究 Scodive/MatchPredict：實際只用 sklearn RF/GBDT + 約 20 欄近 10 場統計 + LLM 文字分析；發現四大洩漏（特徵非 as-of、隨機 K-fold、scaler 全集 fit、只報 accuracy 並宣稱 90%）→ 反面教材，結論寫入 `docs/football-engine-plan.md` §9
- [ ] 產品層可借鑒（來自 MatchPredict）：日曆式歷史預測瀏覽＋逐日命中率、會員積分／VIP 分層、串關五模式命名對照我們雙欄設計
- [x] 研究 kochlisGit/ProphitBet（MIT、573★）：27 欄主客滾動特徵（shift(1) 逐季 as-of，做法正確）、Profit Balance 盈虧平衡指標、內建機率校準、Boruta＋決策樹規則抽取 → 可用；賠率三欄直接入模、預設隨機 StratifiedKFold＋Optuna 掛隨機切分、SMOTE/NearMiss 重採樣 → 不可用。結論寫入 `docs/football-engine-plan.md` §10
- [ ] 落地項（來自 ProphitBet）：v0 隊級滾動特徵照其邏輯實作但剔除賠率欄；gate 加 Profit Balance 輔助指標；`/football/features` 加 Boruta 裁決欄與決策樹規則圖
- [x] 研究 1canhhoa/sports-betting-toolbox（TS、MIT、⭐135／fork 869）：預測層以 LLM 出機率＋全表一次算戰績＋子字串隊名匹配 → 不可用；策略層（移植 Python `sports-betting`）TimeSeriesSplit 時序回測表、價值注 `p×odds>1`、`OddsComparisonBettor` 去水基準 → 可用。結論寫入 `docs/football-engine-plan.md` §11
- [ ] 落地項（來自 sports-betting-toolbox）：足球回測輸出表統一為訓練期／測試期／下注日數／注數／每注 yield%／ROI%／期末資金；S1 加入價值注判定與多莊平均去水基準；商業閘門＝RPS 過關 ＋ yield 正數
- [x] 研究競品 tipsme.hk（Datamount Solutions Ltd，波馬合一＋貼士市集）：查明足球資料層 100% 買自 TheSports API（`img.thesports.com` / `widgets.thesports01.com`）；結論寫入 `docs/football-engine-plan.md` §12
- [ ] 申請 TheSports 15 日免費試用，抽 schema 樣本評估是否覆蓋特徵字典第 6–9 章（賽前陣容／傷停／球員能力／中文隊名球員名），再決定付費；買賠率亦維持 `market_beta=0`
- [ ] 補入足球特徵字典第 3 章：讓勝率、大率、角大率(>9.5/>10.5)、六時段進失球分佈；`/football/match` 加「同主客／賽事相同」篩選
- [ ] `/football` 球隊頁參考佢哋密度：傷停名單（缺陣場數＋預計復出）、每場帶氣溫／角球／紅黃牌、六項能力分＋總分（子分必須可回測並標賽前凍結時間）
- [ ] 免費引流工具：讓球盤去水還原（抽水%＋真實勝率＋凱利注碼）、過關計算機——與 S1 去水基準／價值注同源
- [ ] 會員定價錨定 HK$688/年（tipsme 鑽石會員價，含「四隻精選馬匹」，與我們四揀正面對撞）
- [x] 研究 7M（news.7m.com.cn 賽前分析欄）：版權明文嚴禁轉載／建立鏡像，數據源自 SportsDT（二手授權）→ 與 Sofascore／Flashscore 同級，不爬取、不進生產；「免費調用」只係帶其品牌廣告的嵌入頁，非原始數據，只列應急備援。結論寫入 `docs/football-engine-plan.md` §13
- [ ] `team_names` 表加 `name_zh_hk`（馬會官方為唯一權威）＋ `name_zh_cn`（對接內地源如 TheSports／SportsDT 回傳簡體名用）＋ `alias[]`、`source`、`verified_by/at`；無把握入待審告警
- [ ] `/football/match` 加「人話賽前簡報」：四段式（港式標題／模型推介＋紅黃綠燈＋凍結時間／軍情：陣式・擔正・入球助攻・傷出缺陣・預計正選變動／場外動態短訊流），資料自建、文字由語言模型生成，機率只來自可回測模型
- [x] 研究 FootyStats（Cloudflare 擋，不爬）：其自售 JSON API（`api.football-data-api.com`，含近5/6/10場滾動統計、H2H、Odds Comparison、BTTS／大細／角球／牌）明寫供 ML 用，價格遠低於 TheSports → 定為第二順位採購源。結論 `docs/football-engine-plan.md` §14
- [x] 研究 Mysports.AI（NBA/MLB/NHL 訂閱平台）：方法論與我們一致（去洩漏欄位、Elo 為主、球員效率總和與球隊實力弱相關、正EV才出手）；績效全標「回測示意」不可作基準。§15
- [x] 研究 HongKongScore.com：純關鍵詞殼站，比分全嵌 SPBO，零數據零分析 → 無參考價值。§16
- [x] 研究騰訊工程師《用大數據技術預測足球勝率》：盈利硬門檻 `1/precision < 命中場均賠率`；最佳模型 54.55% 仍不達標 → 按機率分段找可出手區間（英超出手率 ~20%、法甲 ~7%）。§17
- [x] 資料源採購次序定案：免費組合 → FootyStats API（補盤口統計／H2H）→ TheSports（需中文譯名＋賽前陣容＋角球即場才升級）；任何源賠率一律 `market_beta=0`
- [ ] 足球商業閘門統一成一張表：技術（RPS／Brier／ECE）＋ 商業（盈利門檻 1/precision < 均賠、Profit Balance、yield%、ROI、最大回撤、平均賠率、盈虧比）
- [ ] 按預測機率分段找「可出手區間」，產品顯示「今日出手／不出手」與出手率（沿用賽馬已上線的分段校準基建，但用於決定是否推薦，不改排名）
- [ ] 新增「聯賽混沌度」指標（各隊近10季積分排名方差平均）：用於排擴展聯賽優先次序，並作紅黃綠燈降級理由之一
- [ ] 足球ELO加入跨賽季回歸（`Elo_next = R×0.75 + 0.25×聯盟平均`）；同時回測賽馬引擎是否需要跨季回歸
- [ ] 特徵字典第3章新增 `scored_in_both_halves_rate`（兩個半場都入球率）；新增繁體統計榜頁（兩半場都入球／BTTS／大細2.5／角球大細／讓勝率／零封率）
- [ ] 命中率／對帳頁加「誠實定義」段落：全部推薦整體命中率 vs 精選高信心命中率並列；補資金曲線（含最大回撤）與學習曲線
- [ ] 建立 with_odds 離線對照軌（17家初賠式基準），長期賠率庫改用 football-data.co.uk 開盤／收盤 CSV（API-Football 只有 7 日滾動，做不到步進回測）；只量度 no_odds 模型距市場多遠，不入生產排名
- [ ] SEO 策略：避開「足球比分／即時比分」紅海詞，攻長尾統計榜與方法論頁

- [x] 研究 AutoBetSoft（autobetsoft.com/ai/model.html）：匿名營運、定價需登入才見、模型頁只堆砌算法名詞、「85% 勝率」無驗證協議；核心做法係賠率誘阻方向 → 與 `market_beta=0` 衝突。反面案例，§18
- [x] 研究知乎《足球预测数据模型实战…worldliveball》：推廣軟文，無資料集／無模型細節／無切分協議；同系列宣稱 80%／82.3% 皆不可查驗。只取多尺度特徵分層、蒙特卡洛比分分布、預測快照留痕三個理念。§19
- [x] 研究 NerdyTips（nerdytips.com/zh，KickOff Ventures LLC）：唯一真做凍結預測＋公開對帳（274,510 場、66.6%、CSV＋GitHub commit 稽核）；但只有命中率、無 RPS／ECE／ROI，中文只有簡體，定價隱藏。§20
- [x] 盡職審查 SportsAPIPro：法人不透明、正在出售（MRR ~US$2.4–3.3K）、schema 幾可判定係 SofaScore 包裝轉售、無傷停端點、陣容只有開賽前 30–60 分鐘、無中文名、無開盤歷史 → **不採購**，只可用 Free tier 交叉核對。§21
- [ ] 對帳頁照 NerdyTips 三段式版面做（KPI 卡＋月度與近14日時序圖＋原始 CSV 下載），但 KPI 要包含 RPS／ECE／yield%／最大回撤；凍結證明加預測快照 hash＋凍結時間，可逐場展開比對
- [ ] 凍結範圍必須連「揀邊個盤口」的規則一齊凍結並公示（避免 NerdyTips "Best Tip" 式事後擇優質疑）
- [ ] 每日限量免費貼士（參考 NerdyTips 6 條）作獲客漏斗；定價公開透明（與 NerdyTips／AutoBetSoft 隱藏定價形成差異）
- [x] 研究 api-football.com/pricing 與 understat.com — 已完成（§23／§24 審查）
- [ ] 產品原則寫入公開頁：全部歷史預測公開，包括差的預測與虧損期，不隱藏、不刪除、不事後修改
- [ ] 特徵設計（用戶觀察 2026-09-13，四項全部要回測驗證，不假設成立）：
  - [ ] 天氣互動項：雨量／風速 × 球隊控球風格（控球率、傳球數、短傳比）交互特徵；Open-Meteo 歷史逐小時，按開賽時間 as-of
  - [ ] 連勝品質調整：所有近況特徵加對手強度加權版本（對手 ELO 加權勝率 vs 原始勝率），並同時保留兩者比較，量度「假連勝」
  - [ ] 傷停影響量化：傷停 × 該球員 ELO 貢獻／上場分鐘佔比 → 缺陣強度指數；與市場賠率反應做殘差分析，檢驗市場是否低估（只作離線對照，不入排名）
  - [ ] H2H 時間衰減：對戰往績加指數衰減，>3–4 年權重趨近零；用回測選衰減半衰期，而非拍板定死
- [x] 審查 API-Football（API-SPORTS，法國，2018）：Free 100 次/日、Pro US$19/7,500、Ultra US$29/75,000、Mega US$39/150,000；1,226 聯賽；免費層即含陣容＋傷停＋事件；賠率只有 7 日滾動、滾球不留歷史；**無中文名**；ToS 被 Cloudflare 擋未核實。定位＝免費／低成本輔助位，採購次序不變。§23
- [ ] 人手登入 API-Football 下載官方 ToS 核對轉售／attribution 條款（key 已驗通，§23）
- [x] 審查 Understat：**robots.txt 實測 `Disallow: /` 全站禁爬** → 合規紅旗，降級為「需書面授權」；且 2025-12 起改架構，`shotsData`／`datesData`／`teamsData` 已不在靜態 HTML，開源套件解析失效。§24
- [x] S8 xG 技術可行性驗證（2026-09-13）：Understat 新架構嘅 XHR 端點 `getLeagueData/{league}/{season}`（gzip JSON，含逐場 xG／npxG／PPDA／deep／xPTS）已解通，寫成 `scripts/ingest_xg.py`（隊名對照表 + 由 football-data 賽果反查核對）＋ `scripts/xg_coverage.py`（±1 日容差，因 Understat 用 UTC、football-data 用英國本地日期）。實測五大聯賽 2014/15–2026 共 21,763 場、隊名 100% 對名、對接率 99.85%。**但覆核 robots.txt 仍係 `Disallow: /`（全站禁爬）→ 抓回嘅資料全部由倉庫撤回、每日流程嘅 xG 步驟移除、腳本標記「已停用，切勿排程」**，只留作合規替代源接上時嘅結構參考
- [ ] 研究 zhuanlan.zhihu.com/p/682338619（2026-09-13 用戶提供）：知乎反爬 40362 全擋（HTTP 直取 403、無頭瀏覽器亦被限流）→ 需用戶貼正文或截圖
- [x] 審查《使用深度學習構建足球競賽預測模型之研究》（2018 臺灣國際科展 190009，謝之貽／康橋高中，用戶 2026-09-13 上傳 PDF）：Kaggle European Soccer Database 2008–2016，CNN 分層共享參數（球員屬性層 → 球隊層 → 融合層）＋全連接層接滾動戰績，正確率約 60%（十次隨機種子變異極小）；和局精確率高（約 0.85）但召回率極低（約 0.15），主勝召回約 0.9 —— 同我哋 S5 集成嘅和局行為完全一致，佐證「和局唔應該當首選，要用機率對賠率」嘅取向
- [ ] 借鑑科展 SoccerNet：球員屬性用「共享參數」而非逐人獨立特徵（減參數、抗過擬合）＋滾動戰績走另一分支，列為球員層特徵（§6）嘅備選架構；其驗證用隨機切分，我哋照舊只用逐季時序前推
- [x] xG 主源次序定案：PitchAPI（當季正選）→ Understat（2021 前歷史後備）→ FootyStats／TheSports 待授權
- [ ] 特徵字典加入 xG 供應商驗收清單（PPDA、deep completions、逐球 xG＋X/Y 座標、situation／shotType／lastAction、npxG／xGChain／xGBuildup、分鐘區間與位置拆分）
- [ ] 對帳頁加和局召回率（draw recall）次要指標，主指標仍 RPS（§25 PredictApp）
- [ ] 回測 ELO 更新目標值改「實際入球 × xG 混合」版本；殘差經有界函數更新（§25）
- [ ] Ordered Logit 列入 LGB 對照模型（1X2 有序三類）（§25）
- [ ] 特徵字典新增：新教練旗標、xG 效率回歸調整、<10 場向聯賽均值收縮（§26）
- [x] 引擎硬紀律：全部盤口（1X2／BTTS／大小／波膽）由同一比分機率矩陣派生 — S16 起已落地
- [ ] 對帳頁加「市場可靠度」視角；關於頁寫明無莊家 affiliate 連結（§26）
- [ ] 對帳頁 FAQ 寫入「近乎全中截圖」教學案例（§28）：點解要開賽前凍結＋快照指紋＋全部公開
- [ ] xgabora 數據集落排程倉做基線快照；抽 3 季同 football-data.co.uk 原檔逐場核對；Elo 延續段抽 50 隊重算比對（§29）
- [ ] 禁止事項寫入特徵字典：xgabora README 建議嘅 ExpectedGoals／DrawLikelihood 等衍生欄含賠率同賽中統計，唔准入模（§29.2）
- [ ] Reddit 帖 1oxnqkf 待用戶貼正文再評（§30）

## 自動化韌性（2026-09-13）
- [x] 修 `lgb_predict_upcoming.yml` / `lgb_backfill.yml` / `alpha_tune.yml` 後端地址（tianxi.racing 切換後 404，連續四日重訓失敗）
- [x] 修 `deploy.yml` 檢查失敗（三個 analyze 端點未列入 manifest）
- [x] 修 `engine_sanity_daily.yml`：`$SEASON_` unbound variable、`/api/season` 需帶 User-Agent（403）、推送前先 rebase
- [x] 新增 `automation_watchdog.yml`（backend：關鍵流程新鮮度 + 今日 LGB 覆蓋率；database：採集流程新鮮度），異常自動開 GitHub issue
- [x] 重訓 2.5 小時問題：特徵快取改增量（restore-keys + 表頭核對），預期降至十幾分鐘
- [x] 上一版模型後備（carry-over）：`predict_upcoming.py --save-bundle/--load-bundle`（凍結 booster + τ_lgb/τ_elo/α + FEAT_COLS；欄位變更即拒絕評分，不用舊 α）
- [x] `lgb_predict_upcoming.yml` 重訓後 `actions/cache/save` 存 bundle（key `lgb-model-v1-<run_id>`）
- [x] 新增 `lgb_fast_predict.yml`：賽日每 30 分鐘 gate 查覆蓋率，零覆蓋即用後備模型只評今日場次；bundle 或 DB cache 缺失則 fail closed
- [x] `today-picks` / race-day report 補 `startTime`（entries_upcoming.post_time → races.start_time），狀態燈終於計得到 T-30 鎖定
- [x] 前端 `modelProvenance()` + 狀態燈標「暫定／最終預測（昨日模型）」、副欄 chip、賽日總燈註明頂住場數

## 足球 · 四倉審查行動項（2026-09-13，§32）
- [x] 審查 golazo（MIT 但打 FotMob 未公開 API → 資料層不可用）、livescoreFootball（無 LICENSE → 不引用）、datasets/football-datasets（PDDL 公有領域，但無賠率欄且 2026-06-23 起停更）、michill H2H（CC0 上游，可用）
- [ ] 採集器韌性四件：空結果持久快取、併發上限、失敗保留上一份有效快照、`sync_states` 新鮮度表
- [ ] 加 `/api/capabilities` 機器可讀自述端點；看門狗改自動比對端點清單（取代人手 manifest）
- [ ] datahub PDDL 五大聯賽 CSV 落交叉核對軌，並補 `Referee` 欄餵球證特徵；不得當主源
- [ ] michill H2H（7,503 場）＋ martj42 CC0 落世界盃線；簡體隊名經 `team_names` 轉港式繁體，缺漏開待審告警
- [ ] H2H 特徵帶三態覆蓋標記（有交鋒／確認無交鋒／待驗證）；訓練標籤一律用 90 分鐘賽果 `result_90m`

## 足球三條紀律（2026-09-13，計劃書 §33）
- [x] 洩漏紀律寫入計劃書：滾動特徵、標準化統計量、Elo／校準器一律逐季 walk-forward，違者回測作廢
- [x] 逐輪凍結寫入計劃書：預測逐個比賽日生成並凍結，帶模型＋特徵指紋，禁一次批算整季
- [ ] 機率區間：bootstrap 或三軌分歧度出 90% 帶寬，賽事卡顯示「±x 個百分點」
- [ ] 特徵貢獻：LGB SHAP 逐場前三至五項推高／推低因子，只作解釋層
- [x] 波膽改每場一個（全場機率最高一格）＋「四球或以上合計機率」，並喺頁尾寫明為何最高機率格幾乎必然係低比分
- [x] /football/fixtures 由 11 欄大表改為賽事卡：識別標、主和客機率條、三格波膽（主勝／和局／客勝各自最可能）、引擎口徑摺疊面板
- [ ] 賽事頁掃讀密度（參考 data4mula／tipsme）：日期分組標頭、排序切換（時間／價值差／信心）、跨莊分歧度欄
- [x] 隊徽資源審查（計劃書 §34／§35）：下載站（Football-Logos.cc、FootyLogos、Brands of the World、Wikimedia Commons）只作離線參考；Kaggle 圖集不採用
- [x] 隊徽上線路線定案：football-data.org 免費層 crest URL（第一順位）→ API-Football 備援 → TheSportsDB（標出處）→ 派生識別標兜底；URL 由排程落 team_names 表，前端直用 API 託管 URL
- [x] football-data.org 免費 key 已入 secret（`FOOTBALL_DATA_ORG_TOKEN`），實測 `/v4/competitions/{code}/teams` 回 crest URL，rate limit 每分鐘 10 次
- [x] 改用站內代理 `/api/public/football-crests?div=`（逐聯賽邊緣快取 7 日、上游失敗只短快取 5 分鐘並當無徽章處理），免同步排程同商標託管；football-data.org 免費層未覆蓋嘅聯賽（土超／比甲／希超／蘇聯賽等）回空陣
- [x] 前端 `/football/fixtures` 接入官方 crest（`useCrests` 客戶端 token 對照，命中率 ~53%；對唔上或圖檔載入失敗即退回派生盾形識別標）
- [ ] openfootball 靜態球隊資料入 `team_mapping` 輔助對照

### S8 五大聯賽實力模型（2026-09-14 併入引擎）
- [x] 訓練：英超／德甲／西甲／意甲／法甲 2020/21 至今 11,051 場，回測 8,942 場，每 14 日滾動重訓，時間半衰期 180 日，只用賽前資料
- [x] 過閘成績：純入球實力 RPS 0.2025 ／ 命中 52.15% ／ 波膽 12.37%；實力重加權 RPS 0.2004 ／ 命中 52.66% ／ 波膽 12.64%（三項全勝，正式採用重加權）
- [x] 引擎頁新增 S8 卡公開權重與成績；流程第 ⑥ 步寫明卜瓦松矩陣＋Dixon-Coles 低比分修正＋實力分區加權
- [x] 波膽展示改「一個主選＋分區備選」：主選為三區最高機率格，另兩區各出最可能比分（全場機率＋該賽果內條件機率）＋四球以上合計機率
- [x] 明確拒絕「用賠率反推隱含機率校正模型」呢個常見做法（market_beta = 0），只作對照線同價值判斷，頁尾已寫明
- [ ] 把五大聯賽實力模型 λ 推廣到其餘 33 個聯賽（樣本較薄，需向聯賽均值收縮）
- [ ] 實力模型 λ 落上游 predict_fixtures.py，取代現行在線混合 λ（現時網站只在展示層重加權）

### S9 xG／陣容／傷停：翻正價值注嘅三格缺口（2026-09-14）
- [x] xG 併入實力模型可行性驗證：Dixon-Coles 訓練目標改為「實際入球 × xG 混合」，五大聯賽 2018/19→2026 共 14,285 場、回測 10,684 場、每 14 日滾動重訓、只用賽前資料 → RPS 0.2029 → 0.2003、命中 51.85% → 52.57%、波膽 12.55% → 12.61%（三項全勝），最佳比例 65% xG／35% 入球，0.30–0.40 區間平坦
- [x] 驗證樣本合規處理：來源 robots.txt 全站禁爬 → 樣本用完即棄、唔排程、唔入倉；只保留結論同模型改動
- [x] 引擎頁新增 S9 卡：公開驗證數字＋三格缺口採用源次序與狀態；明寫三格未齊前唔宣稱價值注可行
- [x] bigballsdata.com 評估＋鑰匙驗通（2026-09-14）：免費層（GitHub 登入 2,000 次/日）逐端點實測——xg-leaders（球員季累積真 xG）、injuries、stored lineups、stored stats 全部 200；逐場 statistics（含逐場 xG）403 屬付費。定位：傷停主源、陣容／統計備援、球員 xG 聚合特徵來源
- [x] S9 xG 全套三線回測（2026-09-26，研究倉 c110d41）：RPS 0.2003→0.1996；只買和 thr5 +3.85%，其餘仍負；Understat xG 入引擎資料倉（84ff02d）＋每週補料
- [ ] S9 資料源第二輪評估（2026-09-26 用戶提供線索，來源 x.com/openagentskill/status/2065283660631433710，逐個核實歷史深度／免費層／合規）：StatsBomb Open Data（免費逐場 event data 含 xG，賽季覆蓋有限）、Soccerdata（FBref／Understat／WhoScored／Sofascore／ESPN／ClubElo 爬取器，FBref 有歷史 xG）、Socceraction（SPADL／VAEP／xT 行動估值，配 StatsBomb 用）、FootballData（JSON／CSV 歷史盤）、Transfermarkt API（球員／身價／傷停紀錄）、football-docs v0.11.1（24 供應商文件索引，新加 Driblab）、Roboflow Sports／SoccerNet（影像分析，暫唔啱使）
- [x] PitchAPI 實測通過（2026-09-26）：key 有效，70 聯賽含五大＋次級，逐腳 xG＋xGOT＋座標＋情境，進階 VAEP／xT；免費不限次數；風險＝冇條款頁、服務新、或有收費層。定位 S9 第二 xG 源
- [x] S9：PitchAPI 同 Understat 逐場核對（535 場抽樣，相關 0.931，PitchAPI 平均低約 6%，預測力打和）→ PitchAPI 做當季正選、Understat 管 2021 前歷史
- [x] S9：PitchAPI 每日收料上線（xg_pitchapi_daily 每日 05:07 UTC，試跑 success，資料倉 ba7beaa）；Understat 每週補料降為後備
- [x] S9：2021/22 季起 xG 已換 PitchAPI（9,152 場，隊名全對上）；2021 前 PitchAPI 無歷史，照用 Understat
- [x] S9：PitchAPI 按聯賽校準（×1.037–1.073，整體 ×1.059，9,135 場重疊）後重跑三線回測：RPS 0.1996；只買和局最高價 +2.83%、Bet365 平注 −9.19%，收費閘閂
- [x] S9：只買和局逐季穩定度拆解（最高價 6/7 季正、合計 +3.85%；Bet365 2/10 季正、合計 −3.15% → 唔穩，收費閘閂）
- [x] 研究 X 帖 sporthub：加密幣門檻、冇歷史、收料不公開 → 唔用；借鏡傷停消息時間戳
- [x] S9：GOAL API 賽前傷停／陣容快照上線（每 2 小時，記 observed_ts）
- [x] 足球收料狀態頁 /football/ingest-status：PitchAPI 每日／Understat 每週／賽前快照；失敗步驟內重試 3 次＋補跑時段
- [ ] GOAL API 賽前快照路線：每日自動儲陣容快照（免費層 1,000 次/日），儲夠 1–3 個月後用真正賽前資料重跑價值注回測

### 足球即時戰況（文字直播）（2026-09-26）
- [x] `/api/public/football-live` 端點：GOAL API 即時比分＋逐場入球／換人／牌事件，伺服器端 30 秒暫存，五大聯賽篩選，上游失手回舊暫存
- [x] 預測頁頂部「即時戰況」畫板：隊徽計分板＋分鐘＋事件列表，每 30 秒自動更新；冇 key 或冇直播場次時成塊隱藏
- [x] GOAL_API_KEY 已設定（2026-09-26，Secret key 經安全表格儲存）；事件映射對齊上游實際欄位（time/timeNum→分鐘、homeScorer/awayScorer→球員、score→比分），直播畫板已上線
- [ ] 進階：ScoreBat 官方精華片段內嵌（合法授權來源）
### S12 波膽塌落 1-1 修正（2026-09-14）
診斷：公開「波膽」本質係 DC 矩陣眾數，λ 被壓扁（λh 中位 1.57、λa 中位 1.24、λa < 0.8 零場），加 ρ=−0.05 把質量推向低分格 → 190 場 178 場 1-1、12 場 2-1。根因喺 S3 結構：聯賽基準鎖 log 1.35、係數 clamp ±1.2、跨季 ×0.80、Elo 差完全冇注入 λ。
- [x] 展示層（唔郁 S6 凍結 1X2，2026-09-14 上線）：同一張矩陣出 Top 8 格、條件波膽（主勝／和／客勝格內各自排序）、期望比分 E[gh]-E[ga]、尾部桶 P(主勝3+)／P(gh≥4)／P(ga=0)

### S11 ClubElo 對帳層（2026-09-14）
- [x] ingest_clubelo.py：官方免 key CSV（api.clubelo.com）每日全日表落 data/clubelo/daily/，限速 1 req/s、四次重試、失敗保留舊快照＋非零退出，唔寫假數唔填 0
- [x] mapping/clubelo_names.csv：五大聯賽 110 行對名（含本季升降隊），對唔上入 unmapped 出報告，唔 silently 亂配
- [x] reconcile_elo.py：as-of 對帳（開賽日當時 ClubElo vs 自建 elo_s2），聯賽內 z-score 比較；四條告警線＝對名率 95%／z 中位數差 0.50／近 50 場符號一致率 80%／單日跳幅 60 分；snapshots 只增不改
- [x] football_daily.yml：賽果增量後、S6 凍結前插入兩步（continue-on-error），對帳源掛唔擋凍結寫入；異常自動開 watchdog issue；自檢報告加 clubelo 層（報告性質，唔當健康門檻）
- [ ] 兩週真實數據校準告警起步線（現時四條線係推定值）
- [ ] 可選 overlay 特徵：ClubElo 只有過 walk-forward 閘先准入 S4／S5，未過就維持純對帳

- [ ] FootyStats：免費帳戶 0 聯賽配額，要開最低階付費帳戶先解鎖 3–5 個聯賽驗收 xG／H2H／Odds Comparison 欄位（含條款頁轉售／署名核對）；唔課金就擱置
- [ ] bigballsdata 接入：每日拉 xg-leaders 差分化做球隊實力特徵；injuries 落傷停特徵；stored lineups 做 APIfootball 陣容備援
- [ ] 接上已授權 xG 供應（FootyStats API 為首選，用戶已有訂閱 → TheSports → Opta），開啟 xG 混合目標值
- [x] APIfootball v3 鑰匙驗通（apiv3.apifootball.com）：1,019 聯賽、五大齊；完成賽事實測有齊正選 11 人＋後備＋教練；未開賽場次陣容約開賽前一個鐘公布（今晚實測確認 timing）；statistics 欄射門／角球／犯規／牌數齊全 → 可做 S10 節奏層每日實數源
- [x] api-football.com（API-SPORTS）鑰匙驗通：免費層每日 100 次、只包 2022–2024 歷史季；英超 2024 傷停實測 3,168 條（球員＋傷患類型＋缺陣場次）→ 定位＝傷停／陣容特徵歷史回測源
- [ ] 歷史傷停回填：API-SPORTS 免費層 2022–2024 五大聯賽 injuries 落地（每日 100 次要分多日拉），用嚟訓練同驗證陣容特徵
- [ ] 代理 xG（第二順位，研究軌）：只用 StatsBomb 開放射門事件訓模型＋APIfootball 實測統計做 zone formula 粗代理（唔叫 xG）；xg_source ∈ {statsbomb, proxy_zone, none}，none 保持 NULL；未過 walk-forward 三項閘唔入 predict_fixtures 同公開頁
- [ ] APIfootball 陣容採集器落地：開賽前 60 分鐘起每 10 分鐘輪詢 lineups，公布後凍結快照；missing_players 欄實測為空，傷停標「待觀察」，缺資料時可用陣容比率 = 1
- [ ] 陣容特徵四項落地：預期首發強度、板凳深度、可用陣容比率、輪換不確定度（§6）

### S10 資料源與方法論研究批次（2026-09-14，用戶提交九源＋兩篇）
- [x] 逐個查證完成：核對級三樣有價值（hudl/open-data 做 xG 校準黃金樣本、datahub CSV 補球證欄、withqwerty/reep CC0 實體 ID 對照）；the-odds-api／sportsapipro／sports.bzzoiro 額度太少或自帶預測，只作對照；不採用 statsultra（零回測＋禁 AI 爬蟲）、worldfantasysoccer（夢幻遊戲平台）、Kaggle 球員能力值（授權不明＋八年前快照）
- [ ] the-odds-api.com：只作對照線與價值判定（market_beta = 0 不變），評估免費層額度是否夠逐日跨莊比價
- [ ] sportsapipro.com：評估是否可作合規 xG／陣容／傷停源（FootyStats 之外的候選）
- [ ] hudl/open-data（StatsBomb 開放資料）：只作歷史抽樣核對，不作當季逐輪源
- [x] 自建 Elo 實測 40,646 場（79,672 樣本）駁回「Elo 通吃四項」講法：射門 ρ +0.4302（滾動 +0.2997）、角球 +0.3111（滾動 +0.1554）由實力主導；犯規 −0.0973（滾動 +0.4976）、牌數 −0.1496（滾動 +0.2045）由風格主導
- [x] 引擎頁新增 S10 節奏層卡＋外部資料源審查卡，數字與裁決理由公開
- [ ] 節奏層落地：射門／角球以 Elo 分差為主特徵、犯規／牌數以風格滾動＋球證傾向為主特徵，逐季前推驗證後才上線
- [ ] 由 datahub（上游 football-data.co.uk）五大聯賽 CSV 補 Referee 欄（現用歷史檔無此欄，缺咗做唔到完整犯規／牌數模型）
- [ ] hudl/open-data 自訂授權條款人手覆核後，才作自家 xG 校準樣本
- [ ] worldfantasysoccer / statsultra：抽取展示與呈現手法（不抄資料），寫入方法論源流章節
- [ ] 原則重申：外部只作啟發與交叉核對，模型、特徵、凍結機制與呈現一律自建

- [ ] 逐場 xG 來源評估補充：Sportmonks xG add-on（付費）、sportsdatacampus 免費清單、hungson175 gist 清單、xgstat.com（Vercel 機器人驗證擋爬、無公開 API）——結論記入 dev-log 同 football-source-check 來源表

### S13 逐場凍結帳＋公開對帳（2026-09-14，用戶批：鎖 60 分鐘／先接 S5 才開帳／只收五大）
斷層診斷：足球只有會被覆寫嘅 `data/predictions/upcoming.json`，冇賽馬嗰套「一場一條凍結帳」；冇結算 job、冇公開讀口；燈號三份文件唔一致（檔案 30 分鐘 vs backend README T−24h／T−1h）；回測身分（S5／S8）同生產凍結軌（S3＋S2）分叉。
- [x] 逐場鎖定統一＝開賽前 60 分鐘（`predict_fixtures.py` LOCK_MINUTES = 60），黃燈可刷新／綠燈已鎖／紅燈退回基準
- [x] 凍結器同時凍結整張波膽結構（`cs`：Top 8 格、三區條件格、期望比分、尾部桶），公開頁只讀凍結值，唔喺前端重算
- [x] `scripts/log_predictions.py`：按 match_key upsert 落 `data/predictions/log/YYYY-MM.json`，鎖後預測欄（p／lambda／cs／fingerprint／track／status）永不覆寫，被拒改動記入 `log/audit.jsonl`
- [x] `scripts/settle_predictions.py`：賽果 CSV 按 `div|DD/MM/YYYY|home|away` join，只寫 result（ft_h／ft_a／ftr／rps／argmax_hit／p_actual／波膽格排名／尾部實現），預測欄一分不改；開賽 3 日後仍 join 唔到才入 unmatched，唔智能亂配
- [x] `data/predictions/hit_rate.json` 公開讀口：入帳範圍＝五大聯賽（E0／D1／SP1／I1／F1）＋綠燈＋已鎖；紅燈軌只作診斷；附基準 0.2261 同市場去水 0.2047
- [x] 每日流程：S6 凍結後插入 upsert 同結算兩步；站內讀口 `/api/public/football-predictions?file=hit_rate`、`?file=log&month=YYYY-MM`
- [x] `/football/results` 頁頂加逐場凍結帳三數（平均 RPS／校準偏差／樣本＋指紋）＋「預測 vs 賽果」只讀凍結列表；波膽以「實際比分排第幾格」對帳，唔用眾數打 ✓／✗
- [ ] 接 S5 集成推論入每日凍結軌（同一指紋）→ 綠燈成立，戰績正式開帳；未接入前三數顯示「未開帳」，唔借回測數字充當實戰
- [ ] 完場後禁止重算之自動檢查：selfcheck 加「已鎖場次 p 有無被改」比對 audit
- [ ] 收費會員頁引用 football-data.co.uk 歷史（非商業條款）前，需法律位確認

### S14 波膽一致性優化次序（2026-09-14，用戶清單）
- [x] ②波膽 KPI 改 Top 1／Top 3／Top 8 覆蓋率＋格 log-loss — S18 起已落地
- [ ] 明確唔做：人手規則「Elo>200 顯示 4-0」、用收盤波膽賠率教矩陣、賽中／紅牌／賽後 xG 入波膽、綠燈後為陣容重開成張格；1X2 永不為出大比數而改

### S15 前端層級紀律（2026-09-14，用戶定案：先引擎面，唔做資料館）
第一層（現階段唯一主力）今日預測＋已完對帳：燈號、1X2 機率條、波膽四層、指紋、日期＋五大聯賽篩、頁頂一條戰績（RPS／樣本／版本）。
第二層（有凍結帳後）五大聯賽積分榜＋「天喜足球ELO」一欄（標明自建、賽前 as-of、非 FIFA 排名）；球隊名點入去去「近期預測 vs 賽果」。
第三層（資料合約齊後）球會頁：只放主客 Elo、近況 λ／預期入球、近期預測對帳。
第四層（最遲）球員頁：等陣容／球員 ID 對照表凍結，只做五大、有出場先有頁。
暫緩：球員頁、全球球會百科、LGB 排行榜、每聯賽「數據中心」。
署名規則：一頁最多一條「天喜分」＝天喜足球ELO；LGB 只出引擎說明同戰績；入球模型只署名波膽區；ClubElo 只做對帳。未綠燈一律寫「基準軌」。

### S16 S5 集成推論接入每日凍結軌（已完成 2026-09-15，綠燈帳待完場樣本）
- [x] features_s5.py 單一賽前特徵引擎（as-of、只用開賽前資料）＋ train_s5.py 逐季前推訓練＋向量標度校準
- [x] 三項閘門全過：RPS 0.2083 / log-loss 1.0154 / ECE 0.65%，全部贏最佳單軌；模型指紋 378c283b73a7-bb35e29b0c7b-175995 併入凍結指紋
- [x] predict_fixtures 改用 S5 機率；波膽由 rescale_matrix 按 S5 分區重加權（1X2／波膽／大細／BTTS 同一張矩陣）
- [x] 燈號：S5 就緒＋雙方熱身 40 場＝final（綠燈入帳，今日 180 場）；否則 fallback（紅燈只作診斷，今日 10 場）
- [x] football_train_s5.yml 每月 1、15 號重訓，過閘才入倉，唔過閘自動開 watchdog issue
- [x] 前端：預測頁綠／紅雙軌燈號、只讀凍結波膽結構、並列閘門數字
- [ ] hit_rate.json 綠燈帳累積中，頁頂三數要等綠燈場次有完場賽果才轉真數（絕不借回測數字）

### S17 「預測 vs 賽果」升格公開主對帳頁（已完成 2026-09-15）
- [x] 獨立公開頁 /football/prediction-vs-result，同賽馬「預測與賽果」同一級；回測頁只留歷史數字並加入口
- [x] 一張卡三狀態：未開賽 → 進行中 · 預測已鎖定（唔顯示即時比分、唔預先畫 ✓）→ 已結算
- [x] 篩選：五大／全部聯賽、逐日、狀態三層；紅燈（熱身不足）場照顯示賽果但標「唔入戰績」
- [x] 頁頂三格維持「未開帳」（平均 RPS／1X2 校準／樣本＋指紋），波膽 Top 8 覆蓋率放摺疊次要項
- [ ] 等第一批綠燈完場樣本，三格轉實數並做結算驗收（抽 5 場對頁面、凍結列、指紋）

### S18 開帳前紀律：鎖定硬檢查＋對帳指標定義（已完成 2026-09-15）
- [x] 鎖定政策唯一口徑寫入 log_predictions.py（LOCK_POLICY）、README 同 selfcheck：開賽前 60 分鐘轉綠燈，已鎖場永遠跟當時指紋
- [x] 已鎖場遇新模型：refuse_locked ＋ fingerprint_drift 雙記錄（今日 179 場拒絕升指紋、11 場未鎖正常刷新）
- [x] 每日出 snapshots/lock_YYYY-MM-DD.json 鎖定報告；鎖定分鐘唔一致即警告
- [x] selfcheck 新增凍結帳層（月檔／場次／已鎖／已結算／拒絕數／鎖定分鐘一致／hit_rate 指標定義齊全）
- [x] 對帳指標寫死並輸出 hit_rate.json.metrics：主＝RPS＋ECE＋樣本指紋；1X2 次＝首選命中率；波膽＝頭八格覆蓋＋實際格 log-loss；排除波膽命中率、紅燈場、價值注 yield、回測填實戰
- [x] settle_predictions 逐場計 cs_logloss（跌出頭八格用最細格機率一半作罰分底）並入 aggregate；對帳頁摺疊項多一格
- [ ] 結算驗收（等今晚至週末五大聯賽完場）：抽 5 場對頁面機率／波膽格／指紋 vs 凍結列，確認只補賽果欄

### S23 主客分拆攻防生產移植（2026-09-15）
- [x] 在現行生產凍結軌（gamma=0.12、rho=-0.05、lr=0.04、warm=40）上 walk-forward：五大聯賽 46,855 場、評分季 2012 起 11,702 場
- [x] 三閘對照：基準 RPS 0.20568、log-loss 1.0026、ECE 10-bin 1.41%
- [x] 主客分拆四係數（atk_h/def_h/atk_a/def_a）48 組掃描：最佳 RPS 0.20873（lr=0.04、warm=60、gamma=0.06），log-loss 1.0097、ECE 4.21%，全部三閘都輸；gamma=0.12 時 RPS 0.2090、ECE 2.98%
- [x] 裁決：唔升指紋；predict_fixtures.py、dc_s3.py、lgb_s4.py 維持 global atk/dfn；研究結果 JSON 上傳倉庫 data/research/s23/
- [x] 解釋與研究軌刀 4 嘅差異：cuts.py 用 gamma=0.26 baseline（RPS 0.21356），主客分拆改善到 0.21032 並過三閘；現行生產 gamma=0.12 baseline 已更優，主客分拆再拆四係數反而攤薄主場效應、校準變差
- [ ] 下一條模型線暫時封住；產品線繼續對帳展示，對照表等賽果

### S26 產品線對帳（2026-09-15 起）
- [x] 對帳三格轉實數：190 場完場、綠燈五大 5 場入帳（RPS 0.1446、ECE 0.2001、頭八格 60%、格 log-loss 2.8842）；樣本細，只作起步參考
- [x] 抽五場核對凍結列：p_actual 逐位對上、cs_rank 同 top8 重計一致、結算只補 result
- [x] 核對揭兩漏洞已修（數據倉庫三腳本）：predict_fixtures 鎖定窗口改 0≤Δ≤60min（已開賽永不鎖）；log_predictions 賽後入帳標 late_ingest 永不鎖；settle_predictions 綠燈加 genuine_lock（first_seen ≤ 開賽−60min）。現有 5 場綠燈 first_seen 早過開賽 5.5–8h，新檢查下仍合資格
- [ ] 對外對照表（天喜 vs 公開站，同一批已鎖預測逐場記 1X2／波膽格／RPS）：等綠燈樣本再累积先開，唔用回測充場

### S24 倉庫分家（2026-09-15，完成）
- [x] 新開私有研究倉 `sleepingarhat/tianxi-football-research`：`scripts/research/`（7 個腳本）＋ `data/research/`（9 個結果 JSON，含 S23、S25 試驗 1–5）遷入
- [x] 生產倉 `tianxi-football` 刪走全部 research 路徑；只留凍結預測、prediction_log、audit、指紋、models/、snapshots/、每日凍結 workflow
- [x] 網站倉 `tianxi-site` 刪走本地 `research/` 副本，避免三處同一份研究檔
- [x] 權限邊界寫入兩倉 README：產品站只讀生產倉凍結檔；研究倉唔准寫指紋／模型／凍結檔，升級只准人手在生產倉開新版本
- [x] 研究倉加 `NOTES-rejected.md`：禁止列（殘差、ρ(λ)、逐聯賽 μ、時間衰減、κ→λ、Rue–Salvesen γ、疊加、賠率入模、單格命中回寫調參…）＋紅燈規則（缺資料 Δλ=0、紅燈可睇唔入戰績）

### S28 中文隊名對照（2026-09-15，完成）
- [x] `src/lib/teamZh.ts`：五大聯賽 96 隊 football-data 短名 → 港式馬會譯名（英超 20／德甲 18／西甲 20／意甲 20／法甲 18）；先按聯賽查表，再用跨聯賽全站唯一名後備，撞名或表外原樣顯示英文，唔會亂譯
- [x] 接入四個顯示位：賽前預測卡、五大積分榜、球隊資料頁（標題／近況對手／逐場凍結對帳）、公開對帳逐場卡；隊徽派生盾形標 initials 同步改中文頭兩字
- [x] 純展示層：內部鍵、teamSlug、凍結列 join 全部維持英文短名；唔碰凍結、唔入模、唔改對帳
- [ ] 維護：升降班新隊入表；表外新隊暫顯英文短名

### S27 場次條件層 Δλ 表（2026-09-15，結構落地）
- [x] `docs/delta-schema.md`：三表欄位定義、只附加語意（改正靠新行 + supersedes）、硬規則（唔准寫 data/predictions、models、snapshots、唔准帶凍結欄）
- [x] `data/delta/{delta_squad,delta_density,delta_market}.jsonl` 空表 ＋ `_schema_version=1`（結構版本，唔係模型指紋）
- [x] `scripts/delta_write.py` 只附加寫入器：拒絕凍結路徑、拒絕凍結欄（p/lambda/cs/fingerprint/locked_at/result）、拒絕未知欄；結構階段 delta_h/delta_a 一律 0、applied 一律 false
- [x] 缺資料語意：status=missing → Δλ=0 退回基準 λ、場次標紅燈（可查可睇、唔入戰績、唔入對帳分母）；delta_market `captured_before_lock=false` 唔准入任何對照表
- [ ] 准用前置未齊：公布名單時間戳、穩定分鐘、賽前 projected xG、門將撲救；未齊唔碰凍結、Δλ 維持 0
- [ ] 試驗 5 重開條件：S24＋S27 已完成，紅燈規則已寫入研究倉；仍需人手開跑，指紋一分不動

### S29 條件層資料層前置（2026-09-15，只落庫、唔生成 δ）
- [x] `docs/lineup-source-survey.md`：五大聯賽公布名單時刻調查（英超官方 75 分鐘；德甲／西甲／意甲 60–75、法甲 60–90 浮動、官方冇承諾）、聚合來源次序（官方 > API-Football 免費層 20–40 分鐘多數遲過鎖定線 > TheSportsDB 唔准做開關）
- [x] 時間戳定義寫死：`effective_ts = lineup_published_ts ?? lineup_observed_ts`；`lead_minutes = (kickoff − effective_ts)/60`
- [x] 遲到規則表：`ok`（≥60 分鐘且兩隊齊 11 人，eligible=true）／`late`／`post_kickoff`／`incomplete`／`missing`／`unmatched` 一律 eligible=false → Δλ=0、場次紅燈
- [x] `docs/context-data-schema.md` ＋ `data/context/{lineups,player_minutes,projected_xg,gk_saves}.jsonl` 空表 ＋ `_schema_version=1`：四項一次定齊欄位同遲到規則
- [x] `scripts/context_write.py` 只附加寫入器：拒絕凍結路徑同凍結／δ 欄（p/lambda/cs/fingerprint/locked_at/result/delta_h/delta_a/applied）、拒絕未知欄；eligible 由時間戳＋完整度自動計，已本地實測（官方 75 分鐘→ok、觀察 30 分鐘→late、完場 xG→missing、防護觸發）
- [x] `scripts/ingest_lineups.py` 採集骨架：只記 published/observed 時間戳同 11 人完整度；冇授權 key 或抓取失敗寫 missing 佔位，唔用平均／上仗 11 人頂替
- [ ] 未開（按指示排後）：用名單計 δ、LGB 改估兩個 Poisson λ、動態攻防重開；凍結預測、prediction_log、指紋一分不動



### S19 λ 生成鏈升級（研究軌，未過三閘唔升指紋）
- [x] 研究腳本 scripts/research/lambda_chain.py：Elo 差注入 λ（κ 掃描）＋ ρ 隨強度衰減（ψ）＋聯賽自己嘅 μ，五大聯賽 46,855 場、評分季 ≥ 2021（8,603 場）
- [x] 首輪結果：κ > 0 令 RPS／實際格 log-loss／ECE 三項全部變差（κ 0.15→RPS 0.2150、κ 0.60→0.2209，基準 0.2137）；1-1 眾數佔比由 58.7% 跌到 41.3%，即「格靚咗但機率差咗」——κ 唔准升指紋
- [x] 一刀一把掃描 research/cuts.py（基準 RPS 0.21356／格 LL 2.9835／ECE 0.04347）
  - [x] 1. 近十場對平均對手殘差 w=0.15/0.30/0.50 → RPS 0.2140／0.2149／0.2165，三閘不過
  - [x] 2. ρ 隨 λ 衰減 ψ=0.6/1.2/2.0 → RPS 0.2136 不動、格 LL 微退，只校準略好，不過
  - [x] 3. 逐聯賽 μ → RPS 0.21369、ECE 0.0445（升），不過
  - [x] 4. 主客分拆攻防 → RPS 0.21032／格 LL 2.9618／ECE 0.01239，**三閘齊過**（1-1 眾數 50% → 76%）
  - [x] 5. 時間衰減 ξ=0.05/0.12/0.25 → RPS 0.2139／0.2147／0.2172，不過
  - [x] 疊加測試：刀4＋ρ(λ)／＋μ／＋殘差／＋ξ 四組各有一項輸單獨刀4 → 唔疊
- [ ] LGB 改估兩個 λ（Poisson 損失）再砌格；1X2 集成保留
- [ ] 刻意唔做：單格命中訓練、κ 再掃、球員百科、賠率入模、為齊隊徽盜圖




### S20 隊徽覆蓋率
- [x] 盤點：15 個聯賽 284 隊，原本 268 隊無徽（次級聯賽完全未接源）
- [x] 加第二順位源 API-Football（授權帳戶；免費層只到 2024 賽季，當季查唔到會退返 2024，隊徽 URL 長期穩定）＋隊名別名表／三字代號對照／整段名稱包含兜底
- [x] 實測結果：五大聯賽、荷甲、葡超 100% 有徽；仍缺 51 隊集中喺德乙／意乙／西乙／法乙／比甲／土超／希超（免費層無當季名單，升班隊對唔上），照樣出派生盾形標
- [ ] 次級聯賽補徽（德乙／意乙／西乙／法乙／比甲／土超／希超等缺徽隊）：等付費層或另一授權源；首選 football-logos.cc（5,200+ 隊 SVG/PNG），後備 TheSportsDB strBadge／API-Football CDN；隊徽只作識別用途，唔盜鏈

### S22 球隊資料頁＋五大聯賽積分榜（產品線，指紋唔變）
- [x] /api/public/football-league?div=：由已落地賽果 CSV 即場派生積分榜、天喜足球ELO（自建、賽前 as-of、跨季回歸 25%、主場 +60）、主客攻防分拆、逐隊近況；唔讀 CSV 賠率欄，唔動凍結軌
- [x] /football/standings 五大聯賽積分榜：積分表加一欄自建 Elo（ClubElo 只對帳，唔上榜）＋主客攻防分拆表；撳隊名入球隊頁
- [x] /football/team/$div/$slug 球隊資料頁：天喜分走勢、本季概況、主客攻防、近況、逐場凍結預測 vs 賽果（只讀凍結帳，賽後只補賽果欄；眾數命中只作展示）
- [ ] 球員頁、球會百科、LGB 排行榜：繼續擱

### S23 主客分拆攻防生產移植（唯一改模型嘅一條）
- [ ] 只移植攻防參數：每隊主攻／主守／客攻／客守（或等價編碼）入生產 dc_s3.py／ens_s5.py；唔夾帶殘差、ξ、分聯賽 μ、κ、ρ 衰減
- [ ] 生產凍結協議驗收：逐季 walk-forward（測試季賽果唔入擬合）、對照現行生產軌（唔用研究基準 0.2136）、五大同全樣本分開報
- [ ] 三項齊過（RPS↓／實際格 log-loss↓／ECE ≤ 基準）先換指紋；任何一季或全樣本有一項輸返即停、留舊軌。今日唔改凍結
- [ ] 波膽同 1X2 仍由同一張格出；綠燈規則不變，升班／熱身不足仍然紅
- [ ] 唔用未結算場倒過來驗移植

### S24 倉庫分家
- [ ] research/ 同凍結檔分家（權限／目錄分開），避免兩套數

### S25 research_only 試驗規格（波膽聚中／和局／場次 Δλ）
- [x] docs/football-research-spec-s25.md：凍結參數清單、禁止列（已否決六刀）、統一三閘＋副閘、試驗序、場次 Δλ 三層、紅燈退回基準、資料層前置
- [x] 試驗 1 DIBP 對角膨脹（p 聯賽級常數，D 只蓋 0–2 球和）：λ 層鎖死（主客分拆已否決、維持 global atk/dfn），生產基準 RPS 0.20524／格LL 2.9456／ECE 0.01095／OU LL 0.68787／對角 0.2482 對實際和 0.2535；全局 p 0.01–0.12 同逐聯賽展開窗 p 全部主閘唔過（p=0.01 已 RPS 0.20527、ECE 0.01386，逐季亦輸），裁決停、唔升指紋。結果 data/research/s25/dibp_result.json、腳本 scripts/research/dibp_s25.py、本地 research/dibp_s25.py
- [x] 試驗 2 雙變量 Poisson 共享衝擊 λ₃（λ₁=λ_H−λ₃、λ₂=λ_A−λ₃，邊際期望不變，只加正相關；全局／逐聯賽常數，唔逐場）：生產基準 RPS 0.20525／格LL 2.9455／ECE 0.01097／OU LL 0.68781。λ₃ 0.01–0.15 加 DC 修正全部主閘唔過（格LL、ECE 齊退，λ₃≥0.06 逐季亦輸）；純 BP（rho=0）λ₃=0.15 RPS 0.20516、ECE 0.00944、OU 0.68724 較好，但格 log-loss 退到 2.9509、2021 季輸返，主閘唔齊。裁決停、唔升指紋。結果 data/research/s25/bp_result.json、腳本 scripts/research/bp_s25.py、本地 research/bp_s25.py
- [x] 試驗 3 邊際換 CMP／負二項（先唔加相關）：生產基準 RPS 0.20525／格LL 2.9455／ECE 0.01097／OU LL 0.68781／0-0 0.0717／高分格(≥6球) 0.0764。肥尾方向全線輸——負二項 r=2→64 全部主閘 0/3（r=2 格LL 3.0585、ECE 0.03164、0-0 膨到 0.1376、1-1 眾數歸零），CMP ν<1 同樣輸。收窄方向 ν≥1.02 三主閘齊過但 OU 2.5 校準開始漂（ν=1.03 OU 0.68806）；細掃 ν=1.01 主閘 3/3 副閘 3/3 逐季全過，但幅度係雜訊級（RPS −0.00001、ECE −0.00008、格LL 持平），唔值得升指紋。裁決停、留舊軌。結果 data/research/s25/cmp_result.json、腳本 scripts/research/cmp_s25.py、本地 research/cmp_s25.py
- [x] 試驗 4 DIBP on BP（次序：獨立泊松 → BP λ₃ → DC rho → 對角膨脹 p，λ₃／p 皆常數）：生產基準 RPS 0.20525／格LL 2.9455／ECE 0.01097／OU 0.68781／對角 0.2482 對實際和 0.2535。12 個 λ₃×p 組合＋1 個逐聯賽組合全部唔過，且十三個組合逐季都輸返。最好者純 BP λ₃=0.15 + p=0.005（RPS 0.20517、ECE 0.01080、OU 0.68724）格LL 仍退到 2.9507，主閘 2/3；p↑ 對角吹過實際和局率（0.2802）、和眾數升到 87%，試驗 1「齊唱和」失敗樣重現。裁決停、唔升指紋，聯合分佈層（試驗 1–4）收工。結果 data/research/s25/dibp_on_bp_result.json、腳本 scripts/research/dibp_on_bp_s25.py、本地 research/dibp_on_bp_s25.py
- [x] 產品微調還原：取消波膽大字跟 1X2 傾向分區，回復全矩陣最可能一格；凍結矩陣、對帳、訓練不變（2026-09-15）
- [x] 試驗 5 動態攻防（攻守兩條獨立隨機遊走、各自精度）：粗掃 24 組合（tau0=5/10/25、q=0/0.0001/0.0005/0.001、obs_scale=0.5/1.0）全部唔過閘，最好 RPS 0.20551（輸基準 0.20524）、格LL 2.9396（稍贏）、ECE 1.309%（輸基準 1.099%），主閘 1/3，逐季輸返。q=0 時精度只增不減、係數凍結，和眾數 99.9–100%；q 稍大則過擬合。裁決停、唔升指紋。S25 五把試驗全部唔過，模型線暫停，轉產品線等賽果對帳。結果 data/research/s25/dynamic_ad_result.json、腳本 scripts/research/dynamic_ad_s25.py、本地 research/dynamic_ad_s25.py
- [x] 產品文案：凍結卡波膽大字下加註「最可能比分 ≠ 勝方，頂格通常 10–20%，係最不意外嘅比分」（回應用戶提問，唔涉模型）
- [ ] 場次 Δλ 倉：δ_名單（官方名單公布先寫）、δ_密度、Δλ_市場（只做殘差診斷）；缺資料一律 Δλ = 0 退回基準
- [ ] 球員層資料前置：分鐘、賽前 projected xG、撲救、公布名單時間戳；未齊唔碰凍結
- [ ] 禁止列不變：殘差、ρ(λ)、逐聯賽 μ、ξ、κ、Rue–Salvesen γ、疊加、單格命中訓練、賠率入模

### S35 每日採集停更修正（2026-09-16）
- [x] 症狀：站上賽程停留 9-14 23:53 批（190 場），9-15 之後場次全失
- [x] 真因：scripts/log_predictions.py late_ingest 判斷內重複 `from datetime import datetime` → 函式內 datetime 變局部變數 → 第 59 行 UnboundLocalError；該步 fail 令「入倉」step 唔跑，抓到嘅賽程／賽果／凍結預測從未 commit（9-15 四次 run 全同一死法）
- [x] 修正：刪局部 import，推資料倉庫並手動重跑 football daily ingest → success，upcoming.json 已更新
- [x] ClubElo 502 非主因（continue-on-error，符合對帳層唔擋凍結規則）
- [x] 上游 fixtures.csv 只滾動未來約一週（現時 30 場：9-15/16/17），未開賽 10 場係真數，週末五大場次等上游放出
- [ ] 待辦：加 watchdog——若 upcoming.json last_success 超過 12 小時就開 issue（今日未做）
- [x] 凍結預測、鎖定政策、版本指紋一分未動

### S36 球員資料層（2026-09-16，只開資料層）
- [x] 源探測：API-SPORTS 免費層 /players/squads 當季名單＋官方相片連結可讀（實測 63 名球員全有 photo）；/injuries 只包 2022–2024；當季 fixtures／lineups 唔包。apifootball.com 當季 get_events 帶 lineup 物件，但冇公布時間戳
- [x] data/context/ schema_version 2：新增 players.jsonl、injuries.jsonl（只附加、永不 UPDATE、缺資料＝missing）
- [x] 相片只存連結，唔重新託管；photo_license 未確認＝唔准上前台；無授權站（Forza 一類）唔抓唔直連
- [x] 當季名單時間戳：ingest_lineups.py --source current 走 apifootball，只記 lineup_observed_ts（首次見到齊 11 人，保守上界），未公布寫 missing 繼續輪詢
- [x] 合格閘：as_of／observed_ts 要早過開賽前 60 分鐘，否則 late／missing → Δλ=0 退回基準、紅燈可查唔入戰績
- [x] 當季傷停免費層拿唔到 → missing 佔位，唔准用上季／平均／上仗頂替
- [x] 配額紀律：每日滾動 ≤20 隊（100 請求／日上限），五大 96 隊約五日一輪
- [ ] 未做：δ_名單／δ_密度估計、球員前台頁、穩定分鐘與門將撲救採集器（LGB 兩個 Poisson λ 見 S19）
- [x] 凍結預測、每日凍結流程、版本指紋一分未動

### S37 對外只報主／和／客（2026-09-16）
- [x] 產品口徑：卡面、逐場對帳、球隊頁一律只報三格（P_H／P_D／P_A ＝ 同一張凍結矩陣加總），預測字改用 argmax(P_H,P_D,P_A)，唔再用比分眾數
- [x] 波膽收入摺疊區只作診斷；唔另訓 1X2 分類器（避免同舊頁、舊凍結分叉）
- [x] 舊 5% 近盤判和展示閘（leanSide）唔再用喺卡面
- [x] S26 研究量表：|P_H−P_A| < 0.03／0.05／0.08／0.12 分桶，量實際和局率對實際主勝率、對平均 P_D、對 argmax 命中率（已鎖凍結帳 190 場）
- [x] 裁決：三閘全部唔過（gap<0.05：實際和 25.0% 對主勝 40.0%、平均 P_D 26.9%、argmax 命中 35.0% 對硬出和 25.0%）→ 「近盤出和」唔入產品、唔改指紋
- [ ] 樣本累積到 ≥200 場近盤場再重量一次；τ 規則未過閘前永不寫入凍結
- [x] 凍結矩陣、對帳、訓練、指紋一分未動

### S26b 和局預測回測（2026-09-16）
- [x] 五大聯賽 46,903 場、評分季 ≥2021 共 8,649 場，λ 層鎖死＝現行生產軌
- [x] 第一層（只改標籤）：argmax 51.47%；主客距離閘、和局加權、弱勢閘全部跌命中率（最多跌到 39.7%），和局精確率 27.9–29.3% ≈ 基礎率 25.4%（冇識別力）
- [x] 第二層（改機率，和局對數機率平移 δ）：δ 0.05–0.60 主閘全數唔過（RPS 0.20525→0.21009、ECE 1.08%→2.66%），逐季亦輸返
- [x] 診斷：P_D 已校準（平均 24.82% 對實際 25.39%、ECE 1.08%）；最高 P_D 一成場次實際仍主勝 39.0% > 和 26.8% → 和局無法成為正確眾數
- [x] 裁決：維持 argmax，唔加出和規則、唔平移機率、唔升指紋
- [ ] 唯一准許展示做法（待決定要唔要落）：|P_H−P_A| < 0.08 加「三揀接近 · 和局機率偏高」標籤，唔改預測字
- [ ] 要令和局有識別力只可加新資訊（名單／密度／projected xG）落 Δλ 條件層再過三主閘

## S38 第二層推薦結算（2026-09-16）
- [x] 分層：第一層只出凍結矩陣加總三格（對 RPS，一分不動）；第二層只出一句結算，唔改三格／λ／矩陣／指紋，盤＝0
- [x] 決策互斥三類：一面倒 max(P_H,P_A)≥τ → 強隊 −1；近盤 |P_H−P_A|≤δ → 弱隊 +1；其餘 → 較高嗰邊直勝（唔出和，卡上寫明）
- [x] τ／δ 由凍結 walk-forward 揀（46,709 場、評分季 ≥2021 共 8,464 場，掃 τ∈{.60,.65,.70,.75}×δ∈{.05,.07,.10}）：τ=0.60、δ=0.10 寫死，一季只准改一次
- [x] 主閘＝推薦堆校準（隱含贏率 vs 實際，≤2 點）：近盤 +1 過（0.61 點）、其餘過（2.1–2.4 點）、強隊 −1 唔過（4.25–9.83 點，逐季一致高估）
- [x] MINUS1_GATE_PASSED=false：一面倒場退回強隊直勝，−1 只作卡面旁註並寫出高估幅度
- [x] 產品：src/lib/footballSecondLayer.ts、賽前預測卡第二層卡、凍結帳卡結算行、對帳頁第二層獨立戰績欄（贏／走水／輸、隱含 vs 實際、三類覆蓋）
- [x] 戰績分兩欄：1X2 對三格、第二層對結算；−1／+1 贏唔當 1X2 中
- [ ] 累積綠燈已鎖完場樣本後重量一次 −1 校準；過 2 點閘才考慮開 MINUS1_GATE_PASSED（一季一次）

## S39 停賽自動偵測 ＋ 賽果入帳狀態（2026-09-21）
- [x] /api/public/meeting-cancellation：人手覆核檔 → 馬會公告關鍵字 → 賽日結構（排位表 0 場／0 匹，只查當日或過往）→ 正常賽日；上游失敗回正常賽日並標 source=unknown（守舊唔誤報）
- [x] 人手覆核檔位置 tianxi-database data/meeting-status/YYYY-MM-DD.json（2026-09-19 已存檔並實測命中）
- [x] useMeetingCancellation 成為全站唯一停賽真相（60 秒 stale／5 分鐘重抓）；硬編碼名單降為離線 fallback
- [x] 通告分兩級：已確認停賽（紅）／疑似停賽（黃，待官方確認）；兩者一律不生成、不鎖定、不入戰績
- [x] 足球對帳加第四狀態「待賽果入帳」（開賽逾 3 小時未 join 賽果）：寫明上游賽果檔未更新、賽果一到自動結算、凍結預測唔補算
- [ ] 後端 tianxi-backend：CANCELLED_MEETING_DATES 改讀 meeting_status（append-only），每 5 分鐘鎖點檢查同一條 cron 命中即跳過 writePredictionLog
- [ ] 上游 90 分鐘賽果檔（football-data.co.uk）更新後核對 09-18～09-20 共 198 場自動入帳

## 2026-09-22 解釋層第一刀 + 抓取修復
- [x] tianxi-database 四個工作流修好瀏覽器／驅動版本不配對（setup-chrome install-chromedriver），每日賽果流程重跑 success
- [x] /explain 全局分層覆蓋頁（349 場、平均 2.04／4、分層 + 兩頭殘差；<10 場標樣本太少）
- [x] /explain/:date 逐場拆解（凍結四揀 vs 實際頭 4 重疊，唯讀，唔改排名）
- [ ] 引擎倉 lgb_walkforward.py 加 TreeSHAP + explain_log（append-only、fail-closed），前端先顯示紅綠五因子
- [ ] 解釋層改接 GET /api/explain/global、GET /api/explain/meeting?date=（現讀倉內 JSON）

- [x] 2026-09-24 對齊收口：/explain 即場讀 hit-rate（頭條 358 場、平均 2.03／4、窗至 09-23；分層表／殘差寫死「只計至 09-16，349 場」，兩套數分開標）；/explain/2026-09-23 九場全出（只中 2,1,1,2,1,3,2,2,1、平均 1.67）；新增 /football/explain（綠燈 28 場、首選 71.4%、頭八格 50%、RPS 0.2081、ECE 0.1547）；正式站 tianxi.racing 瀏覽器等 hydration 核對，三條路由同預覽一致。預測指紋不變。
- [x] 2026-09-24 賽季橫額改讀 /api/season（tianxi-site assets/engine-health.js，commit c78cd22）：賽季標籤優先取 API 嘅 status／lastMeeting／nextMeeting／label，in_season 唔出「休季中」、off_season 先出休季句；API 失敗先 overlay 靜態 engine/health.json，唔會因靜態檔滯後成頁當休季；純讀取唔寫唔快取做凍結帳；同段修正渲染函數名筆誤 ess→esc。預測卡／凍結四揀／鎖定／指紋／解釋入口無改。
- [x] 收料層（tianxi-database）：賽果抓取跳過條件改場號集合（CSV 已排位場號 == 馬會實際場號兼連續 1..N，每場至少有完賽名次），停用行數／連結數門檻；09-23 補齊 9 場 109 名次
- [x] 命中率自動重算（tianxi-backend）：已評場數 < 有完整頭 4 場數、或賽果新過 hit-rate generatedAt 即重算；GET 讀取同 cron 都做檢查；只重算對帳，凍結四揀不動；賽果未齊唔評（fail-closed），手動重跑降級後備
- [x] 引擎倉季節旗 lastMeeting 滯後：靜態檔已改 2026-09-23／in_season，橫額以 /api/season 為準（用戶倉側完成）
- [x] 2026-09-24 足球 S5.1 TreeSHAP 真數（研究倉 tianxi-football-research data/research/s39/lgb_shap.json，commit f91e60d）：沙盒用資料倉 FeatureEngine 重放 198,288 場（177,207 場暖身後），取最新 4,000 場計 TreeSHAP；status=ok、指紋 378c283b73a7-bb35e29b0c7b-175995 對上、54 特徵、applied_to_freeze=false；gain 頭五 dc_pa／elo_exp／elo_diff／lam_diff／seen_a；per_class（主=Elo 系、客=dc_pa、和=dc_pd 幅細，同 S26b「LGB 分唔出和」一致）＋ per_league（五大頭三幾乎同一套，德甲窗追溯到 2021-10 較早、唔當可直接比）已加。研究擴充閘過；產品 overlay 閘未過——無逐場 local 因子包、只解釋 LGB 65% 軌、Elo／DC 共線未拆，前端紅綠因子唔上。沙盒計算路徑代替 GHA（GITHUB_API_KEY 係 connector key，Actions 用唔到）；lgb_shap_compute.py 三分類 SHAP 維度 bug 已修（commit 1645560）。
- [x] 賽馬 SHAP：已過閘（2026-09-27）。2026-09-24 已定位障礙——生產 workflow（lgb_predict_upcoming.yml）原本只 POST 分數入 D1，樹檔（model-bundle/model.txt + meta.json）只入 Actions cache 唔入 artifact；已改 workflow 把 model-bundle 加入 upload-artifact。09-27 由 artifact 攞到鎖點 booster 跑 shap_knife2.py 出 reports/shap/latest.json，status=ok、指紋對上；產品 overlay 閘未過，前端紅綠因子唔上

## 2026-09-24 賽馬鎖點 bundle
- [x] lgb_predict_upcoming.yml 加「Verify lock-point bundle」：缺 model.txt／meta.json／特徵檔、booster 特徵名 ≠ meta.featCols、特徵檔缺欄即 fail；寫 lock-manifest.json（run_id、sha256、bundleFingerprint）入 artifact（tianxi-backend c3c80ea）
- [ ] 研究員 AI 問答摘要：待用戶決定做唔做

- [x] 2026-09-25 命中率自動重算兩條觸發（已評場數<有頭4名次場數；賽果行數多過上次快取）已部署網上引擎（hit-rate 讀取＋每日 03:00 排程），09-23=9、09-16=8 核對不變；race_results 冇入庫時間欄，改用行數做第二條。
- [ ] 儀表板首次載入慢：引擎今日預測回應約 15 秒（非容量／付費問題）。已加伺服器端 stale-while-revalidate 暫存（新鮮 60 秒、舊資料最多 15 分鐘背景更新），之後每次開都係即出；冷啟動第一次仍然要等，要再快就要縮短預測生成本身。

- [x] 2026-09-25 tianxi-backend 網上版 vs GitHub 逐檔對齊：34 個檔格式化後比較，除 index.ts 外全部一致（其餘差異只係打包雜訊）。index.ts 差異源於 f649364／72ede95 兩個自動部署撞車，舊版後上線，令每日 03:00 追補最近 8 個賽日未生效；已重跑 72ede95 部署，網上已含追補。GitHub 由此起即係網上版本（push main 自動部署）。
- [x] 2026-09-25 lgb_fast_predict.yml（後備補分流程）修正並生效：根因係三段內嵌 Python heredoc 由第一格開始寫，成個 YAML 無效，自 09-13 建立以來從未運行、每次 push 即標失敗；三段代碼按層縮進，指令一字未改，YAML＋bash 雙重驗證通過。推 main（commit 9dd8bca）後 GitHub 認到流程名，手動試跑 success——非賽日正確判斷唔使補分、carry 步驟跳過。已鎖四揀由 prediction_log 凍結層保護，α／訓練／四揀無改。賽日日間每 30 分鐘（HKT 06:00–18:30）自動檢查覆蓋。
- [x] 2026-09-25 足球全部頁精修（純展示）：共用分頁導航（總覽／賽前預測／預測 vs 賽果／回測／積分榜／引擎／覆蓋解釋）、卡片／數字格／篩選按鈕統一新樣式、賽前預測載入改灰色輪廓；凍結機率、指紋、API 無改
- [x] 2026-09-25 足球首頁「預測 vs 賽果」精簡列表及彈出詳情加入主客隊徽；官方隊徽載入失敗即退回現有派生盾牌，凍結資料與對帳口徑無改

- [x] 2026-09-25 足球首頁：公開對帳六格改用統一線條圖示；預測 vs 賽果改主客上下排、比分對齊、隊徽補齊（皇馬錯配、雷加利斯缺徽已修）

- [x] 2026-09-26 足球「預測 vs 賽果」：手機計分板（隊徽／隊名／比分／中否對齊）、聯賽＋日期下拉篩選
- [x] 2026-09-26 AI 賽後解說暫時收起（用戶決定）：已移除 MatchExplain 組件同 /api/public/football-match-explain 端點，慳 AI 額度；凍結列同對帳口徑無改
- 2026-09-26 「AI 賽後解說」擱置（用戶決定，唔係取消設計）：完整設計同重開規則保留喺 docs/football-match-explain-design.md；上線穩定後先加，届时走唔耗 AI 額度嘅生成路徑（離線細模型或規則式模板），並喺完場後自動跑一次。
- [x] 2026-09-26 足球頁版面統一：新增共用展示組件（計分板 CrestScoreboard、凍結機率橫條 ProbBars、版本指紋格 FingerprintChip），賽前預測、預測 vs 賽果、球隊頁凍結帳、Coverage 頁統一用同一套卡片、隊徽同手機排版；賽前預測右欄改顯示預期入球 λ，指紋改一行、裝唔落可左右撳。凍結數值、模型、API、鎖定規則同戰績計算無改。

- [ ] 讀取用戶 Google 分享連結 https://share.google/aimode/AZEWXChuu8aDrrmAv 內容

- [x] 2026-09-29 足球雙引擎 dual-v1：定參數、鎖定帳（T−60 只增不改）、賠率來源（馬會→Bet365→平均）、結算、戰績頁
- [x] 2026-09-29 賠率多來源後備（Bet365／Betfair／BetVictor／Bet&Win／Betfred／Paddy Power／Sky Bet／平均／最高）＋冇賠率延遲重試
- [ ] 馬會足智彩賠率接口（要白名單，等馬會開放）

- [x] 2026-09-30 賽馬儀表板新增 closeGap 分位追蹤卡：H-R2 報告 18 場快照 p10–p90 分位圖、次序統計量 95% 區間投影 200 場收窄、快照累積進度（18/200）同 lock-tick 實測準備（下一賽日、T−90 鎖點倒數、補寫規則清單）；研究展示層，closeGap 維持 null
- [x] 2026-09-30 全站用語統一：足球雙引擎混合投票結果改稱「雙引擎預測」（戰績頁、產品流程卡、引擎註釋、研究文件），唔再用「出字」；dev-log 舊條目保留原記錄

- [x] 查 BSD 收費方案功能

- [x] BSD T−60 陣容快照 + 完場對比（研究軌）
- [x] 足球逐場陣容詳情頁（球場圖、後備、缺陣、BSD 對照）
- [x] 研究 numbertwenty.io 技術（統計鄰居應得結果）
- [x] 雙引擎詳情頁 numbertwenty 版式 + 因子表 + 本地賽前解說
- [x] BSD 快照穩定性監控卡（回應時間、完整度、對比準確率）
- [ ] 研究閘：預測缺陣主力（等一季快照）

- [x] 足球賽前情報／賽後數據收錄 + 因子特徵表（研究軌，權重 0）

- [x] 賽馬後端：補收 10-01 賽果／場次；修 hit-rate-rollup 近 90 日搵唔到賽馬日；追補 10-01 對帳（唔改凍結四揀）
- [x] 2026-10-02 賽後後備補跑：收賽果加 HK 01:30／04:30／09:30 三次補跑（已收齊自動跳過）；D1 同步加 06:23／10:23 補跑，寫入改重複即略過＋撞忙重試
- [x] 足球頭版近期賽程／預測 vs 賽果改用雙引擎 dual-v1
- [x] 2026-10-02 收賽果準時觸發：根因係 GitHub 自帶排程遲跑；改由後端定時任務每日 HK 23:31／01:31 主動觸發 capy_race_daily（完成後 D1 同步自動接力），原 GitHub 排程留作後備
- [x] 2026-10-02 足球內頁統一雙引擎：逐場對帳卡、隊伍頁預測及命中改用 dual-v1（缺 λ 先退凍結三格並註明）；凍結數值不變
- [x] 2026-10-02 骨架屏核對：有載入資料嘅頁全部有骨架／載入畫面，其餘為靜態頁
- [ ] lock-tick 第二次實測：等下個賽馬日
- [ ] F-R2 入 S5：要喺研究倉跑 ens_s5.py 全閘，結果交用戶拍板
- [x] 會員收費閘：用戶 10-02 撤銷「價值注回測未轉正唔開收費」規則；負數回測照常公開展示

## 2026-10-02 宣傳素材與 iOS 上架準備
- [ ] 20 秒直式宣傳片（真實介面＋品牌動態）
- [ ] 社交海報 1080×1350
- [ ] App Store 介紹圖 3 張
- [ ] App 介紹及上架文字
- [ ] iOS 技術準備與審核清單
- [ ] Files collection 整理

## 2026-10-02 足球總覽緊急修正
- [x] 查明「預測 vs 賽果」停留 09-26：舊月誌欠鎖定時間，已改同正式 dual-v1 鎖定帳合併，補回 09-29／09-30 已結算場次
- [x] 即時戰況只顯示可同正式鎖定帳安全配對嘅五大聯賽場次，球隊名轉繁中並補隊徽，避免同名聯賽誤標英超
- [x] 即時戰況旁展示該場正式 dual-v1 系統預測賽果
- [x] 修正足球卡片及版本指紋邊框裁切
- [x] 球隊名與隊徽放大並改為視覺置中對齊，手機不重疊

## 2026-10-03 全產品資料同步
- [x] 足球正式鎖定帳、陣容快照、完場對比：寫入即時同步 tianxi-football，已補 9–10 月
- [x] 賽馬／六合彩：網站直接讀倉庫資料（倉庫為唯一來源）
- [ ] 天氣：維持每晚同步（每 5 分鐘一筆，逐筆推送會過多）

### 2026-10-06 產品化藍圖第一批（用戶批：T−6h／$100／改良2+4+7+8／圖表監控）
- [x] 改良5：足球鎖定 T−60 → T−6h（只影響新場次；BSD 快照同步提前；狀態燈收斂綠／紅）
- [x] 改良6+8：足球平注 $10 → $100（定版日起新版本計）；model_versions 表＋版本化戰績展示
- [x] 改良2+4：足球前端只出馬會有盤賽事篩選＋gofootball.ai 式卡片
- [x] 改良7：賽馬各彩池 $10 官方派彩表（2026-10-07 完成：兩頁直接讀 tianxi-racing 每日派彩檔，千位逗號漏讀已修，歷史賽日即出數）
- [x] ECharts 動態圖表（策略盈虧曲線、足球趨勢）＋監控端一屏展示
- [x] 設計規範：參考 break-ui skill（最壞真實數據壓測 UI：長隊名、空態、千條規模、320px、深色、RTL；先報告再修）同 motionin.design 動效畫廊
- [x] Telegram 告警：待用戶提供 bot token

## 2026-10-06 藍圖第一批進度
- [x] T−6h 鎖定 + $100 注碼 + model_versions + 帳本 stake 欄（migration 已套用）
- [x] 馬會有盤篩選 API + 賽程頁篩選/標記
- [x] race_dividends 表 + 賽果頁派彩展示位
- [x] ECharts 盈虧曲線（strategy-pnl）
- [x] admin 監控端頂部加「一屏總覽」（引擎健康／數據完整性／同步狀態／最新賽果日期）
- [x] 足球公開對帳頁加逐季 RPS 趨勢圖（ECharts，S5 vs S4＋命中率柱）
- [x] break-ui 最壞真實數據逐頁驗收（足球總覽／賽程／對帳／戰績，320px＋200% 縮放＝210 CSS px 實測）：修 4 項——窄位頂欄「升級 Pro」縮星形圖示、品牌字收起；鎖定帳新舊版淨盈虧統一一位小數；超長隊名右緣加淡出提示（OverflowTicker mask）；篩選零結果改明顯空白卡＋「清除全部篩選」掣。扛得住：320px 無溢出、無 NaN、無賠率場正確標示、香港時間一致
- [x] Telegram 告警已接通
- [ ] 未翻譯隊名每日檢查（自動化待排）

## 2026-10-06 足球三倉合一
- [x] tianxi-football-database 改名 tianxi-football 統一倉（舊網址 GitHub 自動轉址 301）
- [x] engine／backend 倉說明併入 docs/engine-scope.md、docs/backend-scope.md，統一倉 README 更新（鎖定線字眼改 T−6h）
- [x] 舊 engine／backend 倉封存（archived），README 指向新倉
- [x] 網站程式、文件、dev-log 全部舊倉名引用更新；資料同步（githubMirror）改指新倉並補跑驗證
## 2026-10-06 五倉制合一
- [x] 賽馬：tianxi-database → tianxi-racing 統一倉；後端 110 檔＋15 workflow 遷入 backend/（working-directory、密鑰 CLOUDFLARE_*、watchdog 對應檔名、無 checkout job 修正）；部署 workflow 成功；engine_sanity 派手跑通過（ADMIN_TOKEN_2 生效）
- [x] 六合彩：hk-mark-six-2002-now 數據＋每日收料/監控 workflow 併入 tianxi-marksix/data-history/
- [x] 研究：tianxi-football-research → tianxi-research（涵蓋賽馬、足球、六合彩）
- [x] 舊倉封存：tianxi-backend、hk-mark-six-2002-now（README 留轉址說明）
- [x] 網站引用更新（weather-sync／meeting-cancellation／race-results-dispatch／telegramAlert／ProductDashboard）
- [x] 天喜前端倉 tianxi-frontend 已建立並推送 604 個源碼檔；舊倉 tianxi-backend、hk-mark-six-2002-now、tianxi-football-backend、tianxi-football-engine 已核對內容後刪除
- [x] 2026-10-06 tianxi-site 96 個檔併入 tianxi-frontend/legacy-site/ 後刪除；修正六合彩資料、H-R2 報告、首頁連結改指新倉

## 2026-10-07 六合彩派彩／賽馬健康／回測
- [x] 六合彩每日派彩收料（tianxi-marksix dividends.mjs＋每晚 workflow），2002 起 3,435 期回補；新頁 /marksix-results 派彩＋15 碼預測 vs 賽果
- [x] 賽馬後端健康頁 /racing-health：最後派彩收料、8 項定時任務、Telegram 通道（唔通即紅條）
- [x] 賽馬訓練數據與回測頁 /engine/backtest：引擎 vs 隨機 vs 市場、4 揀複式回報
- [x] 修 10 個仍指向已刪舊倉嘅賽馬定時任務（賠率、Elo、預測、D1 同步等）；賠率、Elo 重跑成功，下一賽日預測重跑已過出錯步驟
- [x] 六合彩「預測 vs 攪珠結果」（改名）：揀期數 → 引擎獎級＋派彩，同隨機 15 碼對照
- [x] 回覆：賽馬／足球賽前鎖定邏輯深度核對（足球「等賠率」可令鎖定時刻由 T−6h 推遲至 T−20，待用戶拍板）
- [x] 足球鎖定拍板執行：到 T−6h 即鎖預測，搵唔到賠率標「無賠率」（照計命中率、唔計盈虧），唔再等至 T−20；刪除 waiting_odds 分支

- [x] 足球預測目標卡（雙引擎 56.1% vs 隨機 33.3% vs 市場熱門 61.4%）
- [x] 足球 Elo 成分重訓：已出候選 elo-v2（見下）
- [x] 足球基準快照任務修復（補 contents:write 權限，2026-10-07 重跑成功）
- [x] 足球 Elo 重訓候選 elo-v2（研究閘過，回測頁展示；未併入凍結 S5）
- [ ] elo-v2 併入 S5 重訓並開新指紋——等用戶拍板（新版本成績獨立計）

- [x] 2026-10-07 足球升 dual-v2（Elo 換 elo-v2），戰績只計新版，舊版歸檔
- [x] 2026-10-07 賽馬孖T／三T 二拖三計算卡、預測 vs 賽果最終賠率、足球近期賽程改 numbertwenty 式

## 藍圖新增修改要求（2026-10-07 收）
- [x] 賽馬鎖定第 5 選：凍結紀錄本身存全場排序，命中率接口公開 predictedFifth，孖T／三T 卡優先用凍結第 5 選
- [x] 監控端按 shadcn-admin 架構重構：/admin/overview、engine-health、data-freshness、prediction-lock、model-versions、pnl、users-membership、logs、settings（側欄＋頂欄＋全局搜尋）
- [x] 監控端視覺：TianXi x Linear 深色精密風（#0B1612 底、金 #D4A11E、hairline 邊、12px 卡角）
- [x] 監控端表格用 TanStack Table、圖表用 ECharts
- [x] 開發環境專用「Demo data／Worst case」切換器（底部置中，正式站移除）
- [x] 所有 admin 頁跑 break-ui 最壞數據驗收，先報告再修
- [x] 克制 micro-interactions：數字 count up、健康燈 soft pulse、表格行 hover、鎖定狀態轉場
- [x] 改藍圖後同步更新腦圖、路線圖、前後端監控端說明、GitHub 源碼同產品說明（docs/blueprint/）
- [ ] 會員頁接 Whop（等 API key）
- [x] 足球賽前預測頁嚴格只出馬會有盤（讀唔到盤口即不列場次）— 2026-10-07
- [x] README 改為天喜產品說明 — 2026-10-07
- [x] 兩份互動腦圖 /mindmap/ui.html、/mindmap/flow.html — 2026-10-07
- [x] 監控盈虧頁加日期區間＋足球主／和／客篩選 — 2026-10-07
- [x] 監控日誌加級別／搜尋／成功任務；設定頁加接口實測與營運規則 — 2026-10-07
- [x] 路線圖清走重複項目 — 2026-10-07

- [x] 2026-10-08 監控端盈虧：孖T／三T 併入賽馬累計曲線、日期篩選及分池格
