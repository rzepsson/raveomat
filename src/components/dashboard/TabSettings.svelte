<script lang="ts">
  import { authUser } from "../../lib/authStore";

  let currentUser: any = $state(null);

  $effect(() => {
    const unsub = authUser.subscribe((value) => {
      currentUser = value;
    });
    return unsub;
  });
</script>

<div class="grid lg:grid-cols-2 gap-8">
  <div class="bg-white/5 border border-white/10 p-8">
    <div class="flex items-center justify-between mb-8">
      <span class="text-[10px] uppercase tracking-[0.3em] text-primary">Tożsamość</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    </div>
    
    <div class="space-y-6">
      <div>
        <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-2">Adres Email</span>
        <div class="font-mono text-lg text-foreground border-b border-white/10 pb-3">{currentUser?.email || "—"}</div>
      </div>
      <div>
        <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-2">Unikalny Identyfikator (UUID)</span>
        <div class="font-mono text-xs text-muted truncate p-3 bg-dark border border-white/5">{currentUser?.id || "—"}</div>
      </div>
      <div>
        <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-2">Data utworzenia</span>
        <div class="font-mono text-sm text-foreground">{currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString("pl-PL") : "—"}</div>
      </div>
    </div>
  </div>

  <div class="bg-white/5 border border-white/10 p-8 flex flex-col justify-between">
    <div>
      <span class="text-[10px] uppercase tracking-[0.3em] text-primary mb-8 block">Bezpieczeństwo</span>
      <p class="text-muted text-sm leading-relaxed mb-6">Pamiętaj o bezpiecznym wylogowaniu się po zakończeniu pracy, zwłaszcza na współdzielonych urządzeniach.</p>
    </div>
    <button class="w-full py-4 border border-white/20 text-foreground font-bold text-xs uppercase tracking-widest hover:border-white hover:bg-white hover:text-dark transition-all">
      Zarządzaj hasłem
    </button>
  </div>
</div>
