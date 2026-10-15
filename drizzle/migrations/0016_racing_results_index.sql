CREATE TABLE public.racing_results_index (
  path text PRIMARY KEY, meeting_date date NOT NULL, races integer NOT NULL, result_rows integer NOT NULL,
  synced_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.racing_results_index TO anon, authenticated;
GRANT ALL ON public.racing_results_index TO service_role;
ALTER TABLE public.racing_results_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read results index" ON public.racing_results_index FOR SELECT TO anon, authenticated USING (true);
CREATE OR REPLACE FUNCTION public.racing_data_scale() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT jsonb_build_object('meetings', COUNT(*)::int, 'races', COALESCE(SUM(races),0)::int, 'rows', COALESCE(SUM(result_rows),0)::int,
    'first', MIN(meeting_date), 'last', MAX(meeting_date), 'synced_at', MAX(synced_at)) FROM public.racing_results_index WHERE races > 0 $$;
GRANT EXECUTE ON FUNCTION public.racing_data_scale() TO anon, authenticated;