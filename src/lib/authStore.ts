import { atom } from "nanostores";
import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

export const authUser = atom<User | null>(null);
export const authSession = atom<Session | null>(null);
export const authIsLoading = atom<boolean>(true);
export const authModalOpen = atom<boolean>(false);

export interface OrganizationMembership {
  organizationId: string;
  name: string;
  role: "owner" | "admin" | "member";
  inviteCode: string;
}

export const userOrganizations = atom<OrganizationMembership[]>([]);

let authSubscription: { unsubscribe: () => void } | null = null;
let isInitialized = false;

function handleAuthStateChange(_event: string, session: Session | null) {
  authSession.set(session);
  authUser.set(session?.user ?? null);

  if (session?.user) {
    loadUserOrganizations(session.user.id)
      .catch((err) => {
        console.error("Failed to load organizations:", err);
        userOrganizations.set([]);
      })
      .finally(() => {
        authIsLoading.set(false);
      });
  } else {
    userOrganizations.set([]);
    authIsLoading.set(false);
  }
}

interface OrgRow {
  role: string;
  organizations: {
    id: string;
    name: string;
    invite_code: string;
  };
}

export async function loadUserOrganizations(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      role,
      organizations!inner (
        id,
        name,
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
      role: row.role as "owner" | "admin" | "member",
      inviteCode: row.organizations.invite_code || "",
    })
  );

  userOrganizations.set(mapped);
}

export async function initializeAuth(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Failed to get session:", error);
      authIsLoading.set(false);
      return;
    }

    const { session } = data;
    authSession.set(session);
    authUser.set(session?.user ?? null);

    if (session?.user) {
      await loadUserOrganizations(session.user.id);
    }
  } catch (err) {
    console.error("Auth initialization failed:", err);
  } finally {
    authIsLoading.set(false);
  }
}

export function startAuthStateListener(): void {
  if (authSubscription) return;

  const { data } = supabase.auth.onAuthStateChange(handleAuthStateChange);
  authSubscription = data.subscription;
}

export function openAuthModal(): void {
  authModalOpen.set(true);
}

export function closeAuthModal(): void {
  authModalOpen.set(false);
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export function cleanupAuth(): void {
  if (authSubscription) {
    authSubscription.unsubscribe();
    authSubscription = null;
  }
  isInitialized = false;
}
