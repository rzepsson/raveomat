<script lang="ts">
  import { userOrganizations } from "../../lib/authStore";

  let organizations = $state<readonly any[]>([]);

  $effect(() => {
    const unsub = userOrganizations.subscribe((value) => {
      organizations = value;
    });
    return unsub;
  });
</script>

{#if organizations.length === 0}
  <div class="border border-dashed border-white/10 bg-white/5 p-16 flex flex-col items-center justify-center text-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-muted mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="square">
      <rect x="3" y="3" width="18" height="18" rx="0" ry="0"></rect>
      <path d="M3 9h18"></path>
      <path d="M9 21V9"></path>
    </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}
