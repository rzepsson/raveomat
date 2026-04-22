<script lang="ts">
  import { supabase } from "../lib/supabase";

  let name = $state("");
  let email = $state("");
  let topic = $state("");
  let message = $state("");
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errorMessage = "";
    successMessage = "";

    if (!name.trim() || !email.trim() || !topic.trim() || !message.trim()) {
      errorMessage = "Wszystkie pola są wymagane.";
      return;
    }

    isSubmitting = true;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert({
          name: name.trim(),
          email: email.trim(),
          topic: topic.trim(),
          message: message.trim(),
        });

      if (error) {
        errorMessage = "Wystąpił błąd. Spróbuj ponownie.";
        return;
      }

      successMessage = "Wiadomość wysłana! Odpowiemy najszybciej jak to możliwe.";
      name = "";
      email = "";
      topic = "";
      message = "";
    } catch {
      errorMessage = "Nie udało się połączyć z serwerem.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if successMessage}
  <div class="bg-white/5 border border-white/10 p-8 sm:p-12">
    <div class="text-center py-8">
      <p class="text-success text-lg font-bold">{successMessage}</p>
    </div>
  </div>
{:else}
  <div class="bg-white/5 border border-white/10 p-8 sm:p-12">
    {#if errorMessage}
      <div class="mb-8 p-4 bg-accent/10 border border-accent/20 text-accent text-sm font-medium" role="alert">
        {errorMessage}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-12">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="relative group">
          <input
            type="text"
            id="contact-name"
            bind:value={name}
            required
            disabled={isSubmitting}
            autocomplete="name"
            class="w-full bg-transparent border-0 border-b border-white/20 py-3 text-foreground placeholder:text-transparent focus:outline-none focus:border-primary peer transition-colors rounded-none"
            placeholder="Imię i Nazwisko"
          />
          <label 
            for="contact-name" 
            class="absolute left-0 top-3 text-sm font-bold text-muted uppercase tracking-widest transition-all duration-300 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-primary peer-valid:-top-5 peer-valid:text-[10px]"
          >
            Imię i Nazwisko
          </label>
        </div>

        <div class="relative group">
          <input
            type="email"
            id="contact-email"
            bind:value={email}
            required
            disabled={isSubmitting}
            autocomplete="email"
            class="w-full bg-transparent border-0 border-b border-white/20 py-3 text-foreground placeholder:text-transparent focus:outline-none focus:border-primary peer transition-colors rounded-none"
            placeholder="Adres Email"
          />
          <label 
            for="contact-email" 
            class="absolute left-0 top-3 text-sm font-bold text-muted uppercase tracking-widest transition-all duration-300 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-primary peer-valid:-top-5 peer-valid:text-[10px]"
          >
            Adres Email
          </label>
        </div>
      </div>

      <div class="relative group mt-12">
        <input
          type="text"
          id="contact-topic"
          bind:value={topic}
          required
          disabled={isSubmitting}
          class="w-full bg-transparent border-0 border-b border-white/20 py-3 text-foreground placeholder:text-transparent focus:outline-none focus:border-primary peer transition-colors rounded-none"
          placeholder="Temat"
        />
        <label 
          for="contact-topic" 
          class="absolute left-0 top-3 text-sm font-bold text-muted uppercase tracking-widest transition-all duration-300 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-primary peer-valid:-top-5 peer-valid:text-[10px]"
        >
          Temat Rozmowy
        </label>
      </div>

      <div class="relative group mt-12">
        <textarea
          id="contact-message"
          bind:value={message}
          rows="4"
          required
          disabled={isSubmitting}
          class="w-full bg-transparent border-0 border-b border-white/20 py-3 text-foreground placeholder:text-transparent focus:outline-none focus:border-primary peer transition-colors resize-none rounded-none"
          placeholder="Twoja wiadomość"
        ></textarea>
        <label 
          for="contact-message" 
          class="absolute left-0 top-3 text-sm font-bold text-muted uppercase tracking-widest transition-all duration-300 peer-focus:-top-5 peer-focus:text-[10px] peer-focus:text-primary peer-valid:-top-5 peer-valid:text-[10px]"
        >
          Wiadomość
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        class="group w-full md:w-auto inline-flex items-center justify-center gap-4 px-12 py-5 bg-white border border-white text-dark font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:bg-transparent hover:text-white disabled:opacity-50"
      >
        {isSubmitting ? "Wysyłanie..." : "Wyślij Wiadomość"}
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </form>
  </div>
{/if}
