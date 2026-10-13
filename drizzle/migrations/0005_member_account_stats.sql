-- 監控端會員人數統計：只有 admin 可讀，供免費階段 500 人門檻跟蹤使用
CREATE OR REPLACE FUNCTION public.member_account_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  SELECT jsonb_build_object(
    'total', COUNT(*)::int,
    'confirmed', COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL)::int,
    'last7', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '7 days')::int,
    'last30', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '30 days')::int
  )
  INTO result
  FROM auth.users;
  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.member_account_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.member_account_stats() TO authenticated, service_role;
COMMENT ON FUNCTION public.member_account_stats() IS '監控端專用：登記帳戶人數統計（免費階段 500 人門檻進度），只有 admin 可呼叫。';