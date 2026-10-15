ALTER TABLE public.racecourse_photos ADD COLUMN approved boolean, ADD COLUMN review_note text;
DROP POLICY "public read active photos" ON public.racecourse_photos;
CREATE POLICY "public read approved photos" ON public.racecourse_photos FOR SELECT TO anon, authenticated USING (active AND approved IS TRUE);