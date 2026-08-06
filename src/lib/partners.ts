import { supabaseBrowser } from "./supabase.browser";
import type { Organization, OrgType } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Partner {
  id: string;
  name: string;
  slug: string;
  type: OrgType;
  city: string | null;
  description: string | null;
  logo_url: string | null;
  eventCount: number;
}

interface PartnerOrg {
  id: string;
  name: string;
  slug: string;
  type: OrgType;
  city: string | null;
  description: string | null;
  logo_url: string | null;
  events: { id: string }[];
}

function mapToPartners(data: PartnerOrg[]): Partner[] {
  return data
    .map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      type: org.type,
      city: org.city,
      description: org.description,
      logo_url: org.logo_url,
      eventCount: org.events?.length ?? 0,
    }))
    .sort((a, b) => b.eventCount - a.eventCount);
}

export async function fetchPartnersServer(supabase: SupabaseClient): Promise<Partner[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, type, city, description, logo_url, events(id)")
    .eq("status", "active")
    .order("name");

  if (error || !data) {
    console.error("Failed to fetch partners:", error?.message);
    return [];
  }

  return mapToPartners(data as PartnerOrg[]);
}

export async function fetchPartners(): Promise<Partner[]> {
  const { data, error } = await supabaseBrowser
    .from("organizations")
    .select(`
      id, name, slug, type, city, description, logo_url,
      events (id)
    `)
    .eq("status", "active")
    .order("name");

  if (error || !data) {
    console.error("Failed to fetch partners:", error?.message);
    return [];
  }

  return mapToPartners(data as (Organization & { events: { id: string }[] })[]);
}
