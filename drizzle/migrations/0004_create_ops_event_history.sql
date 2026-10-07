CREATE TABLE public.ops_event_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_key text NOT NULL UNIQUE,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL CHECK (kind IN ('api_error', 'model_gate')),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
  source text NOT NULL,
  route text,
  status_code integer,
  message text NOT NULL,
  model_version text,
  gate_key text,
  gate_status text CHECK (gate_status IS NULL OR gate_status IN ('PASS', 'WATCH', 'FAIL')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.ops_event_history TO authenticated;
GRANT ALL ON public.ops_event_history TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.ops_event_history_id_seq TO service_role;
ALTER TABLE public.ops_event_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read ops event history"
ON public.ops_event_history FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX ops_event_history_occurred_at_idx ON public.ops_event_history (occurred_at DESC);
CREATE INDEX ops_event_history_kind_source_idx ON public.ops_event_history (kind, source, occurred_at DESC);
COMMENT ON TABLE public.ops_event_history IS 'Sanitized append-only API error and model gate history; service writes, admins read.';