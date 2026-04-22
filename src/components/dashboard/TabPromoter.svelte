<script lang="ts">
  import { supabase } from "../../lib/supabase";

  let inviteCode = $state("");
  let isLoading = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  async function handleJoin() {
    if (!inviteCode.trim()) {
      errorMessage = "Wpisz kod dostępu";
      return;
    }

    isLoading = true;
    errorMessage = "";
    successMessage = "";

    try {
      const { data, error } = await supabase.rpc("join_organization_by_code", {
        p_invite_code: inviteCode.trim(),
      });

      if (error) {
        errorMessage = error.message === "Invalid invite code" 
          ? "Nieprawidłowy kod dostępu" 
          : "Błąd połączenia. Spróbuj ponownie.";
        isLoading = false;
        return;
      }

      successMessage = "Dołączono do organizacji!";
      inviteCode = "";
      
      setTimeout(() => {
        window.location.href = "/panel/organizacja";
      }, 800);

    } catch (err) {
      errorMessage = "Nieoczekiwany błąd. Spróbuj ponownie.";
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto">
  <div class="text-center mb-12">
    <div class="inline-flex items-center justify-center w-20 h-20 border-4 border-white/20 mb-8">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
        <rect x="3" y="11" width="18" height="11" rx="0" ry="0"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    <h2 class="font-display text-4xl lg:text-5xl text-foreground uppercase tracking-tight mb-4">
      Dołącz do Organizacji
    </h2>
    <p class="text-muted text-lg max-w-md mx-auto">
      Wpisz kod dostępu otrzymany od organizatora, aby odblokować funkcje promotora.
    </p>
  </div>

  <div class="bg-white/5 border-4 border-white/10 p-8 lg:p-12">
    <div class="space-y-6">
      <div class="relative">
        <input
          id="inviteCode"
          type="text"
          bind:value={inviteCode}
          placeholder=" "
          disabled={isLoading}
          class="w-full bg-transparent border-b-4 border-white/20 text-foreground text-xl font-mono uppercase tracking-wider px-4 py-4 placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors duration-200 disabled:opacity-50 peer"
        />
        <label 
          for="inviteCode" 
          class="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm uppercase tracking-widest transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary"
        >
          Kod Dostępu
        </label>
      </div>

      {#if errorMessage}
        <div class="bg-red-500/10 border-4 border-red-500/30 px-6 py-4">
          <p class="text-red-400 text-sm font-bold uppercase tracking-wider">{errorMessage}</p>
        </div>
      {/if}

      {#if successMessage}
        <div class="bg-primary/10 border-4 border-primary/30 px-6 py-4">
          <p class="text-primary text-sm font-bold uppercase tracking-wider">{successMessage}</p>
        </div>
      {/if}

      <button
        type="button"
        onclick={handleJoin}
        disabled={isLoading}
        class="w-full px-8 py-5 bg-primary text-dark font-display font-bold text-lg uppercase tracking-[0.2em] hover:bg-white disabled:bg-white/20 disabled:text-dark/50 transition-all duration-300 active:scale-[0.98]"
      >
        {#if isLoading}
          <span class="flex items-center justify-center gap-3">
            <span class="w-5 h-5 border-2 border-dark/30 border-t-dark animate-spin"></span>
            Przetwarzanie...
          </span>
        {:else}
          Potwierdź
        {/if}
      </button>
    </div>
  </div>

  <div class="mt-8 text-center">
    <p class="text-xs text-muted uppercase tracking-widest">
      Nie masz kodu? Skontaktuj się z organizatorem wydarzenia.
    </p>
  </div>
</div>
