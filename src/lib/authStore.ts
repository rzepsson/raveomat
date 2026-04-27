import { atom } from "nanostores";
import { supabaseBrowser } from "./supabase.browser";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "./types";

export const authUser = atom<User | null>(null);
export const authProfile = atom<Profile | null>(null);
export const authModalOpen = atom<boolean>(false);

export interface OrganizationMembership {
  organizationId: string;
  name: string;
  slug: string;
  city: string | null;
  type: string;
  role: "owner" | "admin" | "member";
  inviteCode: string;
}

export const userOrganizations = atom<OrganizationMembership[]>([]);

interface OrgRow {
  role: string;
  organizations: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    type: string;
    invite_code: string;
  };
}

export async function loadUserProfile(userId: string): Promise<void> {
  const { data, error } = await supabaseBrowser
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to load user profile:", error);
    authProfile.set(null);
    return;
  }

  authProfile.set(data as Profile);
}

export async function loadUserOrganizations(userId: string): Promise<void> {
  const { data, error } = await supabaseBrowser
    .from("organization_members")
    .select(`
      role,
      organizations!inner (
        id,
        name,
        slug,
        city,
        type,
        invite_code
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load user organizations:", error);
    userOrganizations.set([]);
    return;
  }

  const mapped: OrganizationMembership[] = ((data || []) as unknown as OrgRow[]).map(
    (row) => ({
      organizationId: row.organizations.id,
      name: row.organizations.name,
      slug: row.organizations.slug,
      city: row.organizations.city,
      type: row.organizations.type,
      role: row.role as "owner" | "admin" | "member",
      inviteCode: row.organizations.invite_code || "",
    })
  );

  userOrganizations.set(mapped);
}

export function openAuthModal(): void {
  authModalOpen.set(true);
}

export function closeAuthModal(): void {
  authModalOpen.set(false);
}
