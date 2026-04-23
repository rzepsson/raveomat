<script lang="ts">
  import { onMount } from "svelte";
  import { actions } from "astro:actions";
  import type { User } from "@supabase/supabase-js";
  import { authIsLoading, authModalOpen, authSession, authUser, initializeAuth, startAuthStateListener, userOrganizations } from "../lib/authStore";
  import AuthModal from "./AuthModal.svelte";
  import Icon from "./Icon.svelte";

  interface InitialUser {
    id: string;
    email: string;
  }

  interface Props {
    showLogo?: boolean;
    initialUser?: InitialUser | null;
  }

  let { showLogo = false, initialUser = null }: Props = $props();

  let user = $state<User | null>(null);
  let isLoading = $state(true);
  let isModalOpen = $state(false);
  let isMobileMenuOpen = $state(false);

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
    if (initialUser) {
      authUser.set({ id: initialUser.id, email: initialUser.email } as User);
      authIsLoading.set(false);
    }
    await initializeAuth();
    startAuthStateListener();
  });

  function handleOpenAuth() {
    authModalOpen.set(true);
  }

  function handleCloseAuth() {
    authModalOpen.set(false);
  }

  async function handleSignOut() {
    try {
      await actions.logout({});
    } catch {
      // Server logout best-effort; clear client state regardless
    } finally {
      authSession.set(null);
      authUser.set(null);
      userOrganizations.set([]);
      authIsLoading.set(false);
      window.location.href = "/";
    }
  }

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }

  function closeMobileMenu() {
    isMobileMenuOpen = false;
  }
</script>

<header class="fixed top-0 left-0 z-50 w-full transition-all duration-500 backdrop-blur-xl bg-dark/70 border-b border-white/5">
  <nav class="max-w-7xl mx-auto px-6 lg:px-8">
    <div class="flex items-center justify-between h-20">
      
      <div class="shrink-0 flex items-center">
        {#if showLogo}
          <a 
            href="/" 
            class="font-display text-xl md:text-2xl font-extrabold tracking-tighter text-primary uppercase hover:opacity-80 transition-opacity"
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
              class="hidden md:flex px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm font-bold tracking-wider text-foreground hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 active:scale-95"
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

        <button
          type="button"
          onclick={toggleMobileMenu}
          class="md:hidden w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors"
          aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {#if isMobileMenuOpen}
            <Icon name="close" size={6} />
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </nav>

  {#if isMobileMenuOpen}
    <div class="md:hidden bg-dark/95 backdrop-blur-2xl border-t border-white/5">
      <nav class="max-w-7xl mx-auto px-6 py-8 space-y-1">
        <a
          href="/wydarzenia"
          onclick={closeMobileMenu}
          class="block px-4 py-4 text-sm font-bold tracking-[0.2em] uppercase text-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          Wydarzenia
        </a>
        <a
          href="/partnerzy"
          onclick={closeMobileMenu}
          class="block px-4 py-4 text-sm font-bold tracking-[0.2em] uppercase text-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          Partnerzy
        </a>
        <a
          href="/#kontakt"
          onclick={closeMobileMenu}
          class="block px-4 py-4 text-sm font-bold tracking-[0.2em] uppercase text-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          Kontakt
        </a>

        {#if user}
          <div class="pt-4 mt-4 border-t border-white/10 space-y-1">
            <a
              href="/panel/bilety"
              onclick={closeMobileMenu}
              class="block px-4 py-4 text-sm font-bold tracking-[0.2em] uppercase text-primary hover:bg-primary hover:text-dark transition-colors"
            >
              Panel
            </a>
            <button
              type="button"
              onclick={() => { handleSignOut(); closeMobileMenu(); }}
              class="w-full text-left px-4 py-4 text-sm font-bold tracking-[0.2em] uppercase text-muted hover:text-accent hover:bg-white/5 transition-colors"
            >
              Wyloguj
            </button>
          </div>
        {/if}
      </nav>
    </div>
  {/if}
</header>

{#if isModalOpen}
  <AuthModal />
{/if}
