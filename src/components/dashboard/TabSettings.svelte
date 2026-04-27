<script lang="ts">
  import type { User } from "@supabase/supabase-js";
  import { actions, isInputError } from "astro:actions";
  import { authUser, authProfile, loadUserProfile } from "../../lib/authStore";
  import { pushNotification } from "../../lib/notification";
  import type { Profile } from "../../lib/types";
  import Icon from "../Icon.svelte";

  let currentUser: User | null = $state(null);
  let profile: Profile | null = $state(null);

  $effect(() => {
    const unsub = authUser.subscribe((value) => {
      currentUser = value;
    });
    return unsub;
  });

  $effect(() => {
    const unsub = authProfile.subscribe((value) => {
      profile = value;
    });
    return unsub;
  });

  const displayName = $derived(
    profile?.full_name || currentUser?.user_metadata?.full_name || "—"
  );

  const authProvider = $derived.by(() => {
    const providers = currentUser?.app_metadata?.providers;
    if (!providers || !Array.isArray(providers)) return "email";
    if (providers.includes("google")) return "google";
    if (providers.includes("apple")) return "apple";
    return "email";
  });

  const isOAuthUser = $derived(authProvider === "google" || authProvider === "apple");
  const authProviderLabel = $derived(
    authProvider === "google" ? "Google" : authProvider === "apple" ? "Apple" : "Email"
  );

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 text-foreground text-sm placeholder:text-muted/40 outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all disabled:opacity-50";

  const passwordInputClass =
    "w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 text-foreground text-sm placeholder:text-muted/40 outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all disabled:opacity-50";

  const labelClass =
    "block text-[11px] font-bold text-muted uppercase tracking-widest mb-2";

  const btnPrimary =
    "inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-dark font-bold text-xs uppercase tracking-widest hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

  const btnGhost =
    "inline-flex items-center justify-center gap-2 px-5 py-3 border border-white/20 text-foreground font-bold text-xs uppercase tracking-widest hover:border-white hover:bg-white hover:text-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

  const btnSecondary =
    "inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-white/5 border border-white/10 text-foreground font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  function formatDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // ─── Profile Edit ─────────────────────────────
  let isEditingProfile = $state(false);
  let isSavingProfile = $state(false);
  let editFullName = $state("");
  let editPhone = $state("");
  let editCity = $state("");

  function startEditProfile() {
    editFullName = profile?.full_name || currentUser?.user_metadata?.full_name || "";
    editPhone = profile?.phone || "";
    editCity = profile?.city || "";
    isEditingProfile = true;
  }

  function cancelEditProfile() {
    isEditingProfile = false;
  }

  async function saveProfile() {
    if (!currentUser) return;
    isSavingProfile = true;

    try {
      const result = await actions.updateProfile({
        fullName: editFullName.trim(),
        phone: editPhone.trim() || null,
        city: editCity.trim() || null,
      });

      if (result.error) {
        if (isInputError(result.error)) {
          const msg =
            result.error.fields.fullName?.[0]
            || result.error.fields.phone?.[0]
            || result.error.fields.city?.[0]
            || "Dane formularza są niepoprawne.";
          pushNotification("error", msg);
        } else {
          pushNotification("error", result.error.message || "Nie udało się zaktualizować profilu.");
        }
        return;
      }

      await loadUserProfile(currentUser.id);
      isEditingProfile = false;
      pushNotification("success", "Profil został zaktualizowany.");
    } catch {
      pushNotification("error", "Nie udało się połączyć z serwerem.");
    } finally {
      isSavingProfile = false;
    }
  }

  // ─── Password Change ──────────────────────────
  let showPasswordForm = $state(false);
  let isChangingPassword = $state(false);
  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  let showCurrentPassword = $state(false);
  let showNewPassword = $state(false);
  let showConfirmPassword = $state(false);

  const passwordStrength = $derived.by(() => {
    const p = newPassword;
    if (!p || p.length === 0) return { score: 0, label: "", color: "" };

    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { score: 1, label: "Słabe", color: "bg-accent" };
    if (score <= 2) return { score: 2, label: "Dostateczne", color: "bg-yellow-500" };
    if (score <= 3) return { score: 3, label: "Dobre", color: "bg-primary" };
    return { score: 4, label: "Silne", color: "bg-success" };
  });

  const passwordsMatch = $derived(
    confirmPassword.length === 0 || newPassword === confirmPassword
  );

  function togglePasswordForm() {
    showPasswordForm = !showPasswordForm;
    if (!showPasswordForm) {
      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
      showCurrentPassword = false;
      showNewPassword = false;
      showConfirmPassword = false;
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      pushNotification("error", "Nowe hasła nie są identyczne.");
      return;
    }
    if (newPassword.length < 8) {
      pushNotification("error", "Nowe hasło musi mieć co najmniej 8 znaków.");
      return;
    }
    if (currentPassword === newPassword) {
      pushNotification("error", "Nowe hasło musi różnić się od obecnego.");
      return;
    }

    isChangingPassword = true;

    try {
      const result = await actions.changePassword({
        currentPassword,
        newPassword,
      });

      if (result.error) {
        if (isInputError(result.error)) {
          const msg =
            result.error.fields.currentPassword?.[0]
            || result.error.fields.newPassword?.[0]
            || "Dane formularza są niepoprawne.";
          pushNotification("error", msg);
        } else {
          pushNotification("error", result.error.message || "Nie udało się zmienić hasła.");
        }
        return;
      }

      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
      showCurrentPassword = false;
      showNewPassword = false;
      showConfirmPassword = false;
      showPasswordForm = false;
      pushNotification("success", "Hasło zostało zmienione.");
    } catch {
      pushNotification("error", "Nie udało się połączyć z serwerem.");
    } finally {
      isChangingPassword = false;
    }
  }

  // ─── Password Reset ───────────────────────────
  let isSendingReset = $state(false);

  async function handleSendReset() {
    if (!currentUser) return;
    isSendingReset = true;

    try {
      const result = await actions.sendPasswordReset({});

      if (result.error) {
        pushNotification("error", result.error.message || "Nie udało się wysłać emaila.");
        return;
      }

      pushNotification("success", `Link do resetowania hasła został wysłany na ${currentUser.email}.`);
    } catch {
      pushNotification("error", "Nie udało się połączyć z serwerem.");
    } finally {
      isSendingReset = false;
    }
  }
</script>

<div class="space-y-6">

  <!-- ─── Identity Card ─────────────────────────── -->
  <section class="bg-white/[0.03] border border-white/10 overflow-hidden" aria-labelledby="identity-heading">
    <div class="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-white/10 bg-white/[0.02]">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="user" size={4} class="text-primary" />
        </div>
        <div>
          <h2 id="identity-heading" class="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Dane profilu</h2>
          <p class="text-[11px] text-muted mt-0.5 hidden sm:block">Zarządzaj swoimi danymi osobowymi</p>
        </div>
      </div>
      <button
        type="button"
        onclick={isEditingProfile ? cancelEditProfile : startEditProfile}
        class="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
        aria-label={isEditingProfile ? "Anuluj edycję" : "Edytuj profil"}
      >
        <Icon name={isEditingProfile ? "close" : "edit"} size={4} />
      </button>
    </div>

    <div class="p-5 sm:p-8">
      {#if !isEditingProfile}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Imię i nazwisko</span>
            <div class="text-sm text-foreground font-medium">{displayName}</div>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Adres Email</span>
            <div class="text-sm text-foreground font-medium truncate">{profile?.email || currentUser?.email || "—"}</div>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Telefon</span>
            <div class="text-sm {profile?.phone ? 'text-foreground' : 'text-muted/50'} font-medium">
              {profile?.phone || "Nie ustawiono"}
            </div>
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Miasto</span>
            <div class="text-sm {profile?.city ? 'text-foreground' : 'text-muted/50'} font-medium">
              {profile?.city || "Nie ustawiono"}
            </div>
          </div>
        </div>
      {:else}
        <form
          onsubmit={(e) => { e.preventDefault(); void saveProfile(); }}
          class="space-y-5"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="sm:col-span-2">
              <label for="edit-fullname" class={labelClass}>Imię i nazwisko</label>
              <input
                id="edit-fullname"
                type="text"
                bind:value={editFullName}
                placeholder="Jan Kowalski"
                required
                minlength="2"
                maxlength="120"
                disabled={isSavingProfile}
                autocomplete="name"
                class={inputClass}
              />
            </div>
            <div>
              <label for="edit-phone" class={labelClass}>Telefon</label>
              <input
                id="edit-phone"
                type="tel"
                bind:value={editPhone}
                placeholder="+48 123 456 789"
                maxlength="30"
                disabled={isSavingProfile}
                autocomplete="tel"
                class={inputClass}
              />
            </div>
            <div>
              <label for="edit-city" class={labelClass}>Miasto</label>
              <input
                id="edit-city"
                type="text"
                bind:value={editCity}
                placeholder="Warszawa"
                maxlength="100"
                disabled={isSavingProfile}
                autocomplete="address-level2"
                class={inputClass}
              />
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={isSavingProfile} class={btnPrimary}>
              {#if isSavingProfile}
                <Icon name="spinner" size={4} class="text-dark" />
                <span>Zapisywanie...</span>
              {:else}
                <span>Zapisz profil</span>
              {/if}
            </button>
            <button type="button" onclick={cancelEditProfile} disabled={isSavingProfile} class={btnGhost}>
              Anuluj
            </button>
          </div>
        </form>
      {/if}
    </div>
  </section>

  <!-- ─── Security Card ─────────────────────────── -->
  <section class="bg-white/[0.03] border border-white/10 overflow-hidden" aria-labelledby="security-heading">
    <div class="flex items-center gap-3 px-5 sm:px-8 py-5 border-b border-white/10 bg-white/[0.02]">
      <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon name="shield" size={4} class="text-primary" />
      </div>
      <div>
        <h2 id="security-heading" class="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Bezpieczeństwo</h2>
        <p class="text-[11px] text-muted mt-0.5 hidden sm:block">Zarządzaj hasłem i opcjami logowania</p>
      </div>
    </div>

    <div class="p-5 sm:p-8">
      {#if isOAuthUser}
        <div class="space-y-6">
          <div class="flex items-start gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="lock" size={5} class="text-primary" />
            </div>
            <div>
              <p class="text-sm text-foreground font-medium">
                Logowanie przez {authProviderLabel}
              </p>
              <p class="text-xs text-muted mt-1 leading-relaxed">
                Twoje hasło jest zarządzane przez dostawcę {authProviderLabel}.
              </p>
            </div>
          </div>

          <div>
            <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-3">Resetowanie hasła</span>
            <p class="text-xs text-muted leading-relaxed mb-4">
              Wyślij link do resetowania hasła na swój adres email.
            </p>
            <button
              type="button"
              onclick={() => void handleSendReset()}
              disabled={isSendingReset}
              class={btnSecondary}
            >
              {#if isSendingReset}
                <Icon name="spinner" size={4} />
                <span>Wysyłanie...</span>
              {:else}
                <Icon name="mail" size={4} />
                <span>Wyślij link resetujący</span>
              {/if}
            </button>
          </div>
        </div>
      {:else}
        <div class="space-y-6">
          <p class="text-muted text-sm leading-relaxed">
            Regularna zmiana hasła zwiększa bezpieczeństwo Twojego konta.
          </p>

          {#if !showPasswordForm}
            <button
              type="button"
              onclick={togglePasswordForm}
              class="w-full py-3.5 border border-white/20 text-foreground font-bold text-xs uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all"
            >
              Zmień hasło
            </button>

            <div class="border-t border-white/10 pt-5">
              <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-3">Nie pamiętasz hasła?</span>
              <button
                type="button"
                onclick={() => void handleSendReset()}
                disabled={isSendingReset}
                class={btnSecondary}
              >
                {#if isSendingReset}
                  <Icon name="spinner" size={4} />
                  <span>Wysyłanie...</span>
                {:else}
                  <Icon name="mail" size={4} />
                  <span>Wyślij link resetujący</span>
                {/if}
              </button>
            </div>
          {:else}
            <form
              onsubmit={(e) => { e.preventDefault(); void handleChangePassword(); }}
              class="space-y-4"
            >
              <div>
                <label for="current-password" class={labelClass}>Obecne hasło</label>
                <div class="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    bind:value={currentPassword}
                    placeholder="••••••••"
                    required
                    disabled={isChangingPassword}
                    autocomplete="current-password"
                    class={passwordInputClass}
                  />
                  <button
                    type="button"
                    onclick={() => showCurrentPassword = !showCurrentPassword}
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors"
                    aria-label={showCurrentPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  >
                    <Icon name={showCurrentPassword ? "eye-off" : "eye"} size={4} />
                  </button>
                </div>
              </div>

              <div>
                <label for="new-password" class={labelClass}>Nowe hasło</label>
                <div class="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    bind:value={newPassword}
                    placeholder="Min. 8 znaków"
                    required
                    minlength="8"
                    maxlength="128"
                    disabled={isChangingPassword}
                    autocomplete="new-password"
                    class={passwordInputClass}
                  />
                  <button
                    type="button"
                    onclick={() => showNewPassword = !showNewPassword}
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors"
                    aria-label={showNewPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  >
                    <Icon name={showNewPassword ? "eye-off" : "eye"} size={4} />
                  </button>
                </div>

                {#if newPassword.length > 0}
                  <div class="mt-2.5 flex items-center gap-3">
                    <div class="flex gap-1 flex-1">
                      {#each [1, 2, 3, 4] as bar}
                        <div
                          class="h-1.5 flex-1 rounded-full transition-all duration-300 {passwordStrength.score >= bar ? passwordStrength.color : 'bg-white/10'}"
                        ></div>
                      {/each}
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-widest {passwordStrength.score <= 1 ? 'text-accent' : passwordStrength.score <= 2 ? 'text-yellow-500' : passwordStrength.score <= 3 ? 'text-primary' : 'text-success'}">
                      {passwordStrength.label}
                    </span>
                  </div>
                {/if}
              </div>

              <div>
                <label for="confirm-password" class={labelClass}>Potwierdź nowe hasło</label>
                <div class="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    bind:value={confirmPassword}
                    placeholder="Powtórz nowe hasło"
                    required
                    minlength="8"
                    maxlength="128"
                    disabled={isChangingPassword}
                    autocomplete="new-password"
                    class="{passwordInputClass} {!passwordsMatch ? 'border-accent/50!' : ''}"
                  />
                  <button
                    type="button"
                    onclick={() => showConfirmPassword = !showConfirmPassword}
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  >
                    <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={4} />
                  </button>
                </div>
                {#if !passwordsMatch}
                  <p class="text-accent text-[10px] font-bold mt-1.5 uppercase tracking-widest">Hasła nie są identyczne</p>
                {/if}
              </div>

              <div class="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={isChangingPassword || !passwordsMatch} class={btnPrimary}>
                  {#if isChangingPassword}
                    <Icon name="spinner" size={4} class="text-dark" />
                    <span>Zmienianie...</span>
                  {:else}
                    <span>Zapisz hasło</span>
                  {/if}
                </button>
                <button
                  type="button"
                  onclick={togglePasswordForm}
                  disabled={isChangingPassword}
                  class={btnGhost}
                >
                  Anuluj
                </button>
              </div>
            </form>
          {/if}
        </div>
      {/if}
    </div>
  </section>

  <!-- ─── Account Info Card ─────────────────────── -->
  <section class="bg-white/[0.03] border border-white/10 overflow-hidden" aria-labelledby="account-heading">
    <div class="flex items-center gap-3 px-5 sm:px-8 py-5 border-b border-white/10 bg-white/[0.02]">
      <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon name="info" size={4} class="text-primary" />
      </div>
      <div>
        <h2 id="account-heading" class="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Informacje o koncie</h2>
        <p class="text-[11px] text-muted mt-0.5 hidden sm:block">Szczegóły techniczne Twojego konta</p>
      </div>
    </div>

    <div class="p-5 sm:p-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Adres Email</span>
          <div class="text-sm text-foreground font-medium truncate">{profile?.email || currentUser?.email || "—"}</div>
        </div>
        <div>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Dostawca logowania</span>
          <div class="flex items-center gap-2">
            {#if authProvider === "google"}
              <Icon name="google" size={4} />
            {:else if authProvider === "apple"}
              <Icon name="apple" size={4} />
            {:else}
              <Icon name="mail" size={4} class="text-muted" />
            {/if}
            <span class="text-sm text-foreground font-medium">{authProviderLabel}</span>
          </div>
        </div>
        <div>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Weryfikacja email</span>
          {#if profile?.email_verified}
            <span class="inline-flex items-center gap-1.5 text-success text-xs font-bold uppercase tracking-widest">
              <Icon name="check" size={4} />
              Zweryfikowany
            </span>
          {:else}
            <span class="inline-flex items-center gap-1.5 text-muted text-xs font-bold uppercase tracking-widest">
              <Icon name="info" size={4} />
              Niezweryfikowany
            </span>
          {/if}
        </div>
        <div>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Data utworzenia</span>
          <div class="text-sm text-foreground font-medium">
            {formatDate(profile?.created_at || currentUser?.created_at)}
          </div>
        </div>
        <div>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Ostatnia aktualizacja</span>
          <div class="text-sm text-foreground font-medium">
            {formatDate(profile?.updated_at)}
          </div>
        </div>
        <div>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1.5">Identyfikator</span>
          <div class="text-xs text-muted font-mono bg-dark/50 p-2.5 border border-white/5 select-all rounded truncate">
            {currentUser?.id || "—"}
          </div>
        </div>
      </div>
    </div>
  </section>

</div>
