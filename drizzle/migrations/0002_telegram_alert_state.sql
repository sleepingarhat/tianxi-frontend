-- Telegram 告警狀態：記錄每個檢查項最近一次發送時間（12 小時去重），
-- 以及自動偵測到嘅 Telegram 接收 chat_id。只由 service role（定時任務）讀寫。
create table if not exists public.telegram_alert_state (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

grant all on public.telegram_alert_state to service_role;

alter table public.telegram_alert_state enable row level security;

-- 無公開政策：只限 service role 內部讀寫，一般用戶不可達。
