<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "../lib/supabase";
  import TicketCard from "./TicketCard.svelte";

  interface SupabaseEventRow {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    status: "available" | "soldout";
    genre: "techno" | "house" | "dnb" | "trance";
    type: "club" | "festival" | "outdoor";
    image_url?: string;
    imageUrl?: string;
  }

  interface TicketEvent {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    status: "available" | "soldout";
    genre: "techno" | "house" | "dnb" | "trance";
    type: "club" | "festival" | "outdoor";
    imageUrl?: string;
  }

  type GenreFilter = "all" | "techno" | "house" | "dnb" | "trance";
  type TypeFilter = "all" | "club" | "festival" | "outdoor";

  let events = $state<TicketEvent[]>([]);
  let isLoading = $state(true);
  let errorMessage = $state("");

  let searchQuery = $state("");
  let activeGenreFilter: GenreFilter = $state("all");
  let activeTypeFilter: TypeFilter = $state("all");

  const filteredEvents = $derived.by(() => {
    return events.filter((event) => {
      const searchMatch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const genreMatch = activeGenreFilter === "all" || event.genre === activeGenreFilter;
      const typeMatch = activeTypeFilter === "all" || event.type === activeTypeFilter;
      
      return searchMatch && genreMatch && typeMatch;
    });
  });

  const technoEvents = $derived.by(() => events.filter((e) => e.genre === "techno" && e.type === "club").slice(0, 3));
  const festivalEvents = $derived.by(() => events.filter((e) => e.type === "festival").slice(0, 3));

  const hasActiveFilters = $derived(searchQuery.length > 0 || activeGenreFilter !== "all" || activeTypeFilter !== "all");

  onMount(async () => {
    const { data, error } = await supabase.from("events").select("*");
    if (error) {
      errorMessage = error.message;
      isLoading = false;
      return;
    }
    if (data) {
      events = data.map((event: SupabaseEventRow) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        price: event.price,
        status: event.status || "available",
        genre: event.genre || "techno",
        type: event.type || "club",
        imageUrl: event.image_url || event.imageUrl,
      }));
    }
    isLoading = false;
  });

  function clearFilters() {
    searchQuery = "";
    activeGenreFilter = "all";
    activeTypeFilter = "all";
  }
</script>

<section id="bilety" class="py-32 px-6 lg:px-8 bg-dark relative z-20">
  <div class="max-w-7xl mx-auto">
    <header class="mb-16">
      <h2 class="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tighter text-foreground mb-4 uppercase">
        Wydarzenia
      </h2>
      <p class="text-xl text-muted font-light max-w-2xl">
        Znajdź najlepsze imprezy undergroundowe. Szukaj po nazwie klubu, miasta lub filtruj po gatunku.
      </p>
    </header>

    <div class="mb-16 bg-white/5 border border-white/10 rounded-none p-2 backdrop-blur-xl flex flex-col md:flex-row gap-2">
      
      <div class="relative flex-1">
        <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Szukaj wydarzenia lub klubu..." 
          class="w-full bg-transparent py-4 pl-14 pr-4 text-foreground placeholder:text-muted/60 outline-none font-medium"
        />
      </div>

      <div class="hidden md:block w-px h-8 bg-white/10 self-center"></div>

      <div class="relative min-w-50">
        <select 
          bind:value={activeGenreFilter}
          class="w-full appearance-none bg-transparent py-4 pl-6 pr-12 text-foreground outline-none cursor-pointer font-medium"
        >
          <option value="all" class="bg-dark text-foreground">Wszystkie gatunki</option>
          <option value="techno" class="bg-dark text-foreground">Techno</option>
          <option value="house" class="bg-dark text-foreground">House</option>
          <option value="dnb" class="bg-dark text-foreground">Drum & Bass</option>
          <option value="trance" class="bg-dark text-foreground">Trance</option>
        </select>
        <svg class="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <div class="hidden md:block w-px h-8 bg-white/10 self-center"></div>

      <div class="relative min-w-50">
        <select 
          bind:value={activeTypeFilter}
          class="w-full appearance-none bg-transparent py-4 pl-6 pr-12 text-foreground outline-none cursor-pointer font-medium"
        >
          <option value="all" class="bg-dark text-foreground">Każdy format</option>
          <option value="club" class="bg-dark text-foreground">Klubowe</option>
          <option value="festival" class="bg-dark text-foreground">Festiwal</option>
          <option value="outdoor" class="bg-dark text-foreground">Plener</option>
        </select>
        <svg class="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <div class="min-h-100">
      {#if isLoading}
        <div class="space-y-24">
          <section>
            <div class="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <div class="h-10 w-64 bg-white/5 rounded animate-pulse"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {#each Array(3) as _, i}
                <div class="rounded-none bg-glass border border-white/10 overflow-hidden">
                  <div class="aspect-video bg-dark-soft animate-pulse"></div>
                  <div class="p-5 space-y-3">
                    <div class="h-6 w-3/4 bg-white/5 rounded animate-pulse"></div>
                    <div class="h-4 w-1/2 bg-white/5 rounded animate-pulse"></div>
                    <div class="h-4 w-2/3 bg-white/5 rounded animate-pulse"></div>
                    <div class="pt-3 mt-3 border-t border-white/10 flex justify-between">
                      <div class="h-6 w-20 bg-white/5 rounded animate-pulse"></div>
                      <div class="h-6 w-16 bg-white/5 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </section>
        </div>

      {:else if errorMessage}
        <div class="flex flex-col items-center justify-center py-32 text-center border border-dashed border-accent/30 rounded-none">
          <svg class="w-16 h-16 text-accent mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h4 class="text-xl font-bold text-foreground mb-2">Błąd pobierania danych</h4>
          <p class="text-muted">{errorMessage}</p>
        </div>

      {:else if hasActiveFilters}
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-xl font-medium text-foreground">Wyniki wyszukiwania ({filteredEvents.length})</h3>
          <button onclick={clearFilters} class="text-sm font-bold tracking-widest uppercase text-primary hover:text-white transition-colors">
            Wyczyść
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each filteredEvents as event (event.id)}
            <TicketCard {event} />
          {/each}
        </div>

        {#if filteredEvents.length === 0}
          <div class="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-none">
            <svg class="w-16 h-16 text-muted mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h4 class="text-xl font-bold text-foreground mb-2">Brak wyników</h4>
            <p class="text-muted">Spróbuj zmienić filtry lub wyszukać inną frazę.</p>
          </div>
        {/if}

      {:else}
        <div class="space-y-24">
          {#if technoEvents.length > 0}
            <section>
              <div class="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h3 class="text-3xl font-display font-bold text-foreground uppercase tracking-tight">Klubowe Techno</h3>
                <a href="/wydarzenia" class="text-sm font-bold text-primary hover:text-white transition-colors uppercase tracking-widest hidden sm:block">Zobacz wszystkie</a>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each technoEvents as event (event.id)}
                  <TicketCard {event} />
                {/each}
              </div>
            </section>
          {/if}

          {#if festivalEvents.length > 0}
            <section>
              <div class="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h3 class="text-3xl font-display font-bold text-foreground uppercase tracking-tight">Festiwale</h3>
                <a href="/wydarzenia" class="text-sm font-bold text-primary hover:text-white transition-colors uppercase tracking-widest hidden sm:block">Zobacz wszystkie</a>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each festivalEvents as event (event.id)}
                  <TicketCard {event} />
                {/each}
              </div>
            </section>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</section>