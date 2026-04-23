<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { onMount } from "svelte";
  import { authModalOpen, closeAuthModal } from "../lib/authStore";
  import { supabase } from "../lib/supabase";
  import type { OAuthProvider } from "../lib/types";
  import Icon from "./Icon.svelte";

  let email = $state("");
  let password = $state("");
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let isOpen = $state(false);

  let modalRef: HTMLDivElement | undefined = $state();
  let previousFocusEl: Element | null = null;

  $effect(() => {
    return authModalOpen.subscribe(value => {
      isOpen = value;
      if (value) {
        previousFocusEl = document.activeElement;
      } else if (previousFocusEl instanceof HTMLElement) {
        previousFocusEl.focus();
      }
    });
  });

  onMount(() => {
    return () => {
      if (previousFocusEl instanceof HTMLElement) {
        previousFocusEl.focus();
      }
    };
  });

  $effect(() => {
    if (isOpen && modalRef) {
      const firstInput = modalRef.querySelector<HTMLElement>(
        'input:not([disabled]), button:not([disabled])'
      );
      firstInput?.focus();
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMessage = "";
    isSubmitting = true;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Wystąpił błąd. Spróbuj ponownie.");
      }

      closeAuthModal();
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Wystąpił błąd. Spróbuj ponownie.";
      errorMessage = message;
    } finally {
      isSubmitting = false;
    }
  }

  async function handleOAuth(provider: OAuthProvider) {
    errorMessage = "";
    isSubmitting = true;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      errorMessage = `Błąd logowania przez ${provider}.`;
      isSubmitting = false;
    }
  }

  function handleBackdropClick() {
    closeAuthModal();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeAuthModal();
      return;
    }

    if (e.key === "Tab" && modalRef) {
      trapFocus(e);
    }
  }

  function trapFocus(e: KeyboardEvent) {
    if (!modalRef) return;
    const focusable = modalRef.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div 
    class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-modal-title"
  >
    <div 
      class="absolute inset-0 bg-dark/90 backdrop-blur-2xl"
      transition:fade={{ duration: 300, easing: cubicOut }}
      onclick={handleBackdropClick}
      role="presentation"
    ></div>

    <div 
      bind:this={modalRef}
      class="relative w-full max-w-md bg-dark/80 backdrop-blur-xl border border-white/10 rounded-none p-6 sm:p-10 shadow-2xl max-h-[95dvh] overflow-y-auto"
      transition:fly={{ y: 20, duration: 400, easing: cubicOut }}
    >
      <button
        type="button"
        onclick={handleBackdropClick}
        class="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-muted hover:text-white hover:bg-white/10 transition-all duration-300 z-10"
        aria-label="Zamknij"
      >
        <Icon name="close" size={5} />
      </button>

      <header class="mb-6 sm:mb-8 pr-12">
        <h2 id="auth-modal-title" class="text-2xl sm:text-3xl font-display font-extrabold tracking-tighter text-foreground uppercase wrap-break-word">
          Zaloguj
        </h2>
        <p class="text-muted text-xs sm:text-sm mt-2 font-medium">
          Wróć do swoich wydarzeń.
        </p>
      </header>

      {#if errorMessage}
        <div class="mb-6 p-4 rounded-none bg-accent/10 border border-accent/20 text-accent text-sm font-medium" role="alert" aria-live="polite">
          {errorMessage}
        </div>
      {/if}

      <div class="space-y-3 mb-6">
        <button 
          type="button"
          onclick={() => handleOAuth("google")}
          disabled={isSubmitting}
          class="w-full flex items-center justify-center gap-3 px-5 py-3 sm:py-3.5 rounded-none bg-white/5 border border-white/10 text-foreground font-bold text-xs sm:text-sm hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <Icon name="google" size={5} />
          Kontynuuj przez Google
        </button>

        <button 
          type="button"
          onclick={() => handleOAuth("apple")}
          disabled={isSubmitting}
          class="w-full flex items-center justify-center gap-3 px-5 py-3 sm:py-3.5 rounded-none bg-white/5 border border-white/10 text-foreground font-bold text-xs sm:text-sm hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <Icon name="apple" size={5} />
          Kontynuuj przez Apple
        </button>
      </div>

      <div class="flex items-center gap-4 mb-6">
        <div class="h-px bg-white/10 flex-1"></div>
        <span class="text-[10px] font-bold text-muted uppercase tracking-[0.2em] whitespace-nowrap">Albo E-mail</span>
        <div class="h-px bg-white/10 flex-1"></div>
      </div>

      <form onsubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="auth-email" class="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
            Adres Email
          </label>
          <input
            id="auth-email"
            type="email"
            bind:value={email}
            placeholder="twoj@email.com"
            required
            disabled={isSubmitting}
            autocomplete="email"
            class="w-full px-5 py-3 sm:py-3.5 rounded-none bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 outline-none focus:border-primary/50 focus:bg-white/10 transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label for="auth-password" class="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
            Hasło
          </label>
          <input
            id="auth-password"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            required
            minlength="8"
            disabled={isSubmitting}
            autocomplete="current-password"
            class="w-full px-5 py-3 sm:py-3.5 rounded-none bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 outline-none focus:border-primary/50 focus:bg-white/10 transition-all disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          class="w-full py-3.5 sm:py-4 mt-2 rounded-none bg-primary text-dark font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isSubmitting}
            <span class="inline-flex items-center gap-2">
              <Icon name="spinner" size={4} class="text-dark" />
              Przetwarzanie...
            </span>
          {:else}
            Zaloguj się
          {/if}
        </button>
      </form>

      <div class="mt-8 text-center">
        <a 
          href="/rejestracja" 
          onclick={() => closeAuthModal()}
          class="text-xs font-bold text-muted uppercase tracking-widest hover:text-white transition-colors"
        >
          Nie masz konta? Zarejestruj się
        </a>
      </div>
    </div>
  </div>
{/if}
