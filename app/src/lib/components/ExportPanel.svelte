<script lang="ts">
  import { cssOutput, jsonOutput, scssOutput, importFromString, resetOverrides } from '$lib/stores/theme';

  type Format = 'css' | 'json' | 'scss';
  let activeTab: Format = $state('css');
  let copied: Format | null = $state(null);
  let showImport = $state(false);
  let importText = $state('');
  let importResult: { success: boolean; count: number } | null = $state(null);

  const tabs: { id: Format; label: string }[] = [
    { id: 'css', label: 'CSS' },
    { id: 'json', label: 'JSON' },
    { id: 'scss', label: 'SCSS' }
  ];

  function getOutput(tab: Format): string {
    switch (tab) {
      case 'css':
        return $cssOutput;
      case 'json':
        return $jsonOutput;
      case 'scss':
        return $scssOutput;
    }
  }

  async function copyToClipboard() {
    const content = getOutput(activeTab);
    try {
      await navigator.clipboard.writeText(content);
      copied = activeTab;
      setTimeout(() => {
        copied = null;
      }, 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  }

  function downloadFile() {
    const content = getOutput(activeTab);
    const extensions: Record<Format, string> = {
      css: 'css',
      json: 'json',
      scss: 'scss'
    };
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme.${extensions[activeTab]}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    if (!importText.trim()) {
      importResult = { success: false, count: 0 };
      return;
    }

    const count = importFromString(importText);
    importResult = { success: count > 0, count };

    if (count > 0) {
      // Clear import text and close modal after short delay
      setTimeout(() => {
        importText = '';
        showImport = false;
        importResult = null;
      }, 1500);
    }
  }

  function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      importText = event.target?.result as string || '';
    };
    reader.readAsText(file);
    input.value = ''; // Reset input
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      importText = text;
    } catch (e) {
      console.error('Failed to paste:', e);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      showImport = false;
    }
  }
</script>

<svelte:window onkeydown={showImport ? handleKeydown : undefined} />

<div class="flex flex-col h-full space-y-3">
  <div class="flex justify-between items-center">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Export</h3>
    <button
      type="button"
      onclick={() => (showImport = true)}
      class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
      title="Import existing theme"
    >
      <i class="fa-solid fa-file-import"></i>
      Import
    </button>
  </div>

  <!-- Tabs -->
  <div class="flex border-b border-gray-200 dark:border-gray-700">
    {#each tabs as tab}
      <button
        type="button"
        onclick={() => (activeTab = tab.id)}
        class="flex-1 px-2 py-2 text-xs font-medium transition-colors border-b-2 -mb-px
               {activeTab === tab.id
                 ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Code block (fills remaining space) -->
  <div class="relative flex-1 min-h-0">
    <pre class="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-auto text-xs font-mono h-full absolute inset-0"><code>{getOutput(activeTab)}</code></pre>
  </div>

  <!-- Actions -->
  <div class="flex gap-2">
    <button
      type="button"
      onclick={copyToClipboard}
      class="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all
             {copied === activeTab
               ? 'bg-green-500 text-white'
               : 'bg-blue-500 hover:bg-blue-600 text-white'}"
    >
      {copied === activeTab ? '✓ Copied!' : 'Copy'}
    </button>
    <button
      type="button"
      onclick={downloadFile}
      class="px-3 py-2 text-xs font-medium rounded-lg transition-colors
             bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
             hover:bg-gray-200 dark:hover:bg-gray-600"
      title="Download file"
    >
      <i class="fa-solid fa-download"></i>
    </button>
  </div>
</div>

<!-- Import Modal -->
{#if showImport}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onclick={(e) => e.target === e.currentTarget && (showImport = false)}
    role="dialog"
  >
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Import Theme
        </h3>
        <button
          type="button"
          onclick={() => (showImport = false)}
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="p-4 space-y-4 flex-1 overflow-y-auto">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Paste your existing CSS, JSON, or SCSS theme variables. Format is auto-detected.
        </p>

        <!-- Quick actions -->
        <div class="flex gap-2">
          <button
            type="button"
            onclick={handlePaste}
            class="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-paste"></i>
            Paste from Clipboard
          </button>
          <label
            class="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i class="fa-solid fa-file-arrow-up"></i>
            Upload File
            <input type="file" accept=".css,.json,.scss,.txt" class="sr-only" onchange={handleFileUpload} />
          </label>
        </div>

        <!-- Text area -->
        <textarea
          bind:value={importText}
          placeholder="Paste CSS, JSON, or SCSS theme variables here..."
          class="w-full h-48 px-3 py-2 text-xs font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>

        <!-- Result message -->
        {#if importResult}
          <div
            class="px-3 py-2 rounded-lg text-sm {importResult.success
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}"
          >
            {#if importResult.success}
              <i class="fa-solid fa-check mr-2"></i>
              Imported {importResult.count} variables successfully!
            {:else}
              <i class="fa-solid fa-exclamation-triangle mr-2"></i>
              No valid variables found. Check your input format.
            {/if}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onclick={() => {
            resetOverrides();
            showImport = false;
          }}
          class="px-4 py-2 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Clear All Overrides
        </button>
        <div class="flex-1"></div>
        <button
          type="button"
          onclick={() => (showImport = false)}
          class="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onclick={handleImport}
          disabled={!importText.trim()}
          class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Import
        </button>
      </div>
    </div>
  </div>
{/if}
