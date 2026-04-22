<script lang="ts">
  import { supabase } from "../lib/supabase";

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
    } catch (err: any) {
      errorMessage = err.message || "Wystąpił błąd. Spróbuj ponownie.";
    } finally {
      isSubmitting = false;
    }
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    errorMessage = "";
    successMessage = "";
    isSubmitting = true;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
      });
      if (error) throw error;
    } catch (err: any) {
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
      <div class="mb-6 p-4 rounded-none bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
        {errorMessage}
      </div>
    {/if}

    {#if successMessage}
      <div class="mb-6 p-4 rounded-none bg-success/10 border border-success/20 text-success text-sm font-medium">
        {successMessage}
      </div>
    {/if}

    <div class="space-y-3 mb-6">
      <button 
        type="button"
        onclick={() => handleOAuth('google')}
        disabled={isSubmitting}
        class="w-full flex items-center justify-center gap-3 px-5 py-3 sm:py-3.5 rounded-none bg-white/5 border border-white/10 text-foreground font-bold text-xs sm:text-sm hover:bg-white/10 transition-all disabled:opacity-50"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Kontynuuj przez Google
      </button>

      <button 
        type="button"
        onclick={() => handleOAuth('apple')}
        disabled={isSubmitting}
        class="w-full flex items-center justify-center gap-3 px-5 py-3 sm:py-3.5 rounded-none bg-white/5 border border-white/10 text-foreground font-bold text-xs sm:text-sm hover:bg-white/10 transition-all disabled:opacity-50"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.947 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z"/>
        </svg>
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
            <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
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