<script lang="ts">
  import TicketCard from "./TicketCard.svelte";
  import Select from "./Select.svelte";
  import type { TicketEvent, EventGenre, EventType, EventStatus } from "../lib/types";
  import { DEFAULT_STATUS } from "../lib/types";
  import Icon from "./Icon.svelte";

  type GenreFilter = "all" | EventGenre;
  type TypeFilter = "all" | EventType;

  interface Props {
    initialEvents?: TicketEvent[];
  }

  let { initialEvents = [] }: Props = $props();

  const events = $derived(initialEvents);
  const isLoading = $derived(initialEvents.length === 0);
  let errorMessage = $state("");

  let searchQuery = $state("");
  let activeGenreFilter: GenreFilter = $state("all");
  let activeTypeFilter: TypeFilter = $state("all");

  const genreFilterOptions = [
    { value: "all", label: "Wszystkie gatunki" },
    { value: "techno", label: "Techno" },
    { value: "house", label: "House" },
    { value: "dnb", label: "Drum & Bass" },
    { value: "trance", label: "Trance" },
  ];

  const typeFilterOptions = [
    { value: "all", label: "Każdy format" },
    { value: "club", label: "Klubowe" },
    { value: "festival", label: "Festiwal" },
    { value: "outdoor", label: "Plener" },
  ];

  const filteredEvents = $derived.by(() => {
    return events.filter((event) => {
      const query = searchQuery.toLowerCase();
      const searchMatch = event.title.toLowerCase().includes(query) || 
                          event.venue.toLowerCase().includes(query);
      const genreMatch = activeGenreFilter === "all" || event.genre === activeGenreFilter;
      const typeMatch = activeTypeFilter === "all" || event.type === activeTypeFilter;
      
      return searchMatch && genreMatch && typeMatch;
    });
  });

  const technoEvents = $derived(events.filter((e) => e.genre === "techno" && e.type === "club").slice(0, 3));
  const festivalEvents = $derived(events.filter((e) => e.type === "festival").slice(0, 3));
  const hasActiveFilters = $derived(searchQuery.length > 0 || activeGenreFilter !== "all" || activeTypeFilter !== "all");

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
        <Icon name="search" size={5} class="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Szukaj wydarzenia lub klubu..." 
          class="w-full bg-transparent py-4 pl-14 pr-4 text-foreground placeholder:text-muted/60 outline-none font-medium"
        />
      </div>

      <div class="hidden md:block w-px h-8 bg-white/10 self-center"></div>

      <div class="min-w-50">
        <Select
          bind:value={activeGenreFilter}
          options={genreFilterOptions}
          ariaLabel="Filtruj według gatunku"
          placeholder="Wszystkie gatunki"
          class="min-w-50"
        />
      </div>

      <div class="hidden md:block w-px h-8 bg-white/10 self-center"></div>

      <div class="min-w-50">
        <Select
          bind:value={activeTypeFilter}
          options={typeFilterOptions}
          ariaLabel="Filtruj według formatu wydarzenia"
          placeholder="Każdy format"
          class="min-w-50"
        />
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
          <Icon name="info" size={16} class="text-accent mb-4" />
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
            <Icon name="search" size={16} class="text-muted mb-4" />
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
