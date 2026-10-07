<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## 足球展示層規則

- 足球各頁嘅卡片排版一律用 `src/components/tx/FootballMatchUI.tsx` 嘅共用組件（`CrestScoreboard` 計分板、`ProbBars` 凍結機率橫條、`FingerprintChip` 版本指紋格）：隊徽／隊名／右側數字欄各自對齊成一直行，手機版先決。理由：之前每頁各自寫一份，导致隊徽同排版逐頁漂移。
- 展示層改動唔准碰凍結數值、版本指紋、模型、API 同開賽前鎖定／戰績計算規則。
- 獨立足球研究腳本同輸出留喺 docs/research，唔入應用運行路徑；只有研究倉真實凍結矩陣通過逐季主副閘先可提案升指紋，避免代理模型冒充生產成績。
- 足球逐場研究頁只載入經離線匯出嘅賽前代理資料，權重滑桿僅作情境試算、傷兵無快照時停用；同正式 S5 凍結預測完全隔離，避免以事後調權冒充已驗證模型。
- 足球雙引擎 dual-v1 喺凍結三格之上出字（src/lib/footballDualEngine.ts）；鎖定帳 football_dual_ledger 只增不改，由每 15 分鐘定時任務 T−6h 寫入，到點即鎖、搵唔到賠率標「無賠率」唔再等（2026-10-06 前舊場次為 T−60，歷史帳不改）；同日注碼由 $10 升為 $100，帳面 stake 欄為準。理由：出字層獨立版本，唔郁凍結矩陣。
- 模型版本統一登記喺 model_versions 表（version／engine／fingerprint／released_at／status）；每次定版或注碼級規則改動要新增一版，舊版標 archived，成績按版本獨立計、唔回填。理由：研究還研究、版本還版本，戰績可追溯。

## 首頁產品層規則

- 首頁係三產品總儀表板，底部只留儀表板／賽馬／足球／六合彩；理由：先產品分流，再於產品內呈現功能。
- 首頁流程只引用已定版或現行資料；理由：產品介紹必須可核對。
- 全站沿用 PageHead、Card、Stat、Table、Seg 與 AppShell；理由：避免逐頁漂移。
- 功能頁桌面寬度按資料量調整，手機單欄；理由：提升密度而不破壞手機流程。
- 每次發布正式站後執行 scripts/sync-frontend-repo.sh，將源碼同步入 tianxi-frontend；理由：倉庫只作鏡像，正式站由 Lovable 發布。
- 每次發布正式站後執行 python3 scripts/sync-frontend-repo.py，將源碼經 GitHub API 同步入 tianxi-frontend；理由：倉庫只作鏡像，正式站由 Lovable 發布。

## 監控端規則
- Admin version notes must wrap in desktop tables and use stacked mobile records; cross-race trio reconciliation reuses ExoticTrioPools separately from the single-race strategy aggregate, to prevent truncated explanations and mixed accounting scopes.
- Blueprint completion audits must distinguish implemented code, verified user flows, missing evidence and superseded decisions in docs/blueprint; route existence and checked roadmap items alone do not prove functional completion.

- 監控端 /admin 為側欄佈局（src/routes/_authenticated/admin.tsx），各頁用 src/components/admin/kit.tsx 嘅 AdminHead／Panel／Kpi／StatusBadge／DataTable（TanStack Table），圖表用 EChart；深色主題只喺 .tx-admin 範圍覆寫 --tx-* 變數。理由：前台品牌唔受影響，監控頁唔再逐頁漂移。
- Demo／Worst case 假資料只經 src/components/admin/fixtures.tsx 嘅 useFixture，並以 import.meta.env.DEV 把關。理由：break-ui 驗收要可重現，正式站唔可以出假數。
- 藍圖現行版本放 docs/blueprint/；改藍圖要同步更新該文件、roadmap、AGENTS、開發者日誌同 GitHub 鏡像。理由：設計說明同代碼唔可以分家。
