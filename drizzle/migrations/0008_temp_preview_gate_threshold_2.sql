-- 暫時（預覽測試用）：收費閘門檻由第 500 名改為第 2 名，方便喺預覽試付款流程。
-- 試完之後會還原返 OFFSET 499。正式站未發布前唔會受影響。
CREATE OR REPLACE FUNCTION public.my_membership()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
  SELECT created_at INTO gate_at FROM auth.users ORDER BY created_at, id OFFSET 1 LIMIT 1;
  SELECT COUNT(*)::int INTO total FROM auth.users;
  RETURN jsonb_build_object('rank', my_rank, 'gate_open_at', gate_at, 'total', total);
END;
$$;