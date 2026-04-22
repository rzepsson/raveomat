<script lang="ts">
  import { supabase } from "../lib/supabase";

  let email = $state("");
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMessage = "";
    successMessage = "";

    if (!email.trim()) {
      errorMessage = "Wpisz adres email";
      return;
    }

    isSubmitting = true;

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim() });

      if (error) {
        if (error.code === "23505") {
          errorMessage = "Ten adres email jest już zapisany.";
        } else {
          errorMessage = "Wystąpił błąd. Spróbuj ponownie.";
        }
        return;
      }

      successMessage = "Zapisano! Będziemy Ci informować o nowych wydarzeniach.";
      email = "";
    } catch {
      errorMessage = "Nie udało się połączyć z serwerem.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="w-full lg:w-auto flex-1 max-w-md mx-auto lg:mx-0 lg:ml-auto border border-white/10 bg-dark/50 backdrop-blur-md p-6 sm:p-8">
  {#if successMessage}
    <div class="p-4 bg-success/10 border border-success/20 text-success text-sm font-medium text-center" role="status">
      {successMessage}
    </div>
  {:else}
    <form onsubmit={handleSubmit} class="flex flex-col gap-4">
      <div class="relative">
        <label for="newsletter-email" class="sr-only">Adres email</label>
        <input
          type="email"
          id="newsletter-email"
          bind:value={email}
          placeholder="Twój adres e-mail"
          required
          disabled={isSubmitting}
          autocomplete="email"
          class="w-full px-6 py-4 bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-medium rounded-none disabled:opacity-50"
        />
      </div>
      {#if errorMessage}
        <p class="text-accent text-xs font-bold uppercase tracking-wider" role="alert">{errorMessage}</p>
      {/if}
      <button
        type="submit"
        disabled={isSubmitting}
        class="w-full px-8 py-4 font-bold text-dark bg-primary uppercase tracking-widest transition-all duration-300 hover:bg-white active:scale-[0.98] rounded-none shadow-[0_0_20px_rgba(162,255,0,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50"
      >
        {isSubmitting ? "Zapisywanie..." : "Zapisz się"}
      </button>
    </form>
  {/if}
  
  <p class="mt-5 text-[10px] font-bold text-muted uppercase tracking-[0.15em] text-center">
    Szanujemy Twoją prywatność. Możesz wypisać się w dowolnej chwili.
  </p>
</div>
