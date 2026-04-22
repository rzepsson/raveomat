<script lang="ts">
  import { supabase } from "../../lib/supabase";
  import { userOrganizations } from "../../lib/authStore";
  import type { OrganizationMembership } from "../../lib/authStore";

  interface Props {
    organizations?: OrganizationMembership[];
  }

  let { organizations }: Props = $props();

  let activeOrganizationId = $state<string>("");
  let currentView = $state<ViewState>("list");
  let events = $state<EventData[]>([]);
  let isLoading = $state(true);
  let errorMessage = $state("");
  let selectedEvent = $state<EventData | null>(null);
  let isSaving = $state(false);
  let formError = $state("");

  let title = $state("");
  let date = $state("");
  let venue = $state("");
  let price = $state(0);
  let totalTickets = $state(0);
  let genre = $state<EventGenre>("techno");
  let type = $state<EventType>("club");
  let description = $state("");
  let imageUrl = $state("");
  let croppedImageBlob = $state<Blob | null>(null);

  let imageFile = $state<File | null>(null);
  let originalImageSrc = $state("");
  let isCropping = $state(false);
  let cropperCanvas = $state<HTMLCanvasElement | null>(null);
  let cropZone = $state({ x: 0, y: 0, width: 0, height: 0 });
  let isDragging = $state(false);
  let dragStart = $state({ x: 0, y: 0 });
  let cropContainerWidth = $state(400);
  let cropContainerRef = $state<HTMLDivElement | null>(null);
  let imageNaturalWidth = $state(1);
  let imageNaturalHeight = $state(1);



  const GENRE_OPTIONS: EventGenre[] = ["techno", "house", "dnb", "trance"];
  const TYPE_OPTIONS: EventType[] = ["club", "festival", "outdoor"];

  type ViewState = "list" | "form";
  type EventGenre = "techno" | "house" | "dnb" | "trance";
  type EventType = "club" | "festival" | "outdoor";
  type EventStatus = "available" | "soldout" | "draft";

  interface EventData {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    totalTickets: number;
    soldTickets: number;
    genre: EventGenre;
    type: EventType;
    description: string;
    imageUrl: string;
    status: EventStatus;
    organizationId: string;
  }

  const effectiveOrganizations = $derived(
    organizations && organizations.length > 0 ? organizations : $userOrganizations
  );

  $effect(() => {
    if (effectiveOrganizations.length > 0 && !activeOrganizationId) {
      activeOrganizationId = effectiveOrganizations[0].organizationId;
    }
  });

  $effect(() => {
    if (activeOrganizationId) {
      loadEvents();
    }
  });

  async function loadEvents() {
    if (!activeOrganizationId) return;

    isLoading = true;
    errorMessage = "";

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("organization_id", activeOrganizationId)
      .order("date", { ascending: true });

    if (error) {
      errorMessage = error.message;
      isLoading = false;
      return;
    }

    if (data) {
      events = data.map((row: any) => ({
        id: row.id,
        title: row.title || "",
        date: row.date || "",
        venue: row.venue || "",
        price: row.price || 0,
        totalTickets: row.total_tickets || 0,
        soldTickets: row.sold_tickets || 0,
        genre: row.genre || "techno",
        type: row.type || "club",
        description: row.description || "",
        imageUrl: row.image_url || "",
        status: row.status || "draft",
        organizationId: row.organization_id || "",
      }));
    }

    isLoading = false;
  }

  function switchOrganization(orgId: string) {
    activeOrganizationId = orgId;
  }

  function openAddForm() {
    selectedEvent = null;
    title = "";
    date = "";
    venue = "";
    price = 0;
    totalTickets = 0;
    genre = "techno";
    type = "club";
    description = "";
    imageUrl = "";
    croppedImageBlob = null;
    currentView = "form";
  }

  function openEditForm(event: EventData) {
    selectedEvent = event;
    title = event.title;
    date = event.date;
    venue = event.venue;
    price = event.price;
    totalTickets = event.totalTickets;
    genre = event.genre;
    type = event.type;
    description = event.description;
    imageUrl = event.imageUrl;
    croppedImageBlob = null;
    currentView = "form";
  }

  function closeForm() {
    currentView = "list";
    selectedEvent = null;
    formError = "";
    imageFile = null;
    croppedImageBlob = null;
    originalImageSrc = "";
    isCropping = false;
  }

  function handleImageSelect(e: Event & { currentTarget: HTMLInputElement }) {
    const target = e.currentTarget;
    if (!target.files || !target.files[0]) return;

    const file = target.files[0];
    if (!file.type.startsWith("image/")) {
      formError = "Wybierz plik obrazu";
      return;
    }

    imageFile = file;
    originalImageSrc = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      imageNaturalWidth = img.width;
      imageNaturalHeight = img.height;
      initCropZone(img);
      isCropping = true;
    };
    img.src = originalImageSrc;
  }

  function initCropZone(img: HTMLImageElement) {
    const containerWidth = 400;
    const aspectRatio = 4 / 3;
    const containerHeight = containerWidth / aspectRatio;
    const scale = containerWidth / img.width;
    const scaledHeight = img.height * scale;

    let zoneHeight = containerHeight;
    let zoneY = (scaledHeight - zoneHeight) / 2;
    if (zoneY < 0) {
      zoneY = 0;
      zoneHeight = scaledHeight;
    }

    cropZone = {
      x: 0,
      y: zoneY,
      width: containerWidth,
      height: zoneHeight,
    };
  }

  function handleCropMouseDown(e: MouseEvent) {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
  }

  function handleCropMouseMove(e: MouseEvent) {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const containerWidth = 400;
    const aspectRatio = 4 / 3;
    const containerHeight = containerWidth / aspectRatio;

    const scaleX = imageNaturalWidth / containerWidth;
    const scaleY = imageNaturalHeight / (imageNaturalWidth / containerWidth * imageNaturalHeight);

    const scaledZoneHeight = containerHeight;
    const maxY = (imageNaturalHeight * (containerWidth / imageNaturalWidth)) - scaledZoneHeight;

    let newX = cropZone.x + deltaX;
    let newY = cropZone.y + deltaY;

    newX = Math.max(0, Math.min(containerWidth - cropZone.width, newX));
    newY = Math.max(0, Math.min(maxY, newY));

    cropZone = {
      x: newX,
      y: newY,
      width: cropZone.width,
      height: cropZone.height,
    };

    dragStart = { x: e.clientX, y: e.clientY };
  }

  function handleCropMouseUp() {
    isDragging = false;
  }

  function applyCrop() {
    if (!imageFile) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const aspectRatio = 4 / 3;
    const outputWidth = 800;
    const outputHeight = Math.round(outputWidth / aspectRatio);

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const scaleX = imageNaturalWidth / 400;
    const scaleY = imageNaturalHeight / (imageNaturalWidth / 400 * imageNaturalHeight);

    const cropX = cropZone.x * scaleX;
    const cropY = cropZone.y * scaleY;
    const cropW = cropZone.width * scaleX;
    const cropH = cropZone.height * scaleY;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        outputWidth,
        outputHeight
      );

      canvas.toBlob((blob) => {
        if (blob) {
          croppedImageBlob = blob;
          const reader = new FileReader();
          reader.onload = () => {
            imageUrl = reader.result as string;
          };
          reader.readAsDataURL(blob);
        }
        isCropping = false;
        imageFile = null;
        originalImageSrc = "";
      }, "image/jpeg", 0.9);
    };
    img.src = originalImageSrc;
  }

  function cancelCrop() {
    isCropping = false;
    imageFile = null;
    originalImageSrc = "";
  }

  async function uploadImageToStorage(blob: Blob, fileName: string): Promise<string | null> {
    const { error } = await supabase.storage
      .from("event-posters")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      formError = "Błąd uploadu obrazu: " + error.message;
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("event-posters")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async function saveEvent() {
    if (!title.trim()) {
      formError = "Tytuł jest wymagany";
      return;
    }

    if (!date) {
      formError = "Data jest wymagana";
      return;
    }

    if (!venue.trim()) {
      formError = "Miejsce jest wymagane";
      return;
    }

    if (price < 0) {
      formError = "Cena nie może być ujemna";
      return;
    }

    if (totalTickets <= 0) {
      formError = "Liczba biletów musi być większa od 0";
      return;
    }

    if (!selectedEvent && !croppedImageBlob && !imageUrl) {
      formError = "Obraz plakatu jest wymagany";
      return;
    }

    isSaving = true;
    formError = "";

    let finalImageUrl = imageUrl;

    if (croppedImageBlob) {
      const fileName = `${activeOrganizationId}/${Date.now()}.jpg`;
      const uploadedUrl = await uploadImageToStorage(croppedImageBlob, fileName);
      if (!uploadedUrl) {
        isSaving = false;
        return;
      }
      finalImageUrl = uploadedUrl;
    }

    const eventPayload = {
      title: title.trim(),
      date: date,
      venue: venue.trim(),
      price: price,
      total_tickets: totalTickets,
      genre: genre,
      type: type,
      description: description.trim(),
      image_url: finalImageUrl,
      organization_id: activeOrganizationId,
      status: totalTickets > 0 ? "available" : "draft",
    };

    if (selectedEvent) {
      const { error } = await supabase
        .from("events")
        .update(eventPayload)
        .eq("id", selectedEvent.id);

      if (error) {
        formError = "Błąd aktualizacji: " + error.message;
        isSaving = false;
        return;
      }
    } else {
      const { error } = await supabase.from("events").insert(eventPayload);

      if (error) {
        formError = "Błąd tworzenia: " + error.message;
        isSaving = false;
        return;
      }
    }

    croppedImageBlob = null;
    await loadEvents();
    currentView = "list";
    isSaving = false;
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusLabel(status: EventStatus): string {
    switch (status) {
      case "available":
        return "Sprzedaż";
      case "soldout":
        return "Wyprzedane";
      case "draft":
        return "Szkic";
      default:
        return status;
    }
  }

  function getStatusClass(status: EventStatus): string {
    switch (status) {
      case "available":
        return "bg-success/10 text-success border-success/30";
      case "soldout":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "draft":
        return "bg-white/5 text-muted border-white/10";
      default:
        return "bg-white/5 text-muted border-white/10";
    }
  }
</script>

{#if currentView === "list"}
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-[10px] uppercase tracking-[0.3em] text-primary font-bold block mb-2">
          Moduł Organizatora
        </span>
        <h2 class="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter text-foreground">
          Zarządzanie Wydarzeniami
        </h2>
      </div>
      <div class="flex items-center gap-4">
        {#if effectiveOrganizations.length > 1}
          <div class="flex items-center gap-2">
            <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">Organizacja:</span>
            <div class="flex flex-wrap gap-2">
              {#each effectiveOrganizations as org}
                <button
                  onclick={() => switchOrganization(org.organizationId)}
                  class="px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors {activeOrganizationId === org.organizationId
                    ? 'bg-primary text-dark border-primary'
                    : 'bg-transparent text-foreground border-white/20 hover:border-primary'}"
                >
                  {org.name}
                </button>
              {/each}
            </div>
          </div>
        {/if}
        <button
          onclick={openAddForm}
          class="px-8 py-4 bg-primary text-dark font-display font-bold text-sm uppercase tracking-[0.2em] hover:bg-white transition-colors duration-200"
        >
          DODAJ WYDARZENIE
        </button>
      </div>
    </div>

    {#if isLoading}
      <div class="border border-white/10 bg-white/5 p-8 animate-pulse">
        <div class="h-8 w-64 bg-white/5 mb-8"></div>
        <div class="space-y-4">
          {#each Array(3) as _}
            <div class="h-20 bg-white/5"></div>
          {/each}
        </div>
      </div>

    {:else if errorMessage}
      <div class="border border-red-500/30 bg-red-500/10 p-8">
        <p class="text-red-400 font-bold uppercase tracking-widest">{errorMessage}</p>
      </div>

    {:else if events.length === 0}
      <div class="border border-dashed border-white/10 bg-white/5 p-16 flex flex-col items-center justify-center text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-muted mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="square">
          <rect x="3" y="4" width="18" height="18" rx="0" ry="0"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <h3 class="text-2xl font-display uppercase text-foreground mb-4 tracking-tighter">Brak Wydarzeń</h3>
        <p class="text-muted text-sm mb-8">Utwórz pierwsze wydarzenie dla Twojej organizacji.</p>
        <button
          onclick={openAddForm}
          class="px-8 py-4 border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-dark transition-colors"
        >
          Utwórz Wydarzenie
        </button>
      </div>

    {:else}
      <div class="border border-white/10 bg-dark overflow-hidden">
        <div class="grid grid-cols-[2fr_1fr_1fr_100px_100px_100px_80px] gap-4 px-6 py-4 bg-white/5 border-b border-white/10">
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">Data</span>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">Nazwa</span>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">Miejsce</span>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-bold text-center">Status</span>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-bold text-center">Sprzedane</span>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-bold text-center">Bilety</span>
          <span class="text-[10px] uppercase tracking-[0.2em] text-muted font-bold text-center">Akcje</span>
        </div>

        {#each events as event}
          <div class="grid grid-cols-[2fr_1fr_1fr_100px_100px_100px_80px] gap-4 px-6 py-5 border-b border-white/10 hover:bg-white/2 transition-colors items-center">
            <span class="font-mono text-sm text-foreground">{formatDate(event.date)}</span>
            <span class="text-foreground font-medium uppercase tracking-wide text-sm truncate">{event.title}</span>
            <span class="text-muted text-sm truncate">{event.venue}</span>
            <div class="flex justify-center">
              <span class="px-3 py-1 text-[10px] uppercase tracking-widest font-bold border {getStatusClass(event.status)}">
                {getStatusLabel(event.status)}
              </span>
            </div>
            <span class="text-center font-mono text-sm text-muted">{event.soldTickets}</span>
            <span class="text-center font-mono text-sm text-foreground">{event.totalTickets}</span>
            <div class="flex justify-center">
              <button
                onclick={() => openEditForm(event)}
                aria-label="Edytuj wydarzenie"
                class="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-dark transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

{:else if currentView === "form"}
  {#if isCropping}
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-display font-extrabold uppercase tracking-tighter text-foreground">
          Wykadruj Obraz
        </h2>
        <span class="text-muted text-xs uppercase tracking-widest">Proporcja 4:3</span>
      </div>

      <div class="bg-white/5 border border-white/10 p-4">
        <div class="relative select-none" style="max-width: 400px; margin: 0 auto;">
          <div
            bind:this={cropContainerRef}
            class="relative overflow-hidden border-2 border-primary"
            style="aspect-ratio: 4/3; background: #0A0A0A;"
            onmousedown={handleCropMouseDown}
            onmousemove={handleCropMouseMove}
            onmouseup={handleCropMouseUp}
            onmouseleave={handleCropMouseUp}
            role="application"
            aria-label="Obszar kadrowania obrazu"
            tabindex="0"
          >
            <img
              src={originalImageSrc}
              alt="Crop preview"
              class="w-full h-auto block"
              style="max-height: 100%; object-fit: contain;"
            />
            <div
              class="absolute border-4 border-primary bg-transparent cursor-move pointer-events-none"
              style="
                left: {cropZone.x}px;
                top: {cropZone.y}px;
                width: {cropZone.width}px;
                height: {cropZone.height}px;
              "
            ></div>
          </div>
        </div>

        <p class="text-muted text-center text-xs uppercase tracking-widest mt-4 mb-6">
          Przeciągnij ramkę, aby wybrać obszar kadru. Następnie zatwierdź.
        </p>

        <div class="flex justify-end gap-4">
          <button
            onclick={cancelCrop}
            class="px-8 py-4 border border-white/20 text-foreground font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-dark transition-colors"
          >
            Anuluj
          </button>
          <button
            onclick={applyCrop}
            class="px-8 py-4 bg-primary text-dark font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors"
          >
            Zatwierdź Kadrowanie
          </button>
        </div>
      </div>
    </div>

  {:else}
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-display font-extrabold uppercase tracking-tighter text-foreground">
          {selectedEvent ? "Edytuj Wydarzenie" : "Nowe Wydarzenie"}
        </h2>
        <button
          onclick={closeForm}
          aria-label="Zamknij formularz"
          class="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-dark transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="space-y-8">
        <div class="bg-white/5 border border-white/10 p-8">
          <div class="space-y-6">
            <div>
              <label for="eventTitle" class="block text-xs font-bold uppercase tracking-[0.2em] text-muted mb-3">
                Tytuł Wydarzenia
              </label>
              <input
                id="eventTitle"
                type="text"
                bind:value={title}
                placeholder="np. TECHNO NIGHT"
                class="w-full bg-transparent border-b-2 border-white/20 text-foreground text-xl px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span class="block text-xs font-bold uppercase tracking-[0.2em] text-muted mb-3">
                  Data i Godzina
                </span>
                <input
                  type="datetime-local"
                  bind:value={date}
                  class="w-full bg-transparent border-b-2 border-white/20 text-foreground px-4 py-3 focus:outline-none focus:border-primary transition-colors scheme-dark"
                />
              </div>
              <div>
                <span class="block text-xs font-bold uppercase tracking-[0.2em] text-muted mb-3">
                  Miejsce
                </span>
                <input
                  type="text"
                  bind:value={venue}
                  placeholder="np. klub PROZAK, Kraków"
                  class="w-full bg-transparent border-b-2 border-white/20 text-foreground px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span class="block text-xs font-bold uppercase tracking-[0.2em] text-muted mb-3">
                  Cena (PLN)
                </span>
                <input
                  type="number"
                  bind:value={price}
                  min="0"
                  step="1"
                  class="w-full bg-transparent border-b-2 border-white/20 text-foreground px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <span class="block text-xs font-bold uppercase tracking-[0.2em] text-muted mb-3">
                  Limit Biletów
                </span>
                <input
                  type="number"
                  bind:value={totalTickets}
                  min="1"
                  class="w-full bg-transparent border-b-2 border-white/20 text-foreground px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <span class="block text-xs font-bold uppercase tracking-[0.2em] text-muted mb-3">
                Gatunek
              </span>
              <div class="flex flex-wrap gap-2">
                {#each GENRE_OPTIONS as g}
                  <button
                    type="button"
                    onclick={() => genre = g}
                    class="px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors rounded-none {genre === g
                      ? 'bg-primary text-dark border-primary'
                      : 'bg-transparent text-foreground border-white/20 hover:border-primary'}"
                  >
                    {g}
                  </button>
                {/each}
              </div>
            </div>

            <div>
              <span class="block text-xs font-bold uppercase tracking-[0.2em] text-muted mb-3">
                Format
              </span>
              <div class="flex flex-wrap gap-2">
                {#each TYPE_OPTIONS as t}
                  <button
                    type="button"
                    onclick={() => type = t}
                    class="px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors rounded-none {type === t
                      ? 'bg-primary text-dark border-primary'
                      : 'bg-transparent text-foreground border-white/20 hover:border-primary'}"
                  >
                    {t}
                  </button>
                {/each}
              </div>
            </div>

            <div>
              <label for="eventDescription" class="block text-xs font-bold uppercase tracking-[0.2em] text-muted mb-3">
                Opis
              </label>
              <textarea
                id="eventDescription"
                bind:value={description}
                rows="4"
                placeholder="Opisz wydarzenie..."
                class="w-full bg-transparent border-2 border-white/20 text-foreground px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors resize-none rounded-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="bg-white/5 border border-white/10 p-8">
          <span class="block text-xs font-bold uppercase tracking-[0.2em] text-muted mb-3">
            Plakat Wydarzenia
          </span>
          <div class="aspect-4/3 bg-dark border-2 border-dashed border-white/20 flex flex-col items-center justify-center mb-4 overflow-hidden rounded-none">
            {#if imageUrl}
              <img src={imageUrl} alt="Preview" class="w-full h-full object-cover" />
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-muted mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="3" y="3" width="18" height="18" rx="0" ry="0"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span class="text-muted text-sm uppercase tracking-widest">Wybierz obraz</span>
            {/if}
          </div>
          <div class="flex gap-4">
            <label for="eventImageInput" class="flex-1 px-6 py-4 bg-white/5 border border-white/20 text-foreground font-bold text-xs uppercase tracking-widest text-center cursor-pointer hover:bg-white hover:text-dark transition-colors rounded-none">
              Wybierz Plik
              <input
                id="eventImageInput"
                type="file"
                accept="image/*"
                onchange={handleImageSelect}
                class="hidden"
              />
            </label>
            {#if imageUrl}
              <button
                type="button"
                onclick={() => { imageUrl = ""; croppedImageBlob = null; }}
                class="px-6 py-4 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-colors rounded-none"
              >
                Usuń
              </button>
            {/if}
          </div>
          <p class="text-primary text-[10px] uppercase tracking-widest mt-3">
            Wymagany obraz. Proporcja 4:3.
          </p>
        </div>

        {#if formError}
          <div class="bg-red-500/10 border border-red-500/30 px-6 py-4">
            <p class="text-red-400 text-sm font-bold uppercase tracking-wider">{formError}</p>
          </div>
        {/if}

        <div class="flex justify-end gap-4">
          <button
            onclick={closeForm}
            disabled={isSaving}
            class="px-8 py-4 border border-white/20 text-foreground font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-dark transition-colors disabled:opacity-50 rounded-none"
          >
            Anuluj
          </button>
          <button
            onclick={saveEvent}
            disabled={isSaving}
            class="px-8 py-4 bg-primary text-dark font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
          >
            {#if isSaving}
              <span class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-dark/30 border-t-dark animate-spin"></span>
                Zapisywanie...
              </span>
            {:else}
              {selectedEvent ? "Zapisz Zmiany" : "Utwórz Wydarzenie"}
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}
