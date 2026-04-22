<script lang="ts">
  import { supabase } from "../lib/supabase";
  import type { OAuthProvider } from "../lib/types";
  import Icon from "./Icon.svelte";

  let fullName = $state("");
  let email = $state("");
  let password = $state("");
  let acceptTerms = $state(false);
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMessage = "";
    successMessage = "";

    if (!acceptTerms) {
      errorMessage = "Musisz zaakceptować regulamin.";
      return;
    }

    isSubmitting = true;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      successMessage = "Sprawdź skrzynkę email, aby potwierdzić rejestrację.";
      fullName = "";
      email = "";
      password = "";
      acceptTerms = false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Wystąpił błąd. Spróbuj ponownie.";
      errorMessage = message;
    } finally {
      isSubmitting = false;
    }
  }

  async function handleOAuth(provider: OAuthProvider) {
    errorMessage = "";
    successMessage = "";
    isSubmitting = true;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      if (error) throw error;
    } catch {
      errorMessage = `Błąd logowania przez ${provider}.`;
      isSubmitting = false;
    }
  }
</script>

<div class="w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg">
  <div class="relative w-full bg-dark/80 backdrop-blur-xl border border-white/10 rounded-none p-6 sm:p-10 shadow-2xl">
    <header class="mb-8 text-center lg:text-left">
      <h1 id="register-form-title" class="text-3xl sm:text-4xl font-display font-extrabold tracking-tighter text-foreground uppercase">
        Rejestracja
      </h1>
      <p class="text-muted text-sm sm:text-base mt-3 font-medium">
        Dołącz do najlepszych imprez w mieście.
      </p>
    </header>

    {#if errorMessage}
      <div class="mb-6 p-4 rounded-none bg-accent/10 border border-accent/20 text-accent text-sm font-medium" role="alert" aria-live="polite">
        {errorMessage}
      </div>
    {/if}

    {#if successMessage}
      <div class="mb-6 p-4 rounded-none bg-success/10 border border-success/20 text-success text-sm font-medium" role="status" aria-live="polite">
        {successMessage}
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
        <label for="register-name" class="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
          Imię i Nazwisko
        </label>
        <input
          id="register-name"
          type="text"
          bind:value={fullName}
          placeholder="Jan Kowalski"
          required
          disabled={isSubmitting}
          autocomplete="name"
          class="w-full px-5 py-3.5 rounded-none bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 outline-none focus:border-primary/50 focus:bg-white/10 transition-all disabled:opacity-50"
        />
      </div>

      <div>
        <label for="register-email" class="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
          Adres Email
        </label>
        <input
          id="register-email"
          type="email"
          bind:value={email}
          placeholder="twoj@email.com"
          required
          disabled={isSubmitting}
          autocomplete="email"
          class="w-full px-5 py-3.5 rounded-none bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 outline-none focus:border-primary/50 focus:bg-white/10 transition-all disabled:opacity-50"
        />
      </div>

      <div>
        <label for="register-password" class="block text-[11px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">
          Hasło
        </label>
        <input
          id="register-password"
          type="password"
          bind:value={password}
          placeholder="Min. 8 znaków"
          required
          minlength="8"
          disabled={isSubmitting}
          autocomplete="new-password"
          class="w-full px-5 py-3.5 rounded-none bg-white/5 border border-white/10 text-foreground placeholder:text-muted/40 outline-none focus:border-primary/50 focus:bg-white/10 transition-all disabled:opacity-50"
        />
      </div>

      <div class="flex items-start gap-3 pt-2">
        <input
          id="register-terms"
          type="checkbox"
          bind:checked={acceptTerms}
          disabled={isSubmitting}
          class="mt-0.5 w-4 h-4 rounded-none border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-offset-dark cursor-pointer disabled:opacity-50"
        />
        <label for="register-terms" class="text-xs sm:text-sm text-muted leading-relaxed cursor-pointer">
          Akceptuję <a href="/regulamin" class="text-primary hover:underline">regulamin</a> oraz <a href="/polityka-prywatnosci" class="text-primary hover:underline">politykę prywatności</a>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        class="w-full py-4 mt-4 rounded-none bg-primary text-dark font-bold text-sm uppercase tracking-widest hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isSubmitting}
          <span class="inline-flex items-center gap-2">
            <Icon name="spinner" size={4} class="text-dark" />
            Przetwarzanie...
          </span>
        {:else}
          Zarejestruj się
        {/if}
      </button>
    </form>

    <div class="mt-8 text-center border-t border-white/10 pt-6">
      <p class="text-xs sm:text-sm text-muted">
        Masz już konto? Użyj przycisku w nagłówku strony.
      </p>
    </div>
  </div>
</div>
