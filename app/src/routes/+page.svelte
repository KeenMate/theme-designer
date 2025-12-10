<script lang="ts">
  import ColorPicker from '$lib/components/ColorPicker.svelte';
  import ThemePresets from '$lib/components/ThemePresets.svelte';
  import FontSelector from '$lib/components/FontSelector.svelte';
  import LivePreview from '$lib/components/LivePreview.svelte';
  import DaterangepickerPreview from '$lib/components/DaterangepickerPreview.svelte';
  import VariableEditor from '$lib/components/VariableEditor.svelte';
  import ComponentSelector from '$lib/components/ComponentSelector.svelte';
  import { colors, updateColor, resetAll, selectedComponent } from '$lib/stores/theme';
</script>

<svelte:head>
  <title>Theme Generator - KeenMate</title>
  <meta name="description" content="Generate CSS variable themes for KeenMate web components from just 3 base colors." />
</svelte:head>

<!-- 3-column grid layout - fixed height, no page scroll -->
<div class="grid grid-cols-1 xl:grid-cols-10 gap-4 h-full overflow-hidden">
  <!-- Column 1: Component Selector + Presets + Base Colors + Typography -->
  <div class="xl:col-span-2 flex flex-col gap-4 overflow-y-auto min-h-0">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <ComponentSelector />
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <ThemePresets />
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Base Colors</h3>
        <button
          type="button"
          onclick={resetAll}
          class="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
        >
          Reset All
        </button>
      </div>

      <ColorPicker
        label="Background"
        description="Main background color"
        value={$colors.background}
        onchange={(v) => updateColor('background', v)}
      />

      <ColorPicker
        label="Text"
        description="Primary text color"
        value={$colors.text}
        onchange={(v) => updateColor('text', v)}
      />

      <ColorPicker
        label="Accent"
        description="Brand/highlight color"
        value={$colors.accent}
        onchange={(v) => updateColor('accent', v)}
      />
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <FontSelector />
    </div>
  </div>

  <!-- Column 2: Variable Editor (scrollable inside) -->
  <div class="xl:col-span-4 min-h-0">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full overflow-hidden flex flex-col">
      <VariableEditor />
    </div>
  </div>

  <!-- Column 3: Live Preview (scrollable inside) -->
  <div class="xl:col-span-4 min-h-0">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full overflow-y-auto">
      {#if $selectedComponent === 'web-multiselect'}
        <LivePreview />
      {:else}
        <DaterangepickerPreview />
      {/if}
    </div>
  </div>
</div>
