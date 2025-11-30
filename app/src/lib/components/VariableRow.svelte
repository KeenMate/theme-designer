<script lang="ts">
  import { isValidHex, normalizeHex } from '@keenmate/theme-generator';
  import { extractColor, isColorVariable } from '$lib/variableGroups';

  interface Props {
    varName: string;
    value: string;
    calculatedValue: string;
    isLocked: boolean;
    onToggleLock: () => void;
    onChange: (value: string) => void;
    onReset: () => void;
  }

  let { varName, value, calculatedValue, isLocked, onToggleLock, onChange, onReset }: Props = $props();

  let inputValue = $state(value);
  let isValid = $state(true);

  // Check if value differs from calculated (i.e., has been modified)
  let isModified = $derived(isLocked && value !== calculatedValue);

  // Determine if this is a color-only variable or a complex value
  let isColorOnly = $derived(isColorVariable(varName, value));
  let extractedColor = $derived(extractColor(value));
  let displayColor = $derived(extractedColor || '#000000');

  // Check if extracted color is a valid hex that can be used with color picker
  let isValidHexColor = $derived(() => {
    const color = extractedColor;
    if (color && color.startsWith('#') && isValidHex(color)) {
      const normalized = normalizeHex(color);
      // Color input only supports 6-digit hex (#rrggbb)
      return normalized.length === 7;
    }
    return false;
  });

  // For color input, ensure we have a valid hex (must be #rrggbb format)
  let safeColorValue = $derived(() => {
    if (isValidHexColor()) {
      return normalizeHex(extractedColor!);
    }
    return '#000000';
  });

  // Keep inputValue in sync with external value changes
  $effect(() => {
    inputValue = value;
  });

  function handleTextInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;

    // Validate if it's a color-only variable
    if (isColorOnly) {
      let testValue = inputValue;
      if (!testValue.startsWith('#') && testValue.length > 0 && !testValue.startsWith('rgb') && !testValue.startsWith('hsl')) {
        testValue = '#' + testValue;
      }
      isValid = testValue === 'transparent' || isValidHex(testValue);
      if (isValid) {
        onChange(testValue === 'transparent' ? 'transparent' : normalizeHex(testValue));
      }
    } else {
      // For complex values, just pass through
      isValid = true;
      onChange(inputValue);
    }
  }

  function handleColorInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const newColor = target.value;

    if (isColorOnly) {
      inputValue = newColor;
      isValid = true;
      onChange(newColor);
    } else {
      // For complex values, replace the color part
      const oldColor = extractedColor;
      if (oldColor) {
        inputValue = value.replace(oldColor, newColor);
        onChange(inputValue);
      }
    }
  }

  let colorInputId = `color-${varName.replace(/[^a-z0-9]/gi, '-')}`;

  // Shorten variable name for display
  let shortName = $derived(varName.replace('--ms-', ''));
</script>

<div class="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
  <!-- Lock button -->
  <button
    type="button"
    onclick={onToggleLock}
    class="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors
           {isLocked
             ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
             : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
    title={isLocked ? 'Unlock (will recalculate)' : 'Lock (preserve on color change)'}
  >
    <i class="fa-solid {isLocked ? 'fa-lock' : 'fa-lock-open'}"></i>
  </button>

  <!-- Reset button (only visible when modified) -->
  <button
    type="button"
    onclick={onReset}
    class="w-6 h-6 flex items-center justify-center rounded text-xs transition-all
           {isModified
             ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 opacity-100'
             : 'opacity-0 pointer-events-none'}"
    title="Reset to calculated value"
  >
    <i class="fa-solid fa-rotate-left"></i>
  </button>

  <!-- Color swatch -->
  {#if extractedColor && extractedColor !== 'transparent'}
    <button
      type="button"
      onclick={() => isValidHexColor() && document.getElementById(colorInputId)?.click()}
      class="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0
             {isValidHexColor() ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}"
      style="background-color: {displayColor}"
      title={isValidHexColor() ? 'Click to change color' : extractedColor}
    ></button>
    {#if isValidHexColor()}
      <input
        type="color"
        id={colorInputId}
        value={safeColorValue()}
        oninput={handleColorInput}
        class="sr-only"
      />
    {/if}
  {:else if extractedColor === 'transparent'}
    <div
      class="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
      style="background: repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 6px 6px"
      title="Transparent"
    ></div>
  {:else}
    <div class="w-5 h-5 flex-shrink-0"></div>
  {/if}

  <!-- Variable name -->
  <span
    class="text-xs font-mono truncate flex-shrink-0 w-36
           {isModified ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400'}"
    title={varName}
  >
    {shortName}
  </span>

  <!-- Value input -->
  <input
    type="text"
    value={inputValue}
    oninput={handleTextInput}
    class="flex-1 min-w-0 px-2 py-1 text-xs font-mono rounded border
           bg-white dark:bg-gray-800
           text-gray-900 dark:text-white
           border-gray-200 dark:border-gray-600
           focus:ring-1 focus:ring-blue-500 focus:border-blue-500
           {!isValid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
           {isModified ? 'border-amber-300 dark:border-amber-600' : ''}"
  />
</div>
