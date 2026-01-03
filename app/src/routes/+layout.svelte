<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import ExportDialog from '$lib/components/ExportDialog.svelte';
  import { loadThemeState } from '$lib/stores/theme';

  let darkMode = $state(false);
  let showExportDialog = $state(false);
  let startWithImport = $state(false);

  onMount(() => {
    // Load persisted theme state from localStorage
    loadThemeState();

    // Check localStorage or system preference for dark mode
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      darkMode = stored === 'true';
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    updateClass();
  });

  function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', String(darkMode));
    updateClass();
  }

  function updateClass() {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
</script>

<div class="h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col overflow-hidden">
  <!-- Header -->
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Theme Generator</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">by KeenMate</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            onclick={() => { showExportDialog = true; startWithImport = true; }}
            class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <i class="fa-solid fa-file-import"></i>
            Import
          </button>

          <button
            onclick={() => { showExportDialog = true; startWithImport = false; }}
            class="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center gap-2"
          >
            <i class="fa-solid fa-file-export"></i>
            Export
          </button>

          <button
            onclick={toggleDarkMode}
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {#if darkMode}
              <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main content (fills remaining space) -->
  <main class="px-4 sm:px-6 lg:px-8 py-4 flex-1 min-h-0 overflow-hidden">
    <slot />
  </main>
</div>

<ExportDialog bind:open={showExportDialog} {startWithImport} onClose={() => (showExportDialog = false)} />
