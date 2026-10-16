CREATE TABLE public.member_test_accounts (
  user_id uuid PRIMARY KEY,
  marked_at timestamptz NOT NULL DEFAULT now(),
  marked_by uuid
);
GRANT SELECT ON public.member_test_accounts TO authenticated;
GRANT ALL ON public.member_test_accounts TO service_role;
ALTER TABLE public.member_test_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read test accounts" ON public.member_test_accounts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.admin_member_list()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', u.id, 'email', u.email, 'created_at', u.created_at,
    'confirmed', u.email_confirmed_at IS NOT NULL, 'last_sign_in_at', u.last_sign_in_at,
    'provider', u.raw_app_meta_data->>'provider',
    'is_admin', EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin'),
    'is_test', t.user_id IS NOT NULL) ORDER BY u.created_at DESC), '[]'::jsonb)
  INTO result FROM auth.users u LEFT JOIN public.member_test_accounts t ON t.user_id = u.id;
  RETURN result;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_test_account(_user_id uuid, _is_test boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _is_test THEN
    INSERT INTO public.member_test_accounts(user_id, marked_by) VALUES (_user_id, auth.uid()) ON CONFLICT (user_id) DO NOTHING;
  ELSE
    DELETE FROM public.member_test_accounts WHERE user_id = _user_id;
  END IF;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_set_test_account(uuid, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_member_list() FROM anon;

CREATE OR REPLACE FUNCTION public.public_member_count()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COUNT(*)::int FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.member_test_accounts t WHERE t.user_id = u.id)
$$;

CREATE OR REPLACE FUNCTION public.member_account_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT jsonb_build_object(
    'total', COUNT(*)::int,
    'confirmed', COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL)::int,
    'last7', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '7 days')::int,
    'last30', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '30 days')::int,
    'confirmed30', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '30 days' AND email_confirmed_at IS NOT NULL)::int,
    'signedIn30', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '30 days' AND last_sign_in_at IS NOT NULL)::int,
    'tests', (SELECT COUNT(*)::int FROM public.member_test_accounts t JOIN auth.users x ON x.id = t.user_id)
  ) INTO result FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.member_test_accounts t WHERE t.user_id = u.id);
  RETURN result;
END; $$;

CREATE OR REPLACE FUNCTION public.my_membership()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE me uuid := auth.uid(); my_rank int; gate_at timestamptz; total int;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  CREATE TEMP TABLE IF NOT EXISTS _x(id uuid) ON COMMIT DROP;
  SELECT r INTO my_rank FROM (SELECT u.id, ROW_NUMBER() OVER (ORDER BY u.created_at, u.id) AS r FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.member_test_accounts t WHERE t.user_id = u.id)) q WHERE q.id = me;
  SELECT u.created_at INTO gate_at FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.member_test_accounts t WHERE t.user_id = u.id)
    ORDER BY u.created_at, u.id OFFSET 499 LIMIT 1;
  SELECT COUNT(*)::int INTO total FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM public.member_test_accounts t WHERE t.user_id = u.id);
  RETURN jsonb_build_object('rank', my_rank, 'gate_open_at', gate_at, 'total', total);
END; $$;