<script lang="ts">
  import { onMount } from 'svelte';
  import { colors } from '$lib/stores/theme';
  import {
    userPresets,
    activePresetId,
    loadPreset,
    updatePreset,
    deletePreset,
    loadFromStorage,
    type UserPreset
  } from '$lib/stores/userPresets';
  import SavePresetDialog from './SavePresetDialog.svelte';
  import PresetBrowserDialog from './PresetBrowserDialog.svelte';

  // Dialog states
  let showSaveDialog = $state(false);
  let showBrowserDialog = $state(false);

  // Inline editing state
  let editingId = $state<string | null>(null);
  let editingName = $state('');
  let editInput: HTMLInputElement | undefined = $state();

  // Load presets from localStorage on mount
  onMount(() => {
    loadFromStorage();
  });

  function handleSelectPreset(preset: UserPreset) {
    loadPreset(preset.id);
  }

  function handleStartEdit(preset: UserPreset, event: MouseEvent) {
    event.stopPropagation();
    editingId = preset.id;
    editingName = preset.name;
    // Focus input after render
    setTimeout(() => editInput?.focus(), 0);
  }

  function handleSaveEdit() {
    if (editingId && editingName.trim()) {
      updatePreset(editingId, { name: editingName.trim() });
    }
    editingId = null;
    editingName = '';
  }

  function handleCancelEdit() {
    editingId = null;
    editingName = '';
  }

  function handleEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }

  function handleDelete(preset: UserPreset, event: MouseEvent) {
    event.stopPropagation();
    if (confirm(`Delete "${preset.name}"?`)) {
      deletePreset(preset.id);
    }
  }

  function isActive(preset: UserPreset): boolean {
    return $activePresetId === preset.id;
  }

  function colorsMatch(preset: UserPreset): boolean {
    return (
      $colors.background === preset.colors.background &&
      $colors.text === preset.colors.text &&
      $colors.accent === preset.colors.accent
    );
  }
</script>

<div class="space-y-4">
  <!-- Header with Add button -->
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">My Presets</h3>
    <button
      type="button"
      onclick={() => showSaveDialog = true}
      class="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400
             rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title="Save current theme as preset"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  </div>

  <!-- My Presets Grid -->
  {#if $userPresets.length > 0}
    <div class="grid grid-cols-2 gap-2">
      {#each $userPresets as preset (preset.id)}
        {@const active = isActive(preset)}
        {@const matchingColors = colorsMatch(preset)}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div
          onclick={() => handleSelectPreset(preset)}
          class="group p-3 rounded-lg border text-left transition-all hover:scale-[1.02] relative cursor-pointer
                 {active || matchingColors
                   ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-900/20'
                   : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}"
        >
          <!-- Color swatches row -->
          <div class="flex items-center justify-between mb-1">
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

            <!-- Action buttons (visible on hover) -->
            <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <!-- Edit button -->
              <button
                type="button"
                onclick={(e) => handleStartEdit(preset, e)}
                class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                title="Rename"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              <!-- Delete button -->
              <button
                type="button"
                onclick={(e) => handleDelete(preset, e)}
                class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                title="Delete"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Name (editable or display) -->
          {#if editingId === preset.id}
            <input
              bind:this={editInput}
              bind:value={editingName}
              type="text"
              class="w-full text-sm font-medium bg-white dark:bg-gray-700 border border-blue-500 rounded px-1 py-0.5
                     text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              onclick={(e) => e.stopPropagation()}
              onblur={handleSaveEdit}
              onkeydown={handleEditKeydown}
            />
          {:else}
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{preset.name}</p>
          {/if}

          {#if preset.description}
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{preset.description}</p>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
      <p>No presets saved yet</p>
      <p class="mt-1">
        <button
          type="button"
          onclick={() => showSaveDialog = true}
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Save your first preset
        </button>
      </p>
    </div>
  {/if}

  <!-- Browse Built-in Presets -->
  <button
    type="button"
    onclick={() => showBrowserDialog = true}
    class="w-full py-2 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
           border border-dashed border-gray-300 dark:border-gray-600 rounded-lg
           hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
  >
    Browse Built-in Presets...
  </button>
</div>

<!-- Dialogs -->
<SavePresetDialog bind:open={showSaveDialog} onClose={() => showSaveDialog = false} />
<PresetBrowserDialog bind:open={showBrowserDialog} onClose={() => showBrowserDialog = false} />
