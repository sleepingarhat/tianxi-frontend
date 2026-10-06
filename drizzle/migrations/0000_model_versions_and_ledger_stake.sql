CREATE TABLE public.model_versions (
  version text primary key,
  engine text not null,
  fingerprint text,
  released_at text not null,
  status text not null default 'active',
  notes text
);
GRANT SELECT ON public.model_versions TO anon;
GRANT SELECT ON public.model_versions TO authenticated;
GRANT ALL ON public.model_versions TO service_role;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Model versions are public to read" ON public.model_versions FOR SELECT TO public USING (true);

ALTER TABLE public.football_dual_ledger ADD COLUMN stake integer NOT NULL DEFAULT 10;