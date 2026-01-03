<script lang="ts">
  import { saveCurrentAsPreset, checkNameCollision } from '$lib/stores/userPresets';

  interface Props {
    open: boolean;
    onClose: () => void;
    onSaved?: (preset: { id: string; name: string }) => void;
  }

  let { open = $bindable(), onClose, onSaved }: Props = $props();

  let name = $state('');
  let description = $state('');
  let error = $state('');
  let nameInput: HTMLInputElement | undefined = $state();

  function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      error = 'Please enter a name';
      return;
    }

    // Check for collision
    const existing = checkNameCollision(trimmedName);
    if (existing) {
      error = `A preset named "${existing.name}" already exists`;
      return;
    }

    const preset = saveCurrentAsPreset(trimmedName, description);
    onSaved?.({ id: preset.id, name: preset.name });
    handleClose();
  }

  function handleClose() {
    name = '';
    description = '';
    error = '';
    open = false;
    onClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  }

  // Focus input when dialog opens
  $effect(() => {
    if (open && nameInput) {
      setTimeout(() => nameInput?.focus(), 50);
    }
  });

  // Clear error when name changes
  $effect(() => {
    if (name) {
      error = '';
    }
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onclick={handleClose}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="save-preset-title"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 id="save-preset-title" class="text-lg font-semibold text-gray-900 dark:text-white">
          Save as Preset
        </h2>
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
      <div class="px-6 py-4 space-y-4">
        <div>
          <label for="preset-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name <span class="text-red-500">*</span>
          </label>
          <input
            bind:this={nameInput}
            bind:value={name}
            type="text"
            id="preset-name"
            placeholder="e.g., Project Alpha"
            class="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700
                   border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400 dark:placeholder-gray-500"
            class:border-red-500={error}
            class:focus:ring-red-500={error}
          />
          {#if error}
            <p class="mt-1 text-sm text-red-500">{error}</p>
          {/if}
        </div>

        <div>
          <label for="preset-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span class="text-gray-400">(optional)</span>
          </label>
          <input
            bind:value={description}
            type="text"
            id="preset-description"
            placeholder="e.g., Dark theme for admin dashboard"
            class="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700
                   border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <button
          type="button"
          onclick={handleClose}
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
                 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600
                 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onclick={handleSave}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700
                 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Save Preset
        </button>
      </div>
    </div>
  </div>
{/if}
