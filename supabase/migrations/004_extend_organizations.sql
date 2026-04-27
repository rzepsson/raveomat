ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS type org_type NOT NULL DEFAULT 'club';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS status org_status NOT NULL DEFAULT 'active';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS social_instagram text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS social_facebook text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS social_soundcloud text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tpay_merchant_id text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tpay_security_code text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

INSERT INTO public.organizations (name, slug, city, type, description)
VALUES
  ('Baza', 'baza', 'Warszawa', 'club', 'Jedna z najlepszych technicznych scen w Polsce'),
  ('Jasna 1', 'jasna-1', 'Warszawa', 'club', 'Legendarne miejsce undergroundowych imprez'),
  ('Prozak 2.0', 'prozak-2-0', 'Kraków', 'club', 'Krakowski klasyk z najlepszym sound systemem'),
  ('Pień', 'pien', 'Wrocław', 'club', 'Wrocławska świątynia techno'),
  ('Resort', 'resort', 'Warszawa', 'club', 'Najlepsze imprezy hard techno w stolicy'),
  ('Tama', 'tama', 'Poznań', 'club', 'Poznański klub z bogatą historią'),
  ('Locomotiv', 'locomotiv', 'Wrocław', 'club', 'Wielofunkcyjna przestrzeń kulturalna'),
  ('Szopp', 'szopp', 'Kraków', 'club', 'Mały, ale głośny'),
  ('Halerta', 'halerta', 'Poznań', 'club', 'Industrialne brzmienia w sercu miasta'),
  ('Weird', 'weird', 'Warszawa', 'club', 'Eksperymentalne techno w undergroundowej atmosferze'),
  ('Żywilla', 'zywilla', 'Gdańsk', 'club', 'Trójmiejska scena undergroundowa'),
  ('Czarny Piątek', 'czarny-piatek', 'Online', 'collective', 'Wirtualne imprezy dla globalnej społeczności')
ON CONFLICT (slug) DO NOTHING;
