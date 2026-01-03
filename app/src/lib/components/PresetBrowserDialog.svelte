<script lang="ts">
  import { presets, type ThemePreset } from '$lib/presets';
  import { addBuiltInPreset, checkNameCollision } from '$lib/stores/userPresets';

  interface Props {
    open: boolean;
    onClose: () => void;
    onAdded?: (preset: { id: string; name: string }) => void;
  }

  let { open = $bindable(), onClose, onAdded }: Props = $props();

  let addedPresets = $state<Set<string>>(new Set());
  let renameTarget = $state<ThemePreset | null>(null);
  let renameName = $state('');
  let renameError = $state('');

  function handleAdd(preset: ThemePreset) {
    // Check for name collision
    const existing = checkNameCollision(preset.name);
    if (existing) {
      // Show rename dialog
      renameTarget = preset;
      renameName = `${preset.name} (copy)`;
      renameError = '';
      return;
    }

    doAdd(preset, preset.name);
  }

  function doAdd(preset: ThemePreset, name: string) {
    const added = addBuiltInPreset(
      name,
      preset.description,
      preset.colors,
      preset.overrides
    );

    addedPresets = new Set([...addedPresets, preset.name]);
    onAdded?.({ id: added.id, name: added.name });
  }

  function handleRenameConfirm() {
    if (!renameTarget) return;

    const trimmedName = renameName.trim();
    if (!trimmedName) {
      renameError = 'Please enter a name';
      return;
    }

    const existing = checkNameCollision(trimmedName);
    if (existing) {
      renameError = `"${existing.name}" already exists`;
      return;
    }

    doAdd(renameTarget, trimmedName);
    renameTarget = null;
    renameName = '';
    renameError = '';
  }

  function handleRenameCancel() {
    renameTarget = null;
    renameName = '';
    renameError = '';
  }

  function handleClose() {
    addedPresets = new Set();
    renameTarget = null;
    open = false;
    onClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (renameTarget) {
        handleRenameCancel();
      } else {
        handleClose();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onclick={handleClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="browser-title"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 id="browser-title" class="text-lg font-semibold text-gray-900 dark:text-white">
            Built-in Presets
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Add presets to your collection
          </p>
        </div>
        <button
          type="button"
          onclick={handleClose}
          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {#each presets as preset}
            {@const alreadyAdded = addedPresets.has(preset.name)}
            <div
              class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div class="flex items-center gap-2 mb-2">
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
                {#if preset.overrides}
                  <span class="text-xs text-gray-400 dark:text-gray-500" title="Includes variable overrides">
                    +
                  </span>
                {/if}
              </div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{preset.name}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">{preset.description}</p>

              <button
                type="button"
                onclick={() => handleAdd(preset)}
                disabled={alreadyAdded}
                class="w-full px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                       {alreadyAdded
                         ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default'
                         : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'}"
              >
                {alreadyAdded ? 'Added' : 'Add to My Presets'}
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button
          type="button"
          onclick={handleClose}
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600
                 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Done
        </button>
      </div>
    </div>
  </div>

  <!-- Rename Dialog (nested) -->
  {#if renameTarget}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      onclick={handleRenameCancel}
      role="dialog"
      aria-modal="true"
    >
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onclick={(e) => e.stopPropagation()}
        role="document"
      >
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Name Conflict
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            A preset named "{renameTarget.name}" already exists
          </p>
        </div>

        <div class="px-6 py-4">
          <label for="rename-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Enter a new name
          </label>
          <input
            bind:value={renameName}
            type="text"
            id="rename-input"
            class="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700
                   border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            class:border-red-500={renameError}
          />
          {#if renameError}
            <p class="mt-1 text-sm text-red-500">{renameError}</p>
          {/if}
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onclick={handleRenameCancel}
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                   border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleRenameConfirm}
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add with New Name
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}
