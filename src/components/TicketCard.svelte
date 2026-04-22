<script lang="ts">
  import { reveal } from "../lib/actions/reveal";

  interface TicketEvent {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    status: string;
    genre?: string;
    type?: string;
    imageUrl?: string;
  }

  interface Props {
    event: TicketEvent;
    index?: number;
  }

  let { event, index = 0 }: Props = $props();

  const staggerDelay = $derived(index * 75);

  function optimizeImageUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.includes("unsplash.com")) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}auto=format&fm=webp&fit=crop&w=600&q=75`;
    }
    return url;
  }

  const formattedDate = $derived.by(() => {
    const dateObj = new Date(event.date);
    return dateObj.toLocaleDateString("pl-PL", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  const formattedPrice = $derived.by(() => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(event.price);
  });

  const genreLabels: Record<string, string> = {
    techno: "Techno",
    house: "House",
    dnb: "DnB",
    trance: "Trance",
  };

  const typeLabels: Record<string, string> = {
    club: "Club",
    festival: "Festival",
    outdoor: "Outdoor",
  };
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
          {genreLabels[event.genre] || event.genre}
        </span>
      {/if}
      {#if event.type}
        <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground border border-white/30 bg-dark/90 backdrop-blur-md">
          {typeLabels[event.type] || event.type}
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
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
          <rect width="18" height="18" x="3" y="4"></rect>
          <line x1="16" x2="16" y1="2" y2="6"></line>
          <line x1="8" x2="8" y1="2" y2="6"></line>
          <line x1="3" x2="21" y1="10" y2="10"></line>
        </svg>
        <time datetime={event.date} class="uppercase tracking-widest text-[11px] font-bold">{formattedDate}</time>
      </div>

      <div class="flex items-center gap-4 text-muted text-sm font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
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
