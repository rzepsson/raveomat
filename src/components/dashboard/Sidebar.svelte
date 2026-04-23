<script lang="ts">
  import { authUser } from "../../lib/authStore";
  import type { OrganizationMembership } from "../../lib/authStore";
  import Icon from "../Icon.svelte";

  interface Props {
    currentTab: string;
    isPromoter: boolean;
    organizations: readonly OrganizationMembership[];
  }

  let { currentTab, isPromoter }: Props = $props();

  interface TabItem {
    id: string;
    label: string;
    href: string;
    locked?: boolean;
  }

  const userTabs: TabItem[] = [
    { id: "bilety", label: "Moje Bilety", href: "/panel/bilety" },
    { id: "ustawienia", label: "Ustawienia Konta", href: "/panel/ustawienia" },
  ];

  const promoterTabs: TabItem[] = (() => {
    return isPromoter
      ? [
          { id: "organizacja", label: "Twoja Organizacja", href: "/panel/organizacja" },
          { id: "wydarzenia", label: "Wydarzenia", href: "/panel/wydarzenia" },
          { id: "skaner", label: "Skaner Biletów", href: "/panel/skaner" },
        ]
      : [{ id: "promotor", label: "Zostań Promotorem", href: "/panel/promotor", locked: true }];
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
              <Icon name="lock" size={4} />
            {/if}
            {tab.label}
          </a>
        {/each}
      </nav>
    </div>
  </div>

  <div class="p-6 border-t-4 border-white/10 flex items-center gap-3">
    <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
      <Icon name="user" size={5} class="text-dark" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-bold text-foreground truncate">{$authUser?.email || 'Gość'}</div>
      <div class="text-xs text-muted">Zalogowany</div>
    </div>
  </div>
</aside>
