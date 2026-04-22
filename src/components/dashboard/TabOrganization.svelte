<script lang="ts">
  import { userOrganizations } from "../../lib/authStore";
  import type { OrganizationMembership } from "../../lib/authStore";
  import Icon from "../Icon.svelte";

  let organizations = $state<readonly OrganizationMembership[]>([]);

  $effect(() => {
    const unsub = userOrganizations.subscribe((value) => {
      organizations = value;
    });
    return unsub;
  });
</script>

{#if organizations.length === 0}
  <div class="border border-dashed border-white/10 bg-white/5 p-16 flex flex-col items-center justify-center text-center">
    <Icon name="building" size={16} class="text-muted mb-6" />
    <h3 class="text-2xl font-display uppercase text-foreground mb-4 tracking-tighter">Brak Organizacji</h3>
    <p class="text-muted text-sm mb-8">Nie jesteś członkiem żadnej organizacji. Użyj kodu zaproszenia, aby dołączyć.</p>
    <a href="/panel/promotor" class="px-8 py-4 border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-dark transition-colors">
      Dołącz do Organizacji
    </a>
  </div>
{:else}
  <div class="grid lg:grid-cols-2 gap-8">
    {#each organizations as org}
      <div class="relative bg-dark border border-white/20 p-8 overflow-hidden group">
        <div class="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-8">
            <span class="px-3 py-1 bg-white/10 text-[10px] uppercase tracking-widest font-bold text-primary">Aktywny</span>
            <span class="text-[10px] uppercase tracking-widest font-mono text-muted">ID: {org.organizationId.substring(0,8)}</span>
          </div>
          
          <h3 class="font-display text-4xl text-foreground uppercase tracking-tighter mb-2">{org.name}</h3>
          
          <div class="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[10px] uppercase tracking-[0.2em] text-muted">Twoja Rola</span>
              <span class="font-bold text-sm text-foreground uppercase tracking-widest">{org.role}</span>
            </div>
            <button title="Edytuj" class="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-dark transition-colors">
              <Icon name="chevron-right" size={4} />
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}
