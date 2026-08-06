<script lang="ts">
  import type { Snippet } from "svelte";
  import { authUser, loadUserProfile, loadUserOrganizations, userOrganizations } from "../../lib/authStore";
  import type { OrganizationMembership } from "../../lib/authStore";
  import Sidebar from "./Sidebar.svelte";
  import Icon from "../Icon.svelte";

  interface Props {
    activePath: string;
    initialUser?: { id: string; email: string } | null;
    children?: Snippet;
  }

  let { activePath, initialUser = null, children }: Props = $props();

  let isSidebarOpen = $state(false);

  const isPromoter = $derived($userOrganizations.length > 0);

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  function closeSidebar() {
    isSidebarOpen = false;
  }

  $effect(() => {
    if (initialUser) {
      authUser.set({ id: initialUser.id, email: initialUser.email });
    }
  });

  $effect(() => {
    if ($authUser) {
      void loadUserProfile($authUser.id);
      void loadUserOrganizations($authUser.id);
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
  <Sidebar {currentTab} {isPromoter} organizations={$userOrganizations} isOpen={isSidebarOpen} onClose={closeSidebar} />

  <main class="flex-1 ml-0 lg:ml-80 min-w-0">
    <div class="max-w-6xl mx-auto">

      <header class="p-4 lg:p-0 lg:px-12 lg:pt-12 lg:pb-0 border-b border-white/10 lg:border-b-0">
        <div class="flex items-center gap-3 lg:gap-0">
          <button
            type="button"
            onclick={toggleSidebar}
            class="lg:hidden w-11 h-11 flex items-center justify-center text-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-colors shrink-0"
            aria-label="Otwórz menu"
          >
            <Icon name="menu" size={6} />
          </button>
          <div class="flex-1 lg:flex-none">
            <span class="text-primary font-bold tracking-[0.3em] uppercase text-[10px] block">
              {isPromoter ? 'Terminal Organizatora' : 'Panel Użytkownika'}
            </span>
            <h1 class="text-2xl sm:text-3xl lg:text-5xl font-display font-extrabold uppercase tracking-tighter text-foreground leading-tight">
              {tabLabel}
            </h1>
          </div>
        </div>
        <div class="hidden lg:block h-px bg-white/10 mt-8"></div>
      </header>

      <div class="dashboard-content p-4 lg:p-12 lg:pt-8">
        {#if children}
          {@render children()}
        {/if}
      </div>

    </div>
  </main>
</div>
