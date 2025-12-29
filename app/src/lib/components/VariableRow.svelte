<script lang="ts">
  import { isValidHex, normalizeHex } from '@keenmate/theme-designer';
  import { extractColor, isColorVariable } from '$lib/variableGroups';
  import { resolveColorFormula } from '$lib/colorResolver';

  interface Props {
    varName: string;
    value: string;
    calculatedValue: string;
    isLocked: boolean;
    themeContext: Record<string, string>;
    onToggleLock: () => void;
    onChange: (value: string) => void;
    onReset: () => void;
  }

  let { varName, value, calculatedValue, isLocked, themeContext, onToggleLock, onChange, onReset }: Props = $props();

  let inputValue = $state(value);
  let isValid = $state(true);

  // Check if value differs from calculated (i.e., has been modified)
  let isModified = $derived(isLocked && value !== calculatedValue);

  // Determine if this is a color-only variable or a complex value
  let isColorOnly = $derived(isColorVariable(varName, value));
  let extractedColor = $derived(extractColor(value));

  // Resolve CSS formulas (color-mix, var references) to actual colors for display
  let resolvedColor = $derived.by(() => {
    // First try to resolve CSS formulas
    const resolved = resolveColorFormula(value, themeContext);
    if (resolved) return resolved;
    // Fall back to simple extraction
    return extractedColor;
  });

  let displayColor = $derived(resolvedColor || '#000000');

  // For determining if we have a color to show
  let hasColor = $derived(!!resolvedColor || !!extractedColor);

  // Check if resolved color is a valid hex that can be used with color picker
  let isValidHexColor = $derived.by(() => {
    const color = resolvedColor;
    if (color && color.startsWith('#') && isValidHex(color)) {
      const normalized = normalizeHex(color);
      // Color input only supports 6-digit hex (#rrggbb)
      return normalized.length === 7;
    }
    return false;
  });

  // For color input, ensure we have a valid hex (must be #rrggbb format)
  let safeColorValue = $derived.by(() => {
    if (isValidHexColor && resolvedColor) {
      try {
        const normalized = normalizeHex(resolvedColor);
        // Verify it's exactly #rrggbb format
        if (/^#[0-9a-f]{6}$/i.test(normalized)) {
          return normalized;
        }
      } catch {
        // normalizeHex might throw on invalid input
      }
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

  function handleNumberInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
    isValid = true;
    onChange(inputValue);
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
  let shortName = $derived(varName.replace(/^--(ms|drp|base)-/, ''));

  // Determine input type info based on variable name
  let inputTypeInfo = $derived.by(() => {
    const name = varName.toLowerCase();

    // Colors - not numeric
    if (name.includes('color') || name.includes('-bg') || name.includes('background') ||
        name.includes('border-color') || name.includes('shadow')) {
      return { unit: '', isNumeric: false, step: 0 };
    }

    // Font weights - numeric, step 100
    if (name.includes('font-weight')) {
      return { unit: '', isNumeric: true, step: 100 };
    }

    // Line heights - numeric, step 0.05
    if (name.includes('line-height')) {
      return { unit: '', isNumeric: true, step: 0.05 };
    }

    // Font sizes - numeric coefficients, step 0.1
    if (name.includes('font-size')) {
      return { unit: '× rem', isNumeric: true, step: 0.1 };
    }

    // Border radius - numeric coefficients, step 0.1
    if (name.includes('border-radius')) {
      return { unit: '× rem', isNumeric: true, step: 0.1 };
    }

    // Spacing/padding/margin/gap - numeric coefficients, step 0.1
    if (name.includes('padding') || name.includes('margin') || name.includes('gap') ||
        name.includes('spacing') || name.includes('indent')) {
      return { unit: '× rem', isNumeric: true, step: 0.1 };
    }

    // Sizes (width, height, min-, max-) - numeric, step 1
    if (name.includes('width') || name.includes('height') || name.includes('size')) {
      return { unit: 'px', isNumeric: true, step: 1 };
    }

    // Transitions - numeric, step 50
    if (name.includes('transition') || name.includes('duration') || name.includes('delay')) {
      return { unit: 'ms', isNumeric: true, step: 50 };
    }

    // Z-index - numeric, step 1
    if (name.includes('z-index')) {
      return { unit: '', isNumeric: true, step: 1 };
    }

    // Opacity - numeric, step 0.05
    if (name.includes('opacity')) {
      return { unit: '', isNumeric: true, step: 0.05 };
    }

    return { unit: '', isNumeric: false, step: 0 };
  });

  // Convenience accessors
  let expectedUnit = $derived(inputTypeInfo.unit);
  let isNumeric = $derived(inputTypeInfo.isNumeric);
  let step = $derived(inputTypeInfo.step);
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

  <!-- Variable name -->
  <span
    class="text-xs font-mono truncate flex-1 min-w-0
           {isModified ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400'}"
    title={varName}
  >
    {shortName}
  </span>

  <!-- Value input -->
  {#if isNumeric}
    <input
      type="number"
      value={inputValue}
      oninput={handleNumberInput}
      step={step}
      class="w-28 xl:w-56 flex-shrink-0 px-2 py-1 text-xs font-mono rounded border
             bg-white dark:bg-gray-800
             text-gray-900 dark:text-white
             border-gray-200 dark:border-gray-600
             focus:ring-1 focus:ring-blue-500 focus:border-blue-500
             {isModified ? 'border-amber-300 dark:border-amber-600' : ''}"
    />
  {:else}
    <input
      type="text"
      value={inputValue}
      oninput={handleTextInput}
      class="w-28 xl:w-56 flex-shrink-0 px-2 py-1 text-xs font-mono rounded border
             bg-white dark:bg-gray-800
             text-gray-900 dark:text-white
             border-gray-200 dark:border-gray-600
             focus:ring-1 focus:ring-blue-500 focus:border-blue-500
             {!isValid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
             {isModified ? 'border-amber-300 dark:border-amber-600' : ''}"
    />
  {/if}

  <!-- Color swatch or Unit indicator -->
  {#if hasColor && resolvedColor !== 'transparent'}
    <div class="relative flex-shrink-0">
      <button
        type="button"
        onclick={() => isValidHexColor && document.getElementById(colorInputId)?.click()}
        class="w-12 h-5 rounded border border-gray-300 dark:border-gray-600
               {isValidHexColor ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-default'}"
        style="background-color: {displayColor}"
        title={isValidHexColor ? 'Click to change color' : (resolvedColor || value)}
      ></button>
      {#if isValidHexColor}
        {@const colorValue = /^#[0-9a-f]{6}$/i.test(safeColorValue) ? safeColorValue : '#000000'}
        <input
          type="color"
          id={colorInputId}
          value={colorValue}
          oninput={handleColorInput}
          class="absolute top-0 right-0 w-full h-full opacity-0 cursor-pointer"
        />
      {/if}
    </div>
  {:else if resolvedColor === 'transparent' || extractedColor === 'transparent'}
    <div
      class="w-12 h-5 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
      style="background: repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 6px 6px"
      title="Transparent"
    ></div>
  {:else}
    <span class="w-12 flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 font-mono">
      {expectedUnit}
    </span>
  {/if}

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
</div>
