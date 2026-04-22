<script lang="ts">
  import Icon from "../Icon.svelte";
</script>

<div class="border border-white/10 border-dashed bg-white/5 p-16 flex flex-col items-center justify-center text-center">
  <Icon name="scan" size={16} class="text-muted mb-6" />
  <span class="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">Bramka wejściowa</span>
  <h3 class="text-2xl font-display uppercase text-foreground mb-6 tracking-tighter">Skaner Biletów QR</h3>
  <p class="text-muted max-w-md">Moduł skanera wymaga dostępu do kamery urządzenia. Funkcja w przygotowaniu.</p>
</div>
