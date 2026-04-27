CREATE TABLE public.refunds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  amount numeric NOT NULL,
  reason text,
  status order_status NOT NULL DEFAULT 'pending',
  tpay_refund_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT refunds_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_refunds_order_id ON public.refunds(order_id);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
