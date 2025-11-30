<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    name: string;
    expanded: boolean;
    variableCount: number;
    children: Snippet;
  }

  let { name, expanded = $bindable(), variableCount, children }: Props = $props();

  function toggle() {
    expanded = !expanded;
  }
</script>

<div class="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
  <!-- Group header -->
  <button
    type="button"
    onclick={toggle}
    class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
  >
    <!-- Expand/collapse icon -->
    <span class="text-gray-400 dark:text-gray-500 transition-transform {expanded ? 'rotate-90' : ''}">
      ▶
    </span>

    <!-- Group name -->
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
      {name}
    </span>

    <!-- Variable count badge -->
    <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
      {variableCount}
    </span>
  </button>

  <!-- Group content -->
  {#if expanded}
    <div class="pb-2">
      {@render children()}
    </div>
  {/if}
</div>
