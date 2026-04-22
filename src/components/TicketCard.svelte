<script lang="ts">
  import { reveal } from "../lib/actions/reveal";
  import type { TicketEvent } from "../lib/types";
  import { GENRE_LABELS, TYPE_LABELS } from "../lib/types";
  import { optimizeImageUrl, formatDateShort, formatPrice } from "../lib/utils";
  import Icon from "./Icon.svelte";

  interface Props {
    event: TicketEvent;
    index?: number;
  }

  let { event, index = 0 }: Props = $props();

  const staggerDelay = $derived(index * 75);
  const formattedDate = $derived(formatDateShort(event.date));
  const formattedPrice = $derived(formatPrice(event.price));
</script>

<a 
  use:reveal={{ delay: staggerDelay }} 
  href="/wydarzenie/{event.id}" 
  class="group relative flex flex-col bg-white/5 border border-white/10 overflow-hidden transition-all duration-300 hover:border-primary hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_40px_rgba(162,255,0,0.15)] no-underline rounded-none h-full"
>
  <div class="aspect-4/3 relative overflow-hidden bg-dark border-b border-white/10">
    {#if event.imageUrl}
      <img
        src={optimizeImageUrl(event.imageUrl)}
        alt={event.title}
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
        loading="lazy"
        decoding="async"
      />
    {:else}
      <div class="absolute inset-0 flex items-center justify-center bg-dark" style="background-image: radial-gradient(circle at center, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 16px 16px;">
        <span class="font-display text-[10px] uppercase tracking-[0.3em] text-white/30">BRAK GRAFIKI</span>
      </div>
    {/if}

    <div class="absolute top-4 left-4 flex flex-wrap gap-2">
      {#if event.genre}
        <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary border border-primary bg-dark/90 backdrop-blur-md">
          {GENRE_LABELS[event.genre] || event.genre}
        </span>
      {/if}
      {#if event.type}
        <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground border border-white/30 bg-dark/90 backdrop-blur-md">
          {TYPE_LABELS[event.type] || event.type}
        </span>
      {/if}
    </div>

    {#if event.status === "soldout"}
      <div class="absolute top-4 right-4">
        <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-dark bg-muted border border-muted">
          Sold Out
        </span>
      </div>
    {/if}
  </div>

  <div class="flex flex-col p-6 flex-1 bg-transparent">
    <header class="mb-6">
      <h3 class="text-2xl font-display font-extrabold text-foreground group-hover:text-primary transition-colors uppercase tracking-tighter line-clamp-2 leading-tight">
        {event.title}
      </h3>
    </header>

    <div class="flex-1 space-y-4 mb-6">
      <div class="flex items-center gap-4 text-muted text-sm font-medium">
        <Icon name="calendar" size={4} class="text-primary shrink-0" />
        <time datetime={event.date} class="uppercase tracking-widest text-[11px] font-bold">{formattedDate}</time>
      </div>

      <div class="flex items-center gap-4 text-muted text-sm font-medium">
        <Icon name="location" size={4} class="text-primary shrink-0" />
        <span class="truncate uppercase tracking-widest text-[11px] font-bold">{event.venue}</span>
      </div>
    </div>
    
    <div class="mt-auto flex justify-between items-end">
      <span class="text-xs font-bold uppercase tracking-[0.2em] text-muted">Bilety od</span>
      <span class="text-2xl font-display font-bold text-foreground">{formattedPrice}</span>
    </div>
  </div>

  <div class="w-full border-t border-white/10 py-4 text-center transition-colors duration-300 {event.status === 'available' ? 'bg-white/5 group-hover:bg-primary' : 'bg-white/5 opacity-50'}">
    <span class="text-[15px] font-bold uppercase tracking-[0.25em] transition-colors duration-300 {event.status === 'available' ? 'text-foreground group-hover:text-dark' : 'text-muted'}">
      {event.status === "available" ? "Kup Bilety" : "Wyprzedane"}
    </span>
  </div>
</a>
