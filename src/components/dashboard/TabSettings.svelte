<script lang="ts">
  import type { User } from "@supabase/supabase-js";
  import { authUser } from "../../lib/authStore";
  import Icon from "../Icon.svelte";

  let currentUser: User | null = $state(null);

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
      <Icon name="user" size={5} class="text-muted" />
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
