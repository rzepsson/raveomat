<script lang="ts">
  import { authUser, authIsLoading, userOrganizations } from "../../lib/authStore";
  import type { OrganizationMembership } from "../../lib/authStore";

  interface Props {
    currentTab: string;
    isPromoter: boolean;
    organizations: readonly OrganizationMembership[];
  }

  let { currentTab, isPromoter, organizations }: Props = $props();

  interface TabItem {
    id: string;
    label: string;
    href: string;
    icon: string;
    locked?: boolean;
  }

  const userTabs: TabItem[] = [
    { id: "tickets", label: "Moje Bilety", href: "/panel/bilety", icon: "ticket" },
    { id: "settings", label: "Ustawienia Konta", href: "/panel/ustawienia", icon: "settings" },
  ];

  const promoterTabs: TabItem[] = (() => {
    return isPromoter
      ? [
          { id: "organization", label: "Twoja Organizacja", href: "/panel/organizacja", icon: "building" },
          { id: "events", label: "Wydarzenia", href: "/panel/wydarzenia", icon: "calendar" },
          { id: "scanner", label: "Skaner Biletów", href: "/panel/skaner", icon: "scan" },
        ]
      : [{ id: "promoter", label: "Zostań Promotorem", href: "/panel/promotor", icon: "lock", locked: true }];
  })();
</script>

<aside class="fixed left-0 top-20 bottom-0 w-80 bg-dark border-r-4 border-white/10 flex flex-col z-40">
  <div class="flex-1 overflow-y-auto py-8 px-6">
    <div class="mb-10">
      <h2 class="text-xs font-bold uppercase tracking-[0.3em] text-muted mb-6 pb-3 border-b-2 border-white/10">
        Panel Użytkownika
      </h2>
      <nav class="space-y-2">
        {#each userTabs as tab}
          <a
            href={tab.href}
            class="w-full text-left px-4 py-3 font-bold text-sm uppercase tracking-wider transition-all duration-200 block {currentTab === tab.id ? 'bg-primary text-dark' : 'text-foreground hover:bg-white/5 hover:text-primary'}"
          >
            {tab.label}
          </a>
        {/each}
      </nav>
    </div>

    <div>
      <h2 class="text-xs font-bold uppercase tracking-[0.3em] text-muted mb-6 pb-3 border-b-2 border-white/10">
        {isPromoter ? 'Organizator' : 'Tryb Promotora'}
      </h2>
      <nav class="space-y-2">
        {#each promoterTabs as tab}
          <a
            href={tab.href}
            class="w-full text-left px-4 py-3 font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center gap-3 {currentTab === tab.id ? 'bg-primary text-dark' : 'text-foreground hover:bg-white/5 hover:text-primary'}"
          >
            {#if tab.locked}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                <rect x="3" y="11" width="18" height="11" rx="0" ry="0"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            {/if}
            {tab.label}
          </a>
        {/each}
      </nav>
    </div>
  </div>

  <div class="p-6 border-t-4 border-white/10 flex items-center gap-3">
    <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-bold text-foreground truncate">{$authUser?.email || 'Gość'}</div>
      <div class="text-xs text-muted">Zalogowany</div>
    </div>
  </div>
</aside>
