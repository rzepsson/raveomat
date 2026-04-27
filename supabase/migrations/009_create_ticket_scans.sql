CREATE TABLE public.ticket_scans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id),
  event_id uuid NOT NULL REFERENCES public.events(id),
  scanned_by uuid NOT NULL REFERENCES public.profiles(id),
  result ticket_scan_result NOT NULL,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ticket_scans_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_ticket_scans_event_id ON public.ticket_scans(event_id);
CREATE INDEX idx_ticket_scans_ticket_id ON public.ticket_scans(ticket_id);

ALTER TABLE public.ticket_scans ENABLE ROW LEVEL SECURITY;
