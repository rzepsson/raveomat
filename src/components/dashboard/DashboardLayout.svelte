<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import type { User } from "@supabase/supabase-js";
  import { authUser, authIsLoading, userOrganizations, initializeAuth, startAuthStateListener } from "../../lib/authStore";
  import type { OrganizationMembership } from "../../lib/authStore";
  import Sidebar from "./Sidebar.svelte";

  interface InitialUser {
    id: string;
    email: string;
  }

  interface Props {
    activePath: string;
    initialUser?: InitialUser | null;
    children?: Snippet;
  }

  let { activePath, initialUser = null, children }: Props = $props();

  let currentUser: User | null = $state(null);
  let isLoading = $state(true);
  let organizations = $state<readonly OrganizationMembership[]>([]);
  let isPromoter = $state(false);

  $effect(() => {
    const unsubUser = authUser.subscribe((value) => {
      currentUser = value;
    });
    const unsubLoading = authIsLoading.subscribe((value) => {
      isLoading = value;
    });
    const unsubOrgs = userOrganizations.subscribe((value) => {
      organizations = value;
      isPromoter = value.length > 0;
    });

    return () => {
      unsubUser();
      unsubLoading();
      unsubOrgs();
    };
  });

  onMount(async () => {
    if (initialUser) {
      authUser.set({ id: initialUser.id, email: initialUser.email } as User);
      authIsLoading.set(false);
    }
    await initializeAuth();
    startAuthStateListener();
  });

  const TAB_LABELS: Record<string, string> = {
    bilety: "Moje Bilety",
    ustawienia: "Ustawienia Konta",
    promotor: "Tryb Promotora",
    organizacja: "Twoja Organizacja",
    wydarzenia: "Zarządzanie Wydarzeniami",
    skaner: "Skaner Biletów",
    panel: "Panel",
  };

  function extractTabLabel(path: string): string {
    const parts = path.split("/");
    const tab = parts[parts.length - 1] || "panel";
    return TAB_LABELS[tab] || tab.toUpperCase();
  }

  function extractTabId(path: string): string {
    const parts = path.split("/");
    return parts[parts.length - 1] || "bilety";
  }

  const currentTab = $derived(extractTabId(activePath));
  const tabLabel = $derived(extractTabLabel(activePath));
</script>

{#if isLoading}
  <div class="min-h-screen bg-dark pt-24 flex items-center justify-center p-6">
    <div class="w-full max-w-4xl border border-white/10 p-8 flex flex-col gap-8 animate-pulse">
      <div class="h-12 w-64 bg-white/5"></div>
      <div class="h-64 w-full bg-white/5"></div>
    </div>
  </div>

{:else}
  <div class="min-h-screen bg-dark flex pt-20 lg:pt-24">
    <Sidebar {currentTab} {isPromoter} {organizations} />
    
    <main class="flex-1 ml-0 lg:ml-80 p-6 lg:p-12">
      <div class="max-w-6xl mx-auto">
        
        <header class="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span class="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">
              {isPromoter ? 'Terminal Organizatora' : 'Panel Użytkownika'}
            </span>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold uppercase tracking-tighter text-foreground leading-none">
              {tabLabel}
            </h1>
          </div>
        </header>

        <div class="dashboard-content">
          {#if children}
            {@render children()}
          {/if}
        </div>

      </div>
    </main>
  </div>
{/if}
