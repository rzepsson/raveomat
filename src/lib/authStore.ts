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

interface AuthStateChangeResult {
  data: {
    subscription: {
      unsubscribe: () => void;
    };
  };
}

let authStateChangeResult: AuthStateChangeResult | null = null;

function handleAuthStateChange(_event: string, session: Session | null) {
  authSession.set(session);
  authUser.set(session?.user ?? null);

  if (session?.user) {
    loadUserOrganizations(session.user.id).then(() => {
      authIsLoading.set(false);
    });
  } else {
    clearUserOrganizations();
    authIsLoading.set(false);
  }
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

  const mapped: OrganizationMembership[] = (data || []).map((row: any) => ({
    organizationId: row.organizations.id,
    name: row.organizations.name,
    role: row.role,
    inviteCode: row.organizations.invite_code || "",
  }));

  userOrganizations.set(mapped);
}

export function clearUserOrganizations(): void {
  userOrganizations.set([]);
}

export function initializeAuth(): Promise<void> {
  return new Promise((resolve) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      authSession.set(session);
      authUser.set(session?.user ?? null);

      if (session?.user) {
        loadUserOrganizations(session.user.id).then(() => {
          authIsLoading.set(false);
          resolve();
        });
      } else {
        authIsLoading.set(false);
        resolve();
      }
    });
  });
}

export function startAuthStateListener(): void {
  if (authStateChangeResult) {
    return;
  }
  authStateChangeResult = supabase.auth.onAuthStateChange(handleAuthStateChange);
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
  if (authStateChangeResult) {
    authStateChangeResult.data.subscription.unsubscribe();
    authStateChangeResult = null;
  }
}

startAuthStateListener();
