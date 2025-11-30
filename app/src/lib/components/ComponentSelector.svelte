<script lang="ts">
  import { selectedComponent, resetOverrides } from '$lib/stores/theme';
  import type { ComponentType } from '@keenmate/theme-generator';

  const components: { id: ComponentType; name: string; available: boolean }[] = [
    { id: 'web-multiselect', name: 'Web Multiselect', available: true },
    { id: 'web-daterangepicker', name: 'Web Daterangepicker', available: true },
  ];

  function selectComponent(component: ComponentType) {
    // Reset overrides when switching components (locked values don't apply across components)
    resetOverrides();
    selectedComponent.set(component);
  }
</script>

<div class="space-y-3">
  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Component</h3>

  <div class="space-y-2">
    {#each components as component (component.id)}
      <button
        type="button"
        onclick={() => component.available && selectComponent(component.id)}
        disabled={!component.available}
        class="w-full p-3 rounded-lg border text-left transition-all
               {$selectedComponent === component.id
                 ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-900/20'
                 : component.available
                   ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                   : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'}"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium {$selectedComponent === component.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}">
            {component.name}
          </span>
          {#if !component.available}
            <span class="text-xs text-gray-400 dark:text-gray-500">Coming soon</span>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</div>
