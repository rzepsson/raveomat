ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_org_id_fkey;
ALTER TABLE public.events DROP COLUMN IF EXISTS org_id;

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date timestamptz;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_city text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'PLN';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS min_age int NOT NULL DEFAULT 18;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS total_tickets int NOT NULL DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS sold_tickets int NOT NULL DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.events ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.events ALTER COLUMN genre DROP DEFAULT;
ALTER TABLE public.events ALTER COLUMN type DROP DEFAULT;
ALTER TABLE public.events ALTER COLUMN promo_tier DROP DEFAULT;

ALTER TABLE public.events ALTER COLUMN genre TYPE event_genre USING genre::event_genre;
ALTER TABLE public.events ALTER COLUMN type TYPE event_type USING type::event_type;
ALTER TABLE public.events ALTER COLUMN status TYPE event_status USING status::event_status;
ALTER TABLE public.events ALTER COLUMN promo_tier TYPE promo_tier_enum USING promo_tier::promo_tier_enum;

ALTER TABLE public.events ALTER COLUMN status SET DEFAULT 'draft'::event_status;

CREATE INDEX IF NOT EXISTS idx_events_organization_id ON public.events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
