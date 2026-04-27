import { supabaseBrowser } from "./supabase.browser";
import type { Organization, OrgType } from "./types";

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

export const FALLBACK_PARTNERS: Partner[] = [
  { id: "", name: "Baza", slug: "baza", type: "club", city: "Warszawa", description: "Jedna z najlepszych technicznych scen w Polsce", logo_url: null, eventCount: 23 },
  { id: "", name: "Jasna 1", slug: "jasna-1", type: "club", city: "Warszawa", description: "Legendarne miejsce undergroundowych imprez", logo_url: null, eventCount: 15 },
  { id: "", name: "Prozak 2.0", slug: "prozak-2-0", type: "club", city: "Kraków", description: "Krakowski klasyk z najlepszym sound systemem", logo_url: null, eventCount: 12 },
  { id: "", name: "Pień", slug: "pien", type: "club", city: "Wrocław", description: "Wrocławska świątynia techno", logo_url: null, eventCount: 11 },
  { id: "", name: "Resort", slug: "resort", type: "club", city: "Warszawa", description: "Najlepsze imprezy hard techno w stolicy", logo_url: null, eventCount: 9 },
  { id: "", name: "Tama", slug: "tama", type: "club", city: "Poznań", description: "Poznański klub z bogatą historią", logo_url: null, eventCount: 8 },
  { id: "", name: "Locomotiv", slug: "locomotiv", type: "club", city: "Wrocław", description: "Wielofunkcyjna przestrzeń kulturalna", logo_url: null, eventCount: 7 },
  { id: "", name: "Szopp", slug: "szopp", type: "club", city: "Kraków", description: "Mały, ale głośny", logo_url: null, eventCount: 6 },
  { id: "", name: "Halerta", slug: "halerta", type: "club", city: "Poznań", description: "Industrialne brzmienia w sercu miasta", logo_url: null, eventCount: 5 },
  { id: "", name: "Weird", slug: "weird", type: "club", city: "Warszawa", description: "Eksperymentalne techno w undergroundowej atmosferze", logo_url: null, eventCount: 4 },
  { id: "", name: "Żywilla", slug: "zywilla", type: "club", city: "Gdańsk", description: "Trójmiejska scena undergroundowa", logo_url: null, eventCount: 3 },
  { id: "", name: "Czarny Piątek", slug: "czarny-piatek", type: "collective", city: "Online", description: "Wirtualne imprezy dla globalnej społeczności", logo_url: null, eventCount: 18 },
];

export const fallbackPartnersSorted = [...FALLBACK_PARTNERS].sort((a, b) => b.eventCount - a.eventCount);
export const marqueePartners = [...fallbackPartnersSorted, ...fallbackPartnersSorted];

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
    return fallbackPartnersSorted;
  }

  const partners: Partner[] = (data as (Organization & { events: { id: string }[] })[]).map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    type: org.type,
    city: org.city,
    description: org.description,
    logo_url: org.logo_url,
    eventCount: org.events?.length ?? 0,
  }));

  return partners.sort((a, b) => b.eventCount - a.eventCount);
}
