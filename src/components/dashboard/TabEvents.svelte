<script lang="ts">
  import { supabase } from "../../lib/supabase";
  import { userOrganizations } from "../../lib/authStore";
  import type { OrganizationMembership } from "../../lib/authStore";
  import type { EventGenre, EventType, EventStatus, ManagedEvent } from "../../lib/types";
  import { GENRE_OPTIONS, TYPE_OPTIONS, CROP_CONTAINER_WIDTH, CROP_OUTPUT_WIDTH, CROP_ASPECT_RATIO } from "../../lib/types";
  import { formatDateDashboard } from "../../lib/utils";
  import Icon from "../Icon.svelte";

  interface InitialEventRow {
    id: string;
    title: string;
    date: string;
    venue: string;
    price: number;
    total_tickets: number;
    sold_tickets: number;
    genre: EventGenre;
    type: EventType;
    description: string;
    image_url: string;
    status: EventStatus;
    organization_id: string;
  }

  interface Props {
    organizations?: OrganizationMembership[];
    initialEvents?: InitialEventRow[];
  }

  let { organizations, initialEvents = [] }: Props = $props();

  let activeOrganizationId = $state<string>("");
  let currentView = $state<"list" | "form">("list");
  let events = $state<ManagedEvent[]>(
    initialEvents.map((row) => ({
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
    }))
  );
  let isLoading = $state(initialEvents.length === 0);
  let errorMessage = $state("");
  let selectedEvent = $state<ManagedEvent | null>(null);
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
  let cropZone = $state({ x: 0, y: 0, width: 0, height: 0 });
  let isDragging = $state(false);
  let dragStart = $state({ x: 0, y: 0 });
  let cropContainerRef = $state<HTMLDivElement | null>(null);
  let imageNaturalWidth = $state(1);
  let imageNaturalHeight = $state(1);

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
      events = (data as InitialEventRow[]).map((row) => ({
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

  function openEditForm(event: ManagedEvent) {
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
    const containerWidth = CROP_CONTAINER_WIDTH;
    const aspectRatio = CROP_ASPECT_RATIO;
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

  function getClientPos(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
    if ("touches" in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
  }

  function handleDragStart(e: MouseEvent | TouchEvent) {
    if ("touches" in e) e.preventDefault();
    isDragging = true;
    const pos = getClientPos(e);
    dragStart = { x: pos.clientX, y: pos.clientY };
  }

  function handleDragMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return;
    if ("touches" in e) e.preventDefault();

    const pos = getClientPos(e);
    const deltaX = pos.clientX - dragStart.x;
    const deltaY = pos.clientY - dragStart.y;

    const containerHeight = CROP_CONTAINER_WIDTH / CROP_ASPECT_RATIO;
    const scaledZoneHeight = containerHeight;
    const maxY = (imageNaturalHeight * (CROP_CONTAINER_WIDTH / imageNaturalWidth)) - scaledZoneHeight;

    let newX = cropZone.x + deltaX;
    let newY = cropZone.y + deltaY;

    newX = Math.max(0, Math.min(CROP_CONTAINER_WIDTH - cropZone.width, newX));
    newY = Math.max(0, Math.min(maxY, newY));

    cropZone = {
      x: newX,
      y: newY,
      width: cropZone.width,
      height: cropZone.height,
    };

    dragStart = { x: pos.clientX, y: pos.clientY };
  }

  function handleDragEnd() {
    isDragging = false;
  }

  function applyCrop() {
    if (!imageFile) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const outputWidth = CROP_OUTPUT_WIDTH;
    const outputHeight = Math.round(outputWidth / CROP_ASPECT_RATIO);

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const scaleX = imageNaturalWidth / CROP_CONTAINER_WIDTH;
    const scaleY = imageNaturalHeight / (imageNaturalWidth / CROP_CONTAINER_WIDTH * imageNaturalHeight);

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
      status: totalTickets > 0 ? "available" as const : "draft" as const,
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
        <Icon name="empty-calendar" size={16} class="text-muted mb-6" />
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
            <span class="font-mono text-sm text-foreground">{formatDateDashboard(event.date)}</span>
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
                <Icon name="edit" size={4} />
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
        <div class="relative select-none" style="max-width: {CROP_CONTAINER_WIDTH}px; margin: 0 auto;">
          <div
            bind:this={cropContainerRef}
            class="relative overflow-hidden border-2 border-primary"
            style="aspect-ratio: {CROP_ASPECT_RATIO}; background: #0A0A0A;"
            onmousedown={handleDragStart}
            onmousemove={handleDragMove}
            onmouseup={handleDragEnd}
            onmouseleave={handleDragEnd}
            ontouchstart={handleDragStart}
            ontouchmove={handleDragMove}
            ontouchend={handleDragEnd}
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
          <Icon name="close" size={5} />
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
              <Icon name="image" size={16} class="text-muted mb-4" />
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
          <div class="bg-red-500/10 border border-red-500/30 px-6 py-4" role="alert">
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
