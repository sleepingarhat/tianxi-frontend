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



## 首頁產品層規則

- The active homepage and shared navigation expose racing only; archived product paths are gated centrally in product-scope.ts and start.ts to retain history without executing retired features.
- 首頁流程只引用已定版或現行資料；理由：產品介紹必須可核對。
- 全站沿用 PageHead、Card、Stat、Table、Seg 與 AppShell；理由：避免逐頁漂移。
- Offers share FoundingMemberOffer/freeStage to prevent drift; Card headers use minmax text and fixed actions to avoid mobile badge wrapping.
- 功能頁桌面寬度按資料量調整，手機單欄；理由：提升密度而不破壞手機流程。
- 每次發布正式站後執行 python3 scripts/sync-frontend-repo.py，將源碼經 GitHub API 同步入 tianxi-web；理由：倉庫只作鏡像，正式站由 Lovable 發布。

## 監控端規則
- Subdirectories (src/components/admin/, src/lib/ for archived football) have their own AGENTS.md; read before changing files there.
- Public racing P&L supplements the existing four-pool rollup with shared `racingPoolAccounting` cross-race queries, merging daily cost and payout once; missing fifth picks are excluded and post-race substitutes are labelled, so incomplete data cannot masquerade as frozen results.
- Admin version notes must wrap in desktop tables and use stacked mobile records; cross-race trio reconciliation reuses ExoticTrioPools separately from the single-race strategy aggregate, to prevent truncated explanations and mixed accounting scopes.
- Blueprint completion audits must distinguish implemented code, verified user flows, missing evidence and superseded decisions in docs/blueprint; route existence and checked roadmap items alone do not prove functional completion.

- 全站 break-ui 用 scripts/break-ui-matrix.py 覆蓋 320／390／1280、RTL、慢 API 與千人會員；dev-log 會合法提及 NaN／undefined，掃描器不可將說明文字當資料錯誤。理由：驗收要可重跑亦要避免假陽性。
- 外部圖片只可用逐張核實自由授權或書面商用權，頁內須署名並保留 /media-credits；API 圖址不等於授權。
- 藍圖現行版本放 docs/blueprint/；改藍圖要同步更新該文件、roadmap、AGENTS、開發者日誌同 GitHub 鏡像。理由：設計說明同代碼唔可以分家。

- Archived product source and historical documentation are retained, while their repositories and database reads are restricted; this makes suspension reversible without altering frozen records.
- The current blueprint is docs/blueprint/tianxi-racing-blueprint-2026-10-13.md; older blueprints are historical so superseded requirements cannot re-enable retired products.
- Pro entitlement is decided only by src/lib/entitlement.ts (resolveEntitlement), fed by the my_membership DB function and the webhook-maintained subscriptions table; the gate opens automatically at the 500th signup. Why: one rule source for free stage, founding Pro and paid subscriptions.
- Racecourse posters rotate weekly from Wikimedia Commons via a managed HTTP schedule into racecourse_photos (commercial-free licences only, auto-deactivate on licence change); tianxi-web GitHub Actions only monitor the public status endpoint. Why: scheduling stays in the app backend, GitHub mirror stays read-only.

- Homepage data-scale figures come only from racing_results_index, filled by a twice-daily job that counts each tianxi-racing results CSV incrementally (40 files/run). Why: shown numbers stay verifiable and update without manual edits.
- Racing coverage pages share racing-visibility aggregation over frozen hit-rate rows and full closing-result CSVs; position guides exclude same-day/future form and terminal finish positions. Why: paired denominators and pre-race evidence must remain auditable without prediction writes.
- Racing evidence uses fixed read-only prediction_log projections via server functions, with settled-public or existing frozen-public-picks eligibility; version alpha comes from each frozen source, and absent per-version artifacts or component snapshots remain unverified. Why: current settings, mutable as-of tables and today's gates cannot stand in for historical locked evidence.
