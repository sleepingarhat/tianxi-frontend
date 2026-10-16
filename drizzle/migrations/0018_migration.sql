CREATE OR REPLACE FUNCTION public.my_membership()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE me uuid := auth.uid(); my_rank int; gate_at timestamptz; total int;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT r INTO my_rank FROM (SELECT u.id, ROW_NUMBER() OVER (ORDER BY u.created_at, u.id) AS r FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.member_test_accounts t WHERE t.user_id = u.id)) q WHERE q.id = me;
  SELECT u.created_at INTO gate_at FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.member_test_accounts t WHERE t.user_id = u.id)
    ORDER BY u.created_at, u.id OFFSET 499 LIMIT 1;
  SELECT COUNT(*)::int INTO total FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.member_test_accounts t WHERE t.user_id = u.id);
  RETURN jsonb_build_object('rank', my_rank, 'gate_open_at', gate_at, 'total', total);
END; $$;