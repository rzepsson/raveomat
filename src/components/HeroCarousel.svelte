<script lang="ts">
  import { fly, fade } from "svelte/transition";

  interface ProEvent {
    id: string;
    title: string;
    subtitle?: string;
    date: string;
    venue: string;
    price: number;
    image_url?: string;
  }

  interface Props {
    initialProEvents: ProEvent[];
  }

  let { initialProEvents }: Props = $props();

  let currentIndex = $state((() => {
    const len = initialProEvents.length;
    return len > 0 ? Math.floor(Math.random() * len) : 0;
  })());
  const currentEvent = $derived(initialProEvents[currentIndex] || null);

  const formattedDate = $derived.by(() => {
    if (!currentEvent?.date) return "";
    return new Date(currentEvent.date).toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  const formattedPrice = $derived.by(() => {
    if (!currentEvent?.price) return "";
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(currentEvent.price);
  });

  function nextEvent() {
    if (initialProEvents.length === 0) return;
    currentIndex = (currentIndex + 1) % initialProEvents.length;
  }

  function prevEvent() {
    if (initialProEvents.length === 0) return;
    currentIndex = (currentIndex - 1 + initialProEvents.length) % initialProEvents.length;
  }

  function optimizeImageUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.includes("unsplash.com")) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}auto=format&fm=webp&fit=crop&w=1200&q=80`;
    }
    return url;
  }
</script>

{#if initialProEvents.length === 0}
  <div class="text-center w-full relative z-10">
    <h1 class="font-display text-[clamp(4rem,15vw,12rem)] font-extrabold tracking-tighter uppercase text-white leading-none select-none">
      RAVEOMAT
    </h1>
  </div>
{:else}
  <div class="relative w-full group">
    
    {#if initialProEvents.length > 1}
      <button
        type="button"
        onclick={prevEvent}
        class="hidden lg:flex absolute -left-12 xl:-left-24 top-1/2 -translate-y-1/2 z-30 p-4 text-white/40 hover:text-primary transition-all duration-300 hover:-translate-x-2"
        aria-label="Poprzednie wydarzenie"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    {/if}

    <div class="max-w-7xl mx-auto px-6 lg:px-8 w-full">
      {#key currentEvent.id}
        <div 
          in:fly={{ y: 20, duration: 400, delay: 150 }} 
          out:fade={{ duration: 150 }}
          class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
        >
          
          <div class="text-left lg:col-span-7 flex flex-col justify-center">
            
            <div class="inline-flex items-center gap-3 mb-8">
              <span class="w-12 h-0.5 bg-primary"></span>
              <span class="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                Wyróżnione
              </span>
            </div>
            
            <h1 class="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold tracking-tighter uppercase text-foreground leading-[0.9] mb-6 wrap-break-word hyphens-auto">
              {currentEvent.title}
            </h1>
            
            <p class="text-lg sm:text-xl text-muted mb-10 max-w-2xl font-light leading-relaxed">
              {currentEvent.subtitle || "Zabezpiecz swoje miejsce na najgorętsze imprezy w Europie."}
            </p>
            
            <div class="flex flex-col sm:flex-row gap-6 sm:gap-12 mb-12 border-l-2 border-white/10 pl-6">
              <div>
                <span class="block text-xs font-bold text-muted uppercase tracking-widest mb-1">Kiedy</span>
                <time datetime={currentEvent.date} class="text-lg text-foreground font-medium">
                  {formattedDate}
                </time>
              </div>
              
              <div>
                <span class="block text-xs font-bold text-muted uppercase tracking-widest mb-1">Gdzie</span>
                <span class="text-lg text-foreground font-medium">{currentEvent.venue}</span>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-8">
              <a
                href={`/wydarzenie/${currentEvent.id}`}
                class="px-8 py-4 bg-primary text-dark font-display font-bold text-lg uppercase tracking-widest hover:bg-white transition-colors duration-300"
              >
                Kup Bilety
              </a>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-muted uppercase tracking-widest mb-1">Cena od</span>
                <span class="text-3xl font-display font-bold text-foreground">
                  {formattedPrice}
                </span>
              </div>
            </div>
          </div>

          <div class="hidden lg:block lg:col-span-5 relative">
            <div class="absolute inset-0 rounded-full scale-90 -z-10"></div>
            
            <div class="relative aspect-3/4 w-full max-w-md ml-auto overflow-hidden bg-white/5 border border-white/10 shrink-0">
              {#if currentEvent.image_url}
                <img
                  src={optimizeImageUrl(currentEvent.image_url)}
                  alt={currentEvent.title}
                  class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                  loading="eager"
                  decoding="sync"
                />
              {:else}
                <div class="absolute inset-0 flex flex-col items-center justify-center text-white/20 border border-white/10">
                  <span class="font-display tracking-widest text-sm uppercase">Brak Grafiki</span>
                </div>
              {/if}
            </div>
          </div>

        </div>
      {/key}
    </div>

    {#if initialProEvents.length > 1}
      <button
        type="button"
        onclick={nextEvent}
        class="hidden lg:flex absolute -right-12 xl:-right-24 top-1/2 -translate-y-1/2 z-30 p-4 text-white/40 hover:text-primary transition-all duration-300 hover:translate-x-2"
        aria-label="Następne wydarzenie"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    {/if}
  </div>

  {#if initialProEvents.length > 1}
    <div class="flex justify-center gap-3 mt-12 lg:hidden w-full relative z-30">
      {#each initialProEvents as _, i}
        <button
          type="button"
          onclick={() => { currentIndex = i; }}
          class="h-1 rounded-none transition-all duration-300 {i === currentIndex ? 'bg-primary w-8' : 'bg-white/20 w-4 hover:bg-white/40'}"
          aria-label={`Przejdź do wydarzenia ${i + 1}`}
        ></button>
      {/each}
    </div>
  {/if}
{/if}
