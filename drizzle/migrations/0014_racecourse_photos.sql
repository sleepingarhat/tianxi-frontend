CREATE TABLE public.racecourse_photos (
  file_title text PRIMARY KEY,
  venue text NOT NULL CHECK (venue IN ('ST','HV')),
  image_url text NOT NULL,
  width int NOT NULL,
  height int NOT NULL,
  author text NOT NULL,
  license text NOT NULL,
  license_url text,
  source_page text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  checked_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.racecourse_photos TO anon, authenticated;
GRANT ALL ON public.racecourse_photos TO service_role;
ALTER TABLE public.racecourse_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active photos" ON public.racecourse_photos FOR SELECT TO anon, authenticated USING (active);

CREATE TABLE public.racecourse_photo_runs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ran_at timestamptz NOT NULL DEFAULT now(),
  ok boolean NOT NULL,
  scanned int NOT NULL DEFAULT 0,
  accepted int NOT NULL DEFAULT 0,
  added int NOT NULL DEFAULT 0,
  message text
);
GRANT SELECT ON public.racecourse_photo_runs TO anon, authenticated;
GRANT ALL ON public.racecourse_photo_runs TO service_role;
ALTER TABLE public.racecourse_photo_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read photo runs" ON public.racecourse_photo_runs FOR SELECT TO anon, authenticated USING (true);