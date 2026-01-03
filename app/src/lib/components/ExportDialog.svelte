<script lang="ts">
  import { cssOutput, jsonOutput, scssOutput, importFromString, resetOverrides, exportMode, manifest, setExportMode, type ExportMode } from '$lib/stores/theme';

  interface Props {
    open: boolean;
    startWithImport?: boolean;
    onClose: () => void;
  }

  let { open, startWithImport = false, onClose }: Props = $props();

  type Format = 'css' | 'json' | 'scss';
  let activeTab: Format = $state('css');
  let copied: Format | null = $state(null);
  let showImport = $state(false);

  // Sync showImport with startWithImport when dialog opens
  $effect(() => {
    if (open) {
      showImport = startWithImport;
    }
  });
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
    input.value = '';
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      importText = text;
    } catch (e) {
      console.error('Failed to paste:', e);
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events a11y_interactive_supports_focus -->
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onclick={handleBackdropClick}
    role="dialog"
  >
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {showImport ? 'Import Theme' : 'Export Theme'}
        </h3>
        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={onClose}
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            aria-label="Close dialog"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
      </div>

      {#if showImport}
        <!-- Import Content -->
        <div class="p-4 space-y-4 flex-1 overflow-y-auto">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Paste your existing CSS, JSON, or SCSS theme variables. Format is auto-detected.
          </p>

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

          <textarea
            bind:value={importText}
            placeholder="Paste CSS, JSON, or SCSS theme variables here..."
            class="w-full h-48 px-3 py-2 text-xs font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>

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

        <!-- Import Footer -->
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
      {:else}
        <!-- Export Content -->
        <div class="p-4 space-y-4 flex-1 overflow-y-auto min-h-0 flex flex-col">
          <!-- Export Mode Toggle (only shown when manifest is available) -->
          {#if $manifest}
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Base Variables</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {$exportMode === 'full'
                    ? 'Exporting all base variables'
                    : `Exporting only ${$manifest.baseVariables.length} variables used by ${$manifest.component}`}
                </div>
              </div>
              <div class="flex gap-1 p-0.5 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <button
                  type="button"
                  onclick={() => setExportMode('full')}
                  class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors {$exportMode === 'full'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
                >
                  Full
                </button>
                <button
                  type="button"
                  onclick={() => setExportMode('subset')}
                  class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors {$exportMode === 'subset'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
                >
                  Component Only
                </button>
              </div>
            </div>
          {/if}

          <!-- Tabs -->
          <div class="flex border-b border-gray-200 dark:border-gray-700">
            {#each tabs as tab}
              <button
                type="button"
                onclick={() => (activeTab = tab.id)}
                class="flex-1 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
                       {activeTab === tab.id
                         ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                         : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
              >
                {tab.label}
              </button>
            {/each}
          </div>

          <!-- Code block -->
          <div class="relative flex-1 min-h-64">
            <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs font-mono h-full absolute inset-0"><code>{getOutput(activeTab)}</code></pre>
          </div>
        </div>

        <!-- Export Footer -->
        <div class="flex gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex-1"></div>
          <button
            type="button"
            onclick={downloadFile}
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors
                   bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                   hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <i class="fa-solid fa-download"></i>
            Download
          </button>
          <button
            type="button"
            onclick={copyToClipboard}
            class="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2
                   {copied === activeTab
                     ? 'bg-green-500 text-white'
                     : 'bg-blue-500 hover:bg-blue-600 text-white'}"
          >
            {#if copied === activeTab}
              <i class="fa-solid fa-check"></i>
              Copied!
            {:else}
              <i class="fa-solid fa-copy"></i>
              Copy to Clipboard
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
