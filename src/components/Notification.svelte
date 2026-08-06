<script lang="ts">
  import { notifications, dismissNotification } from "../lib/notification";
  import Icon from "./Icon.svelte";
</script>

{#if $notifications.length > 0}
  <div
    class="fixed top-24 right-6 z-200 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    aria-live="polite"
    aria-atomic="true"
  >
    {#each $notifications as notification (notification.id)}
      <div
        class="pointer-events-auto flex items-start gap-3 p-4 border backdrop-blur-xl shadow-2xl {notification.type === 'error'
          ? 'bg-accent/10 border-accent/30 text-accent'
          : notification.type === 'success'
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-white/5 border-white/10 text-foreground'}"
        role={notification.type === 'error' ? 'alert' : 'status'}
      >
        <Icon
          name={notification.type === 'error' ? 'info' : 'check'}
          size={5}
          class="shrink-0 mt-0.5"
        />
        <p class="text-sm font-medium flex-1">{notification.message}</p>
        <button
          type="button"
          onclick={() => dismissNotification(notification.id)}
          class="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Zamknij powiadomienie"
        >
          <Icon name="close" size={4} />
        </button>
      </div>
    {/each}
  </div>
{/if}
