<script lang="ts">
  import { onMount } from "svelte";
  import type { User } from "@supabase/supabase-js";
  import { authUser, authIsLoading, authModalOpen, initializeAuth, signOut } from "../lib/authStore";
  import AuthModal from "./AuthModal.svelte";

  interface Props {
    showLogo?: boolean;
  }

  let { showLogo = false }: Props = $props();

  let user = $state<User | null>(null);
  let isLoading = $state(true);
  let isModalOpen = $state(false);

  $effect(() => {
    const unsubscribeUser = authUser.subscribe(value => {
      user = value;
    });
    const unsubscribeLoading = authIsLoading.subscribe(value => {
      isLoading = value;
    });
    const unsubscribeModal = authModalOpen.subscribe(value => {
      isModalOpen = value;
    });

    return () => {
      unsubscribeUser();
      unsubscribeLoading();
      unsubscribeModal();
    };
  });

  onMount(async () => {
    await initializeAuth();
  });

  function handleOpenAuth() {
    authModalOpen.set(true);
  }

  function handleCloseAuth() {
    authModalOpen.set(false);
  }

  async function handleSignOut() {
    await signOut();
  }
</script>

<header class="fixed top-0 left-0 z-50 w-full transition-all duration-500 backdrop-blur-xl bg-dark/70 border-b border-white/5">
  <nav class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="flex items-center justify-between h-20">
      
      <div class="shrink-0 flex items-center">
        {#if showLogo}
          <a 
            href="/" 
            class="font-display text-1xl md:text-2xl font-extrabold tracking-tighter text-primary uppercase hover:opacity-80 transition-opacity"
          >
            RAVEOMAT
          </a>
        {:else}
          <div class="w-32" aria-hidden="true"></div>
        {/if}
      </div>

      <div class="flex items-center gap-6 md:gap-8">
        
        <div class="hidden md:flex items-center gap-8 text-xs font-bold tracking-[0.2em] uppercase">
          <a
            href="/wydarzenia"
            class="text-muted hover:text-white transition-colors duration-300"
          >
            Wydarzenia
          </a>
          <a
            href="/partnerzy"
            class="text-muted hover:text-white transition-colors duration-300"
          >
            Partnerzy
          </a>
          <a
            href="/#kontakt"
            class="text-muted hover:text-white transition-colors duration-300"
          >
            Kontakt
          </a>
        </div>

        <div class="hidden md:block w-px h-6 bg-white/10"></div>

        {#if isLoading}
          <div class="w-20 h-10 bg-white/5 rounded-full animate-pulse"></div>
        {:else if user}
          <div class="flex items-center gap-4">
            <a
              href="/panel/bilety"
              class="px-6 py-2.5 rounded-full bg-primary text-dark text-xs md:text-sm font-bold tracking-wider hover:bg-primary-hover transition-all duration-300 active:scale-95 glow-primary"
            >
              PANEL
            </a>
            <button
              type="button"
              onclick={handleSignOut}
              class="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm font-bold tracking-wider text-foreground hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 active:scale-95"
            >
              WYLOGUJ
            </button>
          </div>
        {:else}
          <button
            type="button"
            onclick={handleOpenAuth}
            class="px-6 py-2.5 rounded-full bg-primary text-dark text-xs md:text-sm font-bold tracking-wider hover:bg-primary-hover transition-all duration-300 active:scale-95 glow-primary"
          >
            ZALOGUJ
          </button>
        {/if}
      </div>
    </div>
  </nav>
</header>

{#if isModalOpen}
  <AuthModal />
{/if}