CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 公開：只回傳已註冊人數，唔回傳任何個人資料
CREATE OR REPLACE FUNCTION public.public_member_count()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*)::int FROM auth.users
$$;
GRANT EXECUTE ON FUNCTION public.public_member_count() TO anon, authenticated;

-- 登入者自己嘅會籍：註冊名次、開閘時間（第 500 名註冊時間）
CREATE OR REPLACE FUNCTION public.my_membership()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me uuid := auth.uid();
  my_rank int;
  gate_at timestamptz;
  total int;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT r INTO my_rank FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS r FROM auth.users
  ) t WHERE id = me;
  SELECT created_at INTO gate_at FROM auth.users ORDER BY created_at, id OFFSET 499 LIMIT 1;
  SELECT COUNT(*)::int INTO total FROM auth.users;
  RETURN jsonb_build_object('rank', my_rank, 'gate_open_at', gate_at, 'total', total);
END; $$;
REVOKE EXECUTE ON FUNCTION public.my_membership() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.my_membership() TO authenticated;