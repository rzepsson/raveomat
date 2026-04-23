<script lang="ts">
  type IconName =
    | "close"
    | "calendar"
    | "location"
    | "user"
    | "chevron-left"
    | "chevron-right"
    | "chevron-down"
    | "lock"
    | "search"
    | "arrow-down"
    | "arrow-right"
    | "check"
    | "info"
    | "edit"
    | "plus"
    | "minus"
    | "image"
    | "ticket"
    | "scan"
    | "google"
    | "apple"
    | "spinner"
    | "building"
    | "empty-calendar"
    | "empty-ticket";

  interface Props {
    name: IconName;
    class?: string;
    size?: number;
  }

  let { name, class: className = "", size = 5 }: Props = $props();

  const SIZE_MAP: Record<number, string> = {
    4: "w-4 h-4",
    5: "w-5 h-5",
    6: "w-6 h-6",
    10: "w-10 h-10",
    12: "w-12 h-12",
    16: "w-16 h-16",
  };

  const sizeClass = $derived(SIZE_MAP[size] ?? `w-5 h-5`);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  class="{sizeClass} {className}"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  {#if name === "close"}
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  {:else if name === "calendar"}
    <rect width="18" height="18" x="3" y="4"></rect>
    <line x1="16" x2="16" y1="2" y2="6"></line>
    <line x1="8" x2="8" y1="2" y2="6"></line>
    <line x1="3" x2="21" y1="10" y2="10"></line>
  {:else if name === "location"}
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  {:else if name === "user"}
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  {:else if name === "chevron-left"}
    <polyline points="15 18 9 12 15 6"></polyline>
  {:else if name === "chevron-right"}
    <polyline points="9 18 15 12 9 6"></polyline>
  {:else if name === "chevron-down"}
    <polyline points="6 9 12 15 18 9"></polyline>
  {:else if name === "lock"}
    <rect x="3" y="11" width="18" height="11" rx="0" ry="0"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  {:else if name === "search"}
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  {:else if name === "arrow-down"}
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
  {:else if name === "arrow-right"}
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  {:else if name === "check"}
    <polyline points="20 6 9 17 4 12"></polyline>
  {:else if name === "info"}
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  {:else if name === "edit"}
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  {:else if name === "plus"}
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  {:else if name === "minus"}
    <line x1="5" y1="12" x2="19" y2="12"></line>
  {:else if name === "image"}
    <rect x="3" y="3" width="18" height="18" rx="0" ry="0"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  {:else if name === "ticket"}
    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
    <line x1="2" x2="22" y1="10" y2="10"></line>
  {:else if name === "scan"}
    <rect x="3" y="4" width="18" height="18" rx="0" ry="0"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  {:else if name === "building"}
    <rect x="3" y="3" width="18" height="18" rx="0" ry="0"></rect>
    <path d="M3 9h18"></path>
    <path d="M9 21V9"></path>
  {:else if name === "empty-calendar"}
    <rect x="3" y="4" width="18" height="18" rx="0" ry="0"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  {:else if name === "empty-ticket"}
    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
    <line x1="2" x2="22" y1="10" y2="10"></line>
  {/if}
</svg>

{#if name === "google"}
  <svg class="{sizeClass} {className}" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
{:else if name === "apple"}
  <svg class="{sizeClass} {className}" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.947 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z"/>
  </svg>
{:else if name === "spinner"}
  <svg class="animate-spin {sizeClass} {className}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
{/if}
