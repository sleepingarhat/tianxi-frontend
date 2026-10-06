-- 版本化成績 + 注碼升級 + 賽馬派彩表（藍圖改良 6/7/8）

create table if not exists public.model_versions (
  version text primary key,
  engine text not null,
  fingerprint text,
  released_at date not null,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now()
);

GRANT SELECT ON public.model_versions TO anon, authenticated;
GRANT ALL ON public.model_versions TO service_role;

alter table public.model_versions enable row level security;

drop policy if exists model_versions_public_read on public.model_versions;
create policy model_versions_public_read on public.model_versions
  for select to anon, authenticated using (true);

insert into public.model_versions (version, engine, fingerprint, released_at, status, notes) values
  ('tx-oracle-v3.2', 'racing', 'a85-2026-09', '2026-09-01', 'active', '賽馬四揀引擎：LightGBM LambdaRank 融合 Elo，α=0.88 在線混合；T−90 鎖定。'),
  ('dual-v1', 'football', 'dual-v1-2026-09-29', '2026-09-29', 'archived', '足球雙引擎首個定版：A 凍結三格 + B 預期入球對角膨脹，50/50 混合和率；平注 $10。'),
  ('dual-v1s100', 'football', 'dual-v1-2026-09-29', '2026-10-06', 'active', '同一雙引擎數學，注碼規則升級：平注 $100，鎖定線 T−6h；舊 $10 紀錄保留展示。'),
  ('mingpan-v1', 'marksix', 'mingpan-2026-09', '2026-09-01', 'active', '六合彩命盤排盤：干支、藏干、十二長生、三合三會經測試集核對。')
on conflict (version) do nothing;

-- 足球帳本注碼欄：舊行預設 $10，新行由鎖定程序按日期寫入
alter table public.football_dual_ledger
  add column if not exists stake integer not null default 10;

-- 賽馬派彩表：由賽馬後端每個賽馬日賽後寫入，前端只讀；只增不改
create table if not exists public.race_dividends (
  id bigint generated always as identity primary key,
  date date not null,
  venue text not null,
  race_no integer not null,
  pool text not null,
  combo text not null,
  dividend numeric not null,
  unit integer not null default 10,
  created_at timestamptz not null default now(),
  unique (date, venue, race_no, pool, combo)
);

GRANT SELECT ON public.race_dividends TO anon, authenticated;
GRANT ALL ON public.race_dividends TO service_role;

alter table public.race_dividends enable row level security;

drop policy if exists race_dividends_public_read on public.race_dividends;
create policy race_dividends_public_read on public.race_dividends
  for select to anon, authenticated using (true);
