<script lang="ts">
  import { authUser } from "../../lib/authStore";
  import type { OrganizationMembership } from "../../lib/authStore";
  import Icon from "../Icon.svelte";

  interface Props {
    currentTab: string;
    isPromoter: boolean;
    organizations: readonly OrganizationMembership[];
    isOpen: boolean;
    onClose: () => void;
  }

  let { currentTab, isPromoter, organizations = [], isOpen, onClose }: Props = $props();

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

  const promoterTabs: TabItem[] = $derived(
    isPromoter
      ? [
          { id: "organizacja", label: "Twoja Organizacja", href: "/panel/organizacja" },
          { id: "wydarzenia", label: "Wydarzenia", href: "/panel/wydarzenia" },
          { id: "skaner", label: "Skaner Biletów", href: "/panel/skaner" },
        ]
      : [{ id: "promotor", label: "Zostań Promotorem", href: "/panel/promotor", locked: true }]
  );
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
    role="button"
    tabindex="-1"
    aria-label="Zamknij menu"
    onclick={onClose}
    onkeydown={(e) => { if (e.key === "Escape") onClose(); }}
  ></div>
{/if}

<aside
  class="fixed left-0 top-0 bottom-0 w-80 bg-dark border-r border-white/10 flex flex-col z-50
    {isOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0 lg:top-20 lg:bottom-0"
>
  <div class="flex items-center justify-between p-6 lg:hidden border-b border-white/10">
    <span class="text-xs font-bold uppercase tracking-[0.3em] text-primary">Menu</span>
    <button
      type="button"
      onclick={onClose}
      class="w-10 h-10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
      aria-label="Zamknij menu"
    >
      <Icon name="close" size={5} />
    </button>
  </div>

  <div class="flex-1 overflow-y-auto py-6 lg:py-8 px-5 lg:px-6 no-scrollbar">
    <div class="mb-8">
      <h2 class="text-[10px] font-bold uppercase tracking-[0.3em] text-muted mb-4 px-3 pb-2 border-b border-white/10">
        Panel Użytkownika
      </h2>
      <nav class="space-y-1">
        {#each userTabs as tab}
          <a
            href={tab.href}
            onclick={onClose}
            aria-current={currentTab === tab.id ? "page" : undefined}
            class="w-full text-left px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wider block
              {currentTab === tab.id
                ? 'bg-primary text-dark'
                : 'text-foreground hover:bg-white/5 hover:text-primary'}"
          >
            {tab.label}
          </a>
        {/each}
      </nav>
    </div>

    <div>
      <h2 class="text-[10px] font-bold uppercase tracking-[0.3em] text-muted mb-4 px-3 pb-2 border-b border-white/10">
        {isPromoter ? 'Organizator' : 'Tryb Promotora'}
      </h2>
      <nav class="space-y-1">
        {#each promoterTabs as tab}
          <a
            href={tab.href}
            onclick={onClose}
            aria-current={currentTab === tab.id ? "page" : undefined}
            class="w-full text-left px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-3
              {currentTab === tab.id
                ? 'bg-primary text-dark'
                : 'text-foreground hover:bg-white/5 hover:text-primary'}"
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

  <div class="p-5 lg:p-6 border-t border-white/10">
    <div class="flex items-center gap-3 px-2">
      <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        <Icon name="user" size={5} class="text-foreground" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-foreground truncate">{$authUser?.email || 'Gość'}</div>
        <div class="text-xs text-muted">Zalogowany</div>
      </div>
    </div>
  </div>
</aside>
