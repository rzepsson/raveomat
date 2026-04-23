<script lang="ts">
  import { Select } from "bits-ui";
  import Icon from "./Icon.svelte";

  interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    ariaLabel: string;
    class?: string;
  }

  let {
    options,
    value = $bindable(""),
    onChange,
    placeholder = "Wybierz...",
    ariaLabel,
    class: className = "",
  }: Props = $props();

  function handleValueChange(newValue: string) {
    value = newValue;
    onChange?.(newValue);
  }
</script>

<Select.Root
  type="single"
  items={options}
  bind:value
  onValueChange={handleValueChange}
>
  <Select.Trigger
    class="relative w-full appearance-none bg-transparent py-4 pl-6 pr-12 text-foreground outline-none cursor-pointer font-medium flex items-center {className}"
    aria-label={ariaLabel}
  >
    <Select.Value
      class="flex-1 text-left"
      {placeholder}
    />
    <Icon name="chevron-down" size={5} class="absolute right-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none shrink-0" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content
      class="z-100 bg-dark border border-white/10 shadow-2xl overflow-hidden outline-hidden max-h-(--bits-select-content-available-height) w-(--bits-select-anchor-width) min-w-(--bits-select-anchor-width)"
      sideOffset={4}
    >
      <Select.Viewport class="p-1">
        {#each options as option (option.value)}
          <Select.Item
            class="px-6 py-3 text-sm font-bold uppercase tracking-widest cursor-pointer select-none outline-hidden transition-colors duration-150 data-highlighted:bg-primary/10 data-highlighted:text-primary text-muted flex items-center justify-between"
            value={option.value}
            label={option.label}
            disabled={option.disabled}
          >
            {#snippet children({ selected })}
              <span>{option.label}</span>
              {#if selected}
                <Icon name="check" size={4} class="text-primary shrink-0 ml-3" />
              {/if}
            {/snippet}
          </Select.Item>
        {/each}
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>
