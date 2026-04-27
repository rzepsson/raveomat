-- ═══════════════════════════════════════════
-- profiles RLS
-- ═══════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Profiles are readable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════
-- organizations RLS
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "Organizations are readable by everyone" ON public.organizations;
CREATE POLICY "Organizations are readable by everyone" ON public.organizations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owners and admins can update their organizations" ON public.organizations;
CREATE POLICY "Owners and admins can update their organizations" ON public.organizations
  FOR UPDATE USING (is_org_admin(id));

-- ═══════════════════════════════════════════
-- organization_members RLS
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "Users can read their own memberships" ON public.organization_members;
CREATE POLICY "Users can read their own memberships" ON public.organization_members
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can see co-members in the same organization" ON public.organization_members;
CREATE POLICY "Members can see co-members in the same organization" ON public.organization_members
  FOR SELECT USING (organization_id IN (SELECT get_my_organizations()));

DROP POLICY IF EXISTS "Owners and admins can manage organization members" ON public.organization_members;
CREATE POLICY "Owners and admins can manage organization members" ON public.organization_members
  FOR ALL USING (is_org_admin(organization_id));

-- ═══════════════════════════════════════════
-- events RLS
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "Events are readable by everyone" ON public.events;
CREATE POLICY "Events are readable by everyone" ON public.events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Promoters can insert events for their organization" ON public.events;
CREATE POLICY "Org members can insert events" ON public.events
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_my_organizations()));

DROP POLICY IF EXISTS "Promoters can update events for their organization" ON public.events;
CREATE POLICY "Org members can update events" ON public.events
  FOR UPDATE USING (organization_id IN (SELECT get_my_organizations()));

DROP POLICY IF EXISTS "Promoters can delete events for their organization" ON public.events;
CREATE POLICY "Org members can delete events" ON public.events
  FOR DELETE USING (organization_id IN (SELECT get_my_organizations()));

-- ═══════════════════════════════════════════
-- event_pricing_tiers RLS
-- ═══════════════════════════════════════════
CREATE POLICY "Pricing tiers are readable by everyone" ON public.event_pricing_tiers
  FOR SELECT USING (true);

CREATE POLICY "Org members can manage pricing tiers" ON public.event_pricing_tiers
  FOR ALL USING (event_id IN (
    SELECT e.id FROM public.events e
    WHERE e.organization_id IN (SELECT get_my_organizations())
  ));

-- ═══════════════════════════════════════════
-- orders RLS
-- ═══════════════════════════════════════════
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Org admins can view orders for their events" ON public.orders
  FOR SELECT USING (event_id IN (
    SELECT e.id FROM public.events e
    WHERE e.organization_id IN (SELECT get_my_organizations())
  ));

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- ═══════════════════════════════════════════
-- order_items RLS
-- ═══════════════════════════════════════════
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (order_id IN (
    SELECT o.id FROM public.orders o WHERE o.user_id = auth.uid()
  ));

CREATE POLICY "Users can create order items for own orders" ON public.order_items
  FOR INSERT WITH CHECK (order_id IN (
    SELECT o.id FROM public.orders o WHERE o.user_id = auth.uid()
  ));

-- ═══════════════════════════════════════════
-- tickets RLS
-- ═══════════════════════════════════════════
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Org admins can view tickets for their events" ON public.tickets
  FOR SELECT USING (event_id IN (
    SELECT e.id FROM public.events e
    WHERE e.organization_id IN (SELECT get_my_organizations())
  ));

-- ═══════════════════════════════════════════
-- ticket_scans RLS
-- ═══════════════════════════════════════════
CREATE POLICY "Org members can manage scans" ON public.ticket_scans
  FOR ALL USING (event_id IN (
    SELECT e.id FROM public.events e
    WHERE e.organization_id IN (SELECT get_my_organizations())
  ));

-- ═══════════════════════════════════════════
-- refunds RLS
-- ═══════════════════════════════════════════
CREATE POLICY "Users can view own refunds" ON public.refunds
  FOR SELECT USING (order_id IN (
    SELECT o.id FROM public.orders o WHERE o.user_id = auth.uid()
  ));

CREATE POLICY "Org admins can manage refunds" ON public.refunds
  FOR ALL USING (order_id IN (
    SELECT o.id FROM public.orders o
    WHERE o.event_id IN (
      SELECT e.id FROM public.events e
      WHERE e.organization_id IN (SELECT get_my_organizations())
    )
  ));
