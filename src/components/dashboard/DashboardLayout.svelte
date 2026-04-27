<script lang="ts">
  import type { Snippet } from "svelte";
  import type { User } from "@supabase/supabase-js";
  import { authUser, loadUserProfile, loadUserOrganizations, userOrganizations } from "../../lib/authStore";
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
  let organizations = $state<readonly OrganizationMembership[]>([]);
  let isPromoter = $state(false);

  $effect(() => {
    if (initialUser) {
      currentUser = { id: initialUser.id, email: initialUser.email } as User;
      authUser.set({ id: initialUser.id, email: initialUser.email } as User);
    }
  });

  $effect(() => {
    const unsubUser = authUser.subscribe((value) => {
      currentUser = value;
    });

    return () => {
      unsubUser();
    };
  });

  $effect(() => {
    const unsubOrgs = userOrganizations.subscribe((value) => {
      organizations = value;
      isPromoter = value.length > 0;
    });

    return () => {
      unsubOrgs();
    };
  });

  $effect(() => {
    if (currentUser) {
      void loadUserProfile(currentUser.id);
      void loadUserOrganizations(currentUser.id);
    } else {
      userOrganizations.set([]);
    }
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
