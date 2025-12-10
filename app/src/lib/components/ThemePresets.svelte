<script lang="ts">
  import { presets } from '$lib/presets';
  import { colors, setColors, resetOverrides, overrides, locked } from '$lib/stores/theme';

  function selectPreset(preset: typeof presets[0]) {
    // Reset any existing overrides first
    resetOverrides();

    // Set the base colors
    setColors(preset.colors);

    // Apply preset overrides if any (locked so they persist through color changes)
    if (preset.overrides) {
      for (const [varName, value] of Object.entries(preset.overrides)) {
        overrides.update((o) => ({ ...o, [varName]: value }));
        locked.update((l) => {
          const newLocked = new Set(l);
          newLocked.add(varName);
          return newLocked;
        });
      }
    }
  }

  function isActive(preset: typeof presets[0], current: typeof $colors): boolean {
    return (
      current.background === preset.colors.background &&
      current.text === preset.colors.text &&
      current.accent === preset.colors.accent
    );
  }
</script>

<div class="space-y-3">
  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Presets</h3>

  <div class="grid grid-cols-2 gap-2">
    {#each presets as preset}
      {@const active = isActive(preset, $colors)}
      <button
        type="button"
        onclick={() => selectPreset(preset)}
        class="p-3 rounded-lg border text-left transition-all hover:scale-[1.02]
               {active
                 ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-900/20'
                 : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}"
      >
        <div class="flex items-center gap-2 mb-1">
          <!-- Color swatches -->
          <div class="flex -space-x-1">
            <div
              class="w-4 h-4 rounded-full border border-white dark:border-gray-700 shadow-sm"
              style="background-color: {preset.colors.background}"
            ></div>
            <div
              class="w-4 h-4 rounded-full border border-white dark:border-gray-700 shadow-sm"
              style="background-color: {preset.colors.text}"
            ></div>
            <div
              class="w-4 h-4 rounded-full border border-white dark:border-gray-700 shadow-sm"
              style="background-color: {preset.colors.accent}"
            ></div>
          </div>
        </div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">{preset.name}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{preset.description}</p>
      </button>
    {/each}
  </div>
</div>
