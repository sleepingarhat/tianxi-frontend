CREATE OR REPLACE FUNCTION public.my_membership()
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE me uuid := auth.uid(); my_rank int; gate_at timestamptz; total int;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT r INTO my_rank FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS r FROM auth.users) t WHERE id = me;
  SELECT created_at INTO gate_at FROM auth.users ORDER BY created_at, id OFFSET 1 LIMIT 1;
  SELECT COUNT(*)::int INTO total FROM auth.users;
  RETURN jsonb_build_object('rank', my_rank, 'gate_open_at', gate_at, 'total', total);
END;
$function$;