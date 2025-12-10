<script lang="ts">
  import { colors, updateColor } from '$lib/stores/theme';

  // Font presets
  const fontPresets = [
    { name: 'System Default', value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', import: '' },
    { name: 'Inter', value: '"Inter", sans-serif', import: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');" },
    { name: 'Montserrat', value: '"Montserrat", sans-serif', import: "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap');" },
    { name: 'DM Sans', value: '"DM Sans", sans-serif', import: "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');" },
    { name: 'Figtree', value: '"Figtree", sans-serif', import: "@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&display=swap');" },
    { name: 'Lexend', value: '"Lexend", sans-serif', import: "@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600&display=swap');" },
    { name: 'Quicksand', value: '"Quicksand", sans-serif', import: "@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600&display=swap');" },
    { name: 'Roboto', value: '"Roboto", sans-serif', import: "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600&display=swap');" },
    { name: 'Open Sans', value: '"Open Sans", sans-serif', import: "@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap');" },
    { name: 'Custom...', value: 'custom', import: '' },
  ];

  let showModal = $state(false);
  let customImportUrl = $state('');
  let customFontFamily = $state('');
  let parseError = $state('');

  // Get current font family or default
  let currentFont = $derived($colors.fontFamily || fontPresets[0].value);
  let isCustom = $derived(!fontPresets.some(p => p.value === currentFont && p.value !== 'custom'));

  function selectPreset(preset: typeof fontPresets[0]) {
    if (preset.value === 'custom') {
      showModal = true;
      return;
    }
    colors.update(c => ({
      ...c,
      fontFamily: preset.value === fontPresets[0].value ? undefined : preset.value,
      fontImport: preset.import || undefined,
    }));
  }

  function extractFontNameFromImport(importUrl: string): string | null {
    // Try to extract font name from Google Fonts URL
    // Pattern: family=Font+Name or family=Font+Name:wght@...
    const match = importUrl.match(/family=([^:&]+)/);
    if (match) {
      return match[1].replace(/\+/g, ' ');
    }
    return null;
  }

  function applyCustomFont() {
    parseError = '';

    // Clean up the import URL - ensure it's just the @import statement
    let cleanImport = customImportUrl.trim();

    // If they pasted a <style> tag, extract just the @import
    if (cleanImport.includes('<style>')) {
      const importMatch = cleanImport.match(/@import\s+url\([^)]+\);?/);
      if (importMatch) {
        cleanImport = importMatch[0];
      }
    }

    // Validate it looks like an @import
    if (!cleanImport.startsWith('@import')) {
      parseError = 'Please paste a valid @import URL from Google Fonts';
      return;
    }

    // Try to extract font name if not provided
    let fontFamily = customFontFamily.trim();
    if (!fontFamily) {
      const extracted = extractFontNameFromImport(cleanImport);
      if (extracted) {
        fontFamily = `"${extracted}", sans-serif`;
      } else {
        parseError = 'Could not detect font name. Please enter the font family manually.';
        return;
      }
    }

    colors.update(c => ({
      ...c,
      fontFamily: fontFamily,
      fontImport: cleanImport,
    }));

    showModal = false;
    customImportUrl = '';
    customFontFamily = '';
  }

  function closeModal() {
    showModal = false;
    customImportUrl = '';
    customFontFamily = '';
    parseError = '';
  }
</script>

<div class="space-y-3">
  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Typography</h3>

  <div class="space-y-2">
    <label for="font-select" class="block text-xs text-gray-500 dark:text-gray-400">Font Family</label>
    <select
      id="font-select"
      class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      onchange={(e) => {
        const preset = fontPresets.find(p => p.value === e.currentTarget.value);
        if (preset) selectPreset(preset);
      }}
    >
      {#each fontPresets as preset}
        <option
          value={preset.value}
          selected={preset.value === currentFont || (preset.value === 'custom' && isCustom)}
        >
          {preset.name}
        </option>
      {/each}
    </select>

    {#if isCustom && $colors.fontFamily}
      <div class="text-xs text-gray-500 dark:text-gray-400 truncate" title={$colors.fontFamily}>
        {$colors.fontFamily}
      </div>
    {/if}

    <button
      type="button"
      onclick={() => showModal = true}
      class="w-full px-3 py-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
    >
      + Add Google Font
    </button>
  </div>

  <!-- Preview -->
  <div
    class="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
    style="font-family: {currentFont}"
  >
    <p class="text-sm text-gray-700 dark:text-gray-300">
      The quick brown fox jumps over the lazy dog
    </p>
    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      0123456789
    </p>
  </div>
</div>

<!-- Modal for adding Google Font -->
{#if showModal}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={closeModal}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Google Font</h3>
        <button
          type="button"
          onclick={closeModal}
          aria-label="Close modal"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label for="import-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Paste @import URL from Google Fonts
          </label>
          <textarea
            id="import-url"
            bind:value={customImportUrl}
            placeholder="@import url('https://fonts.googleapis.com/css2?family=...');"
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows="3"
          ></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Go to <a href="https://fonts.google.com" target="_blank" class="text-blue-500 hover:underline">fonts.google.com</a>, select a font, and copy the @import code
          </p>
        </div>

        <div>
          <label for="font-family-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Font Family (optional - auto-detected)
          </label>
          <input
            id="font-family-input"
            type="text"
            bind:value={customFontFamily}
            placeholder='"Font Name", sans-serif'
            class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {#if parseError}
          <p class="text-sm text-red-600 dark:text-red-400">{parseError}</p>
        {/if}

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onclick={closeModal}
            class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={applyCustomFont}
            class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Font
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
