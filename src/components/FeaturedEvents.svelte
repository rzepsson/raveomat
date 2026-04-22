<script lang="ts">
  import TicketCard from "./TicketCard.svelte";

  interface SupabaseEventRow {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    status: "available" | "soldout";
    promo_tier: "pro" | "basic" | "none";
    genre?: "techno" | "house" | "dnb" | "trance";
    type?: "club" | "festival" | "outdoor";
    image_url?: string;
  }

  interface FeaturedEvent {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    status: "available" | "soldout";
    genre?: "techno" | "house" | "dnb" | "trance";
    type?: "club" | "festival" | "outdoor";
    imageUrl?: string;
    promo_tier: "pro" | "basic" | "none";
  }

  interface Props {
    initialEvents: SupabaseEventRow[];
  }

  let { initialEvents }: Props = $props();

  const allEvents = $derived(
    initialEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      venue: event.venue,
      price: event.price,
      status: event.status || "available",
      genre: event.genre || "techno",
      type: event.type || "club",
      imageUrl: event.image_url,
      promo_tier: event.promo_tier,
    }))
  );

  const recommendedEvents = $derived(
    allEvents.filter((e) => e.promo_tier === "pro" || e.promo_tier === "basic")
  );

  const upcomingEvents = $derived(
    allEvents.filter((e) => e.promo_tier === "none")
  );

  function optimizeImageUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.includes("unsplash.com")) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}auto=format&fm=webp&fit=crop&w=600&q=75`;
    }
    return url;
  }
</script>

<section id="bilety" class="py-32 px-6 lg:px-8 bg-dark relative z-20">
  <div class="max-w-7xl mx-auto">
    <header class="mb-16 flex items-end justify-between">
      <div>
        <h2 class="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tighter text-foreground mb-4 uppercase">
          Wydarzenia
        </h2>
        <p class="text-xl text-muted font-light max-w-2xl">
          Nadchodzące imprezy, które warto sprawdzić.
        </p>
      </div>
      <a
        href="/wydarzenia"
        class="hidden md:inline-flex px-8 py-3 font-bold text-dark bg-primary text-sm uppercase tracking-widest hover:bg-primary-hover transition-all duration-200 hover:scale-105 active:scale-95"
      >
        Zobacz wszystkie
      </a>
    </header>

    <div>
      {#if recommendedEvents.length > 0}
        <div class="mb-16">
          <h3 class="text-2xl font-display font-bold uppercase tracking-tight mb-8 text-foreground">
            Polecane Wydarzenia
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {#each recommendedEvents as event, index (event.id)}
              <TicketCard {event} {index} />
            {/each}
          </div>
        </div>
      {/if}

      {#if upcomingEvents.length > 0}
        <div>
          <h3 class="text-2xl font-display font-bold uppercase tracking-tight mb-4 text-foreground">
            Nadchodzące
          </h3>
          <div class="flex gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pt-6 pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 items-stretch">
            {#each upcomingEvents as event, index (event.id)}
              <div class="shrink-0 snap-center sm:snap-start w-[85vw] sm:w-100 flex">
                <div class="w-full">
                  <TicketCard {event} {index} />
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if allEvents.length === 0}
        <div class="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-none">
          <svg class="w-16 h-16 text-muted mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h4 class="text-xl font-bold text-foreground mb-2">Brak wydarzeń</h4>
          <p class="text-muted">Sprawdź ponownie wkrótce.</p>
        </div>
      {/if}
    </div>

    <div class="mt-12 text-center md:hidden">
      <a
        href="/wydarzenia"
        class="inline-flex px-8 py-3 rounded-none font-bold text-dark bg-primary text-sm uppercase tracking-widest hover:bg-primary-hover transition-all duration-200"
      >
        Zobacz wszystkie wydarzenia
      </a>
    </div>
  </div>
</section>