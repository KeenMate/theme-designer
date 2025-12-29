<script lang="ts">
  import { getVariableGroups } from '$lib/variableGroups';
  import { finalTheme, calculatedTheme, locked, toggleLock, setOverride, lockVariable, unlockVariable, selectedComponent, baseTheme, finalBaseTheme } from '$lib/stores/theme';
  import { buildThemeContext } from '$lib/colorResolver';
  import VariableGroup from './VariableGroup.svelte';
  import VariableRow from './VariableRow.svelte';

  // Get variable groups based on selected component
  let variableGroups = $derived(getVariableGroups($selectedComponent));

  // Get base theme variable names
  let baseVariables = $derived(Object.keys($baseTheme));

  // Build theme context for color resolution (combines base + component themes)
  let themeContext = $derived(buildThemeContext($baseTheme, $calculatedTheme));

  // Track which component we initialized for
  let initializedFor: string | null = $state(null);

  // Track expanded state for each group
  let expandedGroups = $state<Record<string, boolean>>({});

  // Initialize expanded state when component changes
  $effect(() => {
    const component = $selectedComponent;
    if (initializedFor !== component) {
      // Component changed - initialize expanded states from defaults
      const groups = getVariableGroups(component);
      const newExpanded: Record<string, boolean> = {
        'Base Layer': true, // Base layer expanded by default
      };
      groups.forEach((group) => {
        newExpanded[group.name] = group.expanded;
      });
      expandedGroups = newExpanded;
      initializedFor = component;
    }
  });

  function handleValueChange(varName: string, value: string) {
    // Lock and set override when user changes a value
    lockVariable(varName);
    setOverride(varName, value);
  }

  function handleToggleLock(varName: string) {
    toggleLock(varName);
  }

  function handleReset(varName: string) {
    // Unlock the variable to reset it to calculated value
    unlockVariable(varName);
  }

  // Expand all groups
  function expandAll() {
    const newExpanded: Record<string, boolean> = { 'Base Layer': true };
    variableGroups.forEach((group) => {
      newExpanded[group.name] = true;
    });
    expandedGroups = newExpanded;
  }

  // Collapse all groups
  function collapseAll() {
    const newExpanded: Record<string, boolean> = { 'Base Layer': false };
    variableGroups.forEach((group) => {
      newExpanded[group.name] = false;
    });
    expandedGroups = newExpanded;
  }
</script>

<div class="flex flex-col h-full">
  <!-- Header -->
  <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
      CSS Variables
    </h3>
    <div class="flex gap-1">
      <button
        type="button"
        onclick={expandAll}
        class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Expand All
      </button>
      <button
        type="button"
        onclick={collapseAll}
        class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Collapse
      </button>
    </div>
  </div>

  <!-- Help text -->
  <div class="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
    <i class="fa-solid fa-lock-open"></i> Lock to preserve value &nbsp;|&nbsp;
    <i class="fa-solid fa-rotate-left"></i> Reset to calculated
  </div>

  <!-- Groups list (scrollable) -->
  <div class="flex-1 overflow-y-auto">
    <!-- Base Layer Group -->
    <VariableGroup
      name="Base Layer"
      bind:expanded={expandedGroups['Base Layer']}
      variableCount={baseVariables.length}
    >
      <div class="px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
        <i class="fa-solid fa-info-circle mr-1"></i>
        Shared variables for cascading mode. Lock to override calculated values.
      </div>
      {#each baseVariables as varName (varName)}
        <VariableRow
          {varName}
          value={$finalBaseTheme[varName] || ''}
          calculatedValue={$baseTheme[varName] || ''}
          isLocked={$locked.has(varName)}
          {themeContext}
          onToggleLock={() => handleToggleLock(varName)}
          onChange={(value) => handleValueChange(varName, value)}
          onReset={() => handleReset(varName)}
        />
      {/each}
    </VariableGroup>

    <!-- Component-specific groups -->
    {#each variableGroups as group (group.name)}
      <VariableGroup
        name={group.name}
        bind:expanded={expandedGroups[group.name]}
        variableCount={group.variables.length}
      >
        {#each group.variables as varName (varName)}
          <VariableRow
            {varName}
            value={$finalTheme[varName] || ''}
            calculatedValue={$calculatedTheme[varName] || ''}
            isLocked={$locked.has(varName)}
            {themeContext}
            onToggleLock={() => handleToggleLock(varName)}
            onChange={(value) => handleValueChange(varName, value)}
            onReset={() => handleReset(varName)}
          />
        {/each}
      </VariableGroup>
    {/each}
  </div>
</div>
