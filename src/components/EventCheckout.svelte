<script lang="ts">
  import { onMount } from "svelte";
  import { authUser, openAuthModal } from "../lib/authStore";
  import type { EventDetails } from "../lib/types";
  import { MAX_TICKETS_PER_PURCHASE } from "../lib/types";
  import { optimizeImageUrl, formatDateLong, formatPrice, safePercent } from "../lib/utils";
  import Icon from "./Icon.svelte";

  interface Props {
    id: string;
    initialEvent?: EventDetails | null;
  }

  let { id, initialEvent = null }: Props = $props();

  let event = $state<EventDetails | null>(initialEvent ?? null);
  let isLoading = $state(!initialEvent);
  let errorMessage = $state("");
  let isAuthenticated = $state(false);
  
  let ticketCount = $state(1);
  const totalTickets = $derived(event?.total_tickets || 0);
  const remainingTickets = $derived(event ? (event.total_tickets || 0) - (event.sold_tickets || 0) : 0);
  const availabilityPercent = $derived(safePercent(remainingTickets, totalTickets));

  onMount(() => {
    const unsubscribe = authUser.subscribe(user => {
      isAuthenticated = user !== null;
    });
    return unsubscribe;
  });

  const formattedDate = $derived(formatDateLong(event?.date ?? ""));
  const formattedPrice = $derived(event?.price ? formatPrice(event.price) : "");
  const formattedTotalPrice = $derived(event?.price ? formatPrice(event.price * ticketCount) : "");

  function handleCheckout() {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
  }
</script>

<div class="min-h-screen bg-dark border-t border-white/5 relative z-10 pt-20">
  {#if isLoading}
    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
      <div class="grid lg:grid-cols-12 gap-8 lg:gap-16">
        <div class="lg:col-span-7 xl:col-span-8 space-y-8">
          <div class="aspect-video bg-white/5 border border-white/10 animate-pulse"></div>
          <div class="h-12 w-3/4 bg-white/5 animate-pulse"></div>
          <div class="h-4 w-1/2 bg-white/5 animate-pulse"></div>
        </div>
        <div class="lg:col-span-5 xl:col-span-4">
          <div class="sticky top-24 bg-white/5 border border-white/10 p-8 space-y-6">
            <div class="h-8 w-1/2 bg-white/10 animate-pulse"></div>
            <div class="h-16 w-full bg-white/10 animate-pulse"></div>
            <div class="h-12 w-full bg-white/10 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

  {:else if errorMessage}
    <div class="max-w-7xl mx-auto px-6 py-32 text-center border border-white/10 bg-white/5 mt-12" role="alert" aria-live="polite">
      <h1 class="text-3xl font-display font-extrabold text-foreground mb-4 uppercase tracking-tighter">Błąd Operacji</h1>
      <p class="text-muted mb-8">{errorMessage}</p>
      <a href="/wydarzenia" class="inline-flex px-8 py-4 bg-primary text-dark font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
        Wróć do katalogu
      </a>
    </div>

  {:else if event}
    <div class="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-16">
      
      <div class="grid lg:grid-cols-12 gap-12 lg:gap-16">
        
        <div class="lg:col-span-7 xl:col-span-8 flex flex-col">
          
          <div class="inline-flex items-center gap-3 mb-6">
            <span class="w-8 h-0.5 bg-primary"></span>
            <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Informacje
            </span>
          </div>

          <h1 class="text-[clamp(2.5rem,5vw,4.5rem)] font-display font-extrabold text-foreground uppercase tracking-tighter leading-[0.9] mb-8 wrap-break-word hyphens-auto">
            {event.title}
          </h1>

          <div class="flex flex-wrap items-center gap-4 mb-8">
            {#if event.genre}
              <span class="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary border border-primary bg-dark">
                {event.genre}
              </span>
            {/if}
            {#if event.type}
              <span class="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground border border-white/30 bg-dark">
                {event.type}
              </span>
            {/if}
          </div>

          <div class="aspect-video w-full relative overflow-hidden bg-dark border border-white/10 mb-12">
            {#if event.image_url}
              <img
                src={optimizeImageUrl(event.image_url, { width: 1200, quality: 80 })}
                alt={event.title}
                class="w-full h-full object-cover border border-primary/10"
              />
            {:else}
              <div class="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-size-[16px_16px]">
                <span class="font-display text-[10px] uppercase tracking-[0.3em] text-white/30">BRAK GRAFIKI</span>
              </div>
            {/if}
          </div>

          <div class="grid sm:grid-cols-2 gap-8 mb-12 border-l-2 border-white/10 pl-6">
            <div class="space-y-4">
              <div>
                <span class="block text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">Data i Czas</span>
                <time datetime={event.date} class="text-lg font-medium text-foreground">{formattedDate}</time>
              </div>
              <div>
                <span class="block text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">Lokalizacja</span>
                <span class="text-lg font-medium text-foreground">{event.venue}</span>
              </div>
            </div>
            
            {#if event.organizations?.name}
              <div>
                <span class="block text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">Organizator</span>
                <div class="flex items-center gap-3 mt-2">
                  <div class="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-foreground font-display text-xl font-bold uppercase">
                    {event.organizations.name.substring(0, 2)}
                  </div>
                  <span class="text-lg font-bold text-foreground">{event.organizations.name}</span>
                </div>
              </div>
            {/if}
          </div>

          {#if event.description}
            <div class="border-t border-white/10 pt-8">
              <span class="block text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4">O wydarzeniu</span>
              <div class="prose prose-invert prose-p:text-muted prose-p:leading-relaxed prose-p:font-light max-w-none">
                <p>{event.description}</p>
              </div>
            </div>
          {/if}
        </div>

        <div class="lg:col-span-5 xl:col-span-4">
          <div class="sticky top-24 bg-dark border border-white/10 p-6 sm:p-8 flex flex-col gap-8 shadow-2xl">
            
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Cena biletu</span>
              <span class="text-5xl font-display font-extrabold text-primary tracking-tighter leading-none">{formattedPrice}</span>
            </div>

            {#if event.status === "available"}
              <div class="bg-white/5 border border-white/10 p-4">
                <div class="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span class="text-foreground">Dostępność puli</span>
                  <span class="text-primary">{remainingTickets} sztuk</span>
                </div>
                <div class="w-full h-0.5 bg-white/10">
                  <div 
                    class="h-full bg-primary" 
                    style="width: {availabilityPercent}%"
                  ></div>
                </div>
              </div>
            {:else}
              <div class="bg-soldout/10 border border-soldout/30 p-4 text-center">
                <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-soldout">Wydarzenie Wyprzedane</span>
              </div>
            {/if}

            <div class="border-t border-white/10 pt-8 flex flex-col gap-6">
              
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Ilość biletów</span>
                <div class="flex items-center border border-white/20 bg-dark">
                  <button 
                    type="button"
                    disabled={ticketCount <= 1 || event.status !== "available"}
                    onclick={() => ticketCount > 1 && ticketCount--}
                    aria-label="Zmniejsz ilość biletów"
                    class="w-10 h-10 flex items-center justify-center text-muted hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <Icon name="minus" size={4} />
                  </button>
                  <span class="w-12 text-center font-display font-bold text-lg">{ticketCount}</span>
                  <button 
                    type="button"
                    disabled={ticketCount >= MAX_TICKETS_PER_PURCHASE || event.status !== "available"}
                    onclick={() => ticketCount < MAX_TICKETS_PER_PURCHASE && ticketCount++}
                    aria-label="Zwiększ ilość biletów"
                    class="w-10 h-10 flex items-center justify-center text-muted hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <Icon name="plus" size={4} />
                  </button>
                </div>
              </div>

              <div class="flex items-end justify-between bg-white/5 p-4 border border-white/10">
                <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Do zapłaty</span>
                <span class="text-3xl font-display font-bold text-foreground leading-none">{formattedTotalPrice}</span>
              </div>
            </div>

            <div class="pt-4">
              <button
                type="button"
                disabled={event.status !== "available"}
                onclick={handleCheckout}
                class="w-full py-5 px-6 flex items-center justify-center font-bold text-[11px] uppercase tracking-[0.25em] transition-all duration-300 {event.status === 'available'
                  ? isAuthenticated
                    ? 'bg-primary text-dark hover:bg-white hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-white text-dark hover:bg-primary hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-white/10 text-muted cursor-not-allowed'}"
              >
                {#if event.status === "available"}
                  {isAuthenticated ? "Przejdź do kasy" : "Zaloguj się aby kupić"}
                {:else}
                  Brak biletów
                {/if}
              </button>

              {#if !isAuthenticated && event.status === "available"}
                <p class="mt-4 text-[10px] font-bold text-center text-muted uppercase tracking-widest">
                  Nowy na platformie? 
                  <a href="/rejestracja" class="text-primary hover:text-white transition-colors ml-1">Zarejestruj się</a>
                </p>
              {/if}
            </div>

          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
