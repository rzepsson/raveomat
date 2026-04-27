CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'PLN',
  status order_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  tpay_transaction_id text,
  tpay_crc text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_event_id ON public.orders(event_id);
CREATE INDEX idx_orders_tpay_transaction_id ON public.orders(tpay_transaction_id);
CREATE INDEX idx_orders_status ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  pricing_tier_id uuid NOT NULL REFERENCES public.event_pricing_tiers(id),
  quantity int NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
