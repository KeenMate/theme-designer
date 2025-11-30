<script lang="ts">
  import { isValidHex, normalizeHex } from '@keenmate/theme-designer';

  interface Props {
    label: string;
    description: string;
    value: string;
    onchange: (value: string) => void;
  }

  let { label, description, value, onchange }: Props = $props();

  let inputValue = $state(value);
  let isValid = $state(true);

  // Ensure color input always has a valid hex (fallback to black)
  let safeColorValue = $derived(() => {
    if (value && isValidHex(value)) {
      return normalizeHex(value);
    }
    return '#000000';
  });

  // Keep inputValue in sync with external value changes
  $effect(() => {
    inputValue = value;
    isValid = isValidHex(value);
  });

  function handleTextInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;

    // Add # if missing
    let testValue = inputValue;
    if (!testValue.startsWith('#') && testValue.length > 0) {
      testValue = '#' + testValue;
    }

    isValid = isValidHex(testValue);

    if (isValid && testValue.length >= 4) {
      onchange(normalizeHex(testValue));
    }
  }

  function handleColorInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
    isValid = true;
    onchange(target.value);
  }

  let colorInputId = `color-${label.toLowerCase().replace(/\s/g, '-')}`;
</script>

<div class="space-y-2">
  <div class="flex justify-between items-baseline">
    <label for={colorInputId} class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
  </div>
  <p class="text-xs text-gray-500 dark:text-gray-400">{description}</p>

  <div class="flex items-center gap-3">
    <button
      type="button"
      onclick={() => document.getElementById(colorInputId)?.click()}
      class="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
      style="background-color: {value}"
      aria-label="Open color picker"
    ></button>

    <input
      type="color"
      id={colorInputId}
      value={safeColorValue()}
      oninput={handleColorInput}
      class="sr-only"
    />

    <input
      type="text"
      value={inputValue}
      oninput={handleTextInput}
      placeholder="#000000"
      class="flex-1 px-3 py-2 border rounded-lg font-mono text-sm
             bg-white dark:bg-gray-800
             text-gray-900 dark:text-white
             border-gray-300 dark:border-gray-600
             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             {!isValid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}"
    />
  </div>

  {#if !isValid}
    <p class="text-xs text-red-500">Invalid hex color (use #RGB or #RRGGBB)</p>
  {/if}
</div>
