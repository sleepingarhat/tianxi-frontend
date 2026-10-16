CREATE TABLE public.computed_cache (
  key text PRIMARY KEY,
  payload jsonb NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.computed_cache TO service_role;
ALTER TABLE public.computed_cache ENABLE ROW LEVEL SECURITY;