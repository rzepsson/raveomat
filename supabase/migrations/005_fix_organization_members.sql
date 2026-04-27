ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_organization_id_fkey;
ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey;

ALTER TABLE public.organization_members ADD CONSTRAINT organization_members_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.organization_members ADD CONSTRAINT organization_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DO $$
BEGIN
  ALTER TABLE public.organization_members ALTER COLUMN role TYPE org_member_role USING role::org_member_role;
EXCEPTION WHEN others THEN
  NULL;
END $$;

ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_unique_membership;
ALTER TABLE public.organization_members ADD CONSTRAINT organization_members_unique_membership
  UNIQUE (organization_id, user_id);
