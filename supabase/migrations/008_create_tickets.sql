CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pricing_tier_id uuid NOT NULL REFERENCES public.event_pricing_tiers(id),
  qr_code text NOT NULL UNIQUE,
  status ticket_status NOT NULL DEFAULT 'valid',
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tickets_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_tickets_qr_code ON public.tickets(qr_code);
CREATE INDEX idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
