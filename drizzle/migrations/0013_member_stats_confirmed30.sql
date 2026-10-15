CREATE OR REPLACE FUNCTION public.member_account_stats()
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT jsonb_build_object(
    'total', COUNT(*)::int,
    'confirmed', COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL)::int,
    'last7', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '7 days')::int,
    'last30', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '30 days')::int,
    'confirmed30', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '30 days' AND email_confirmed_at IS NOT NULL)::int,
    'signedIn30', COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '30 days' AND last_sign_in_at IS NOT NULL)::int
  ) INTO result FROM auth.users;
  RETURN result;
END; $function$;