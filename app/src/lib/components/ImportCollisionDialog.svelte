<script lang="ts">
  import { checkNameCollision } from '$lib/stores/userPresets';

  interface Props {
    open: boolean;
    existingName: string;
    onClose: () => void;
    onOverwrite: () => void;
    onRename: (newName: string) => void;
  }

  let { open = $bindable(), existingName, onClose, onOverwrite, onRename }: Props = $props();

  let mode = $state<'choose' | 'rename'>('choose');
  let newName = $state('');
  let error = $state('');

  function handleOverwrite() {
    onOverwrite();
    handleClose();
  }

  function handleStartRename() {
    mode = 'rename';
    newName = `${existingName} (imported)`;
    error = '';
  }

  function handleConfirmRename() {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      error = 'Please enter a name';
      return;
    }

    const existing = checkNameCollision(trimmedName);
    if (existing) {
      error = `"${existing.name}" already exists`;
      return;
    }

    onRename(trimmedName);
    handleClose();
  }

  function handleClose() {
    mode = 'choose';
    newName = '';
    error = '';
    open = false;
    onClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (mode === 'rename') {
        mode = 'choose';
      } else {
        handleClose();
      }
    }
  }

  // Reset state when dialog opens
  $effect(() => {
    if (open) {
      mode = 'choose';
      newName = '';
      error = '';
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]"
    onclick={handleClose}
    role="dialog"
    aria-modal="true"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      {#if mode === 'choose'}
        <!-- Choose Mode -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Preset Already Exists
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A preset named "<span class="font-medium">{existingName}</span>" already exists in My Presets.
          </p>
        </div>

        <div class="px-6 py-4 space-y-3">
          <button
            type="button"
            onclick={handleOverwrite}
            class="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700
                   hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Overwrite</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Replace the existing preset with this one</p>
            </div>
          </button>

          <button
            type="button"
            onclick={handleStartRename}
            class="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700
                   hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Rename</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Save as a new preset with a different name</p>
            </div>
          </button>
        </div>

        <div class="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onclick={handleClose}
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                   border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>

      {:else}
        <!-- Rename Mode -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Rename Preset
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter a new name for this preset
          </p>
        </div>

        <div class="px-6 py-4">
          <label for="new-name-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New name
          </label>
          <input
            bind:value={newName}
            type="text"
            id="new-name-input"
            class="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700
                   border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            class:border-red-500={error}
          />
          {#if error}
            <p class="mt-1 text-sm text-red-500">{error}</p>
          {/if}
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onclick={() => mode = 'choose'}
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                   border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Back
          </button>
          <button
            type="button"
            onclick={handleConfirmRename}
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Save with New Name
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
