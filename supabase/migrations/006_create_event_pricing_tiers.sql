CREATE TABLE public.event_pricing_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL,
  quantity int NOT NULL,
  sold int NOT NULL DEFAULT 0,
  sale_start timestamptz,
  sale_end timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_pricing_tiers_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_pricing_tiers_event_id ON public.event_pricing_tiers(event_id);

ALTER TABLE public.event_pricing_tiers ENABLE ROW LEVEL SECURITY;
