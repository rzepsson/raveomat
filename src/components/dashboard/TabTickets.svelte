<script lang="ts">
  import Icon from "../Icon.svelte";
</script>

<div class="border border-white/10 border-dashed bg-white/5 p-16 flex flex-col items-center justify-center text-center">
  <Icon name="ticket" size={16} class="text-muted mb-6" />
  <span class="text-[10px] uppercase tracking-[0.3em] text-muted mb-2 block">Portfel Cyfrowy</span>
  <h3 class="text-2xl font-display uppercase text-foreground mb-6 tracking-tighter">Brak aktywnych biletów</h3>
  <a href="/wydarzenia" class="px-8 py-4 border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-dark transition-colors">
    Przeglądaj Wydarzenia
  </a>
</div>
