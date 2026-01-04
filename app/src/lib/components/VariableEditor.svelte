<script lang="ts">
  import { getVariableGroups, getVariableDescription } from '$lib/variableGroups';
  import { finalTheme, calculatedTheme, effectiveLocked, toggleLock, setOverride, lockVariable, unlockVariable, selectedComponent, baseTheme, finalBaseTheme } from '$lib/stores/theme';
  import { buildThemeContext } from '$lib/colorResolver';
  import VariableGroup from './VariableGroup.svelte';
  import VariableRow from './VariableRow.svelte';

  // Filter to show only modified variables
  let showOnlyModified = $state(false);

  // Get variable groups based on selected component
  let variableGroups = $derived(getVariableGroups($selectedComponent));

  // Get base theme variable names
  let baseVariables = $derived(Object.keys($baseTheme));

  // Build theme context for color resolution (combines base + component themes)
  let themeContext = $derived(buildThemeContext($baseTheme, $calculatedTheme));

  // Filter base variables to show only modified ones
  let filteredBaseVariables = $derived.by(() => {
    if (!showOnlyModified) return baseVariables;
    return baseVariables.filter(varName => {
      const isLocked = $effectiveLocked.has(varName);
      const value = $finalBaseTheme[varName] || '';
      const calcValue = $baseTheme[varName] || '';
      return isLocked && value !== calcValue;
    });
  });

  // Filter component groups to show only modified variables
  let filteredVariableGroups = $derived.by(() => {
    if (!showOnlyModified) return variableGroups;
    return variableGroups.map(group => ({
      ...group,
      variables: group.variables.filter(varName => {
        const isLocked = $effectiveLocked.has(varName);
        const value = $finalTheme[varName] || '';
        const calcValue = $calculatedTheme[varName] || '';
        return isLocked && value !== calcValue;
      })
    })).filter(group => group.variables.length > 0);
  });

  // Count of modified variables
  let modifiedCount = $derived.by(() => {
    let count = 0;
    // Count modified base variables
    for (const varName of baseVariables) {
      const isLocked = $effectiveLocked.has(varName);
      const value = $finalBaseTheme[varName] || '';
      const calcValue = $baseTheme[varName] || '';
      if (isLocked && value !== calcValue) count++;
    }
    // Count modified component variables
    for (const group of variableGroups) {
      for (const varName of group.variables) {
        const isLocked = $effectiveLocked.has(varName);
        const value = $finalTheme[varName] || '';
        const calcValue = $calculatedTheme[varName] || '';
        if (isLocked && value !== calcValue) count++;
      }
    }
    return count;
  });

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
    // For base variables on a component tab, lockVariable handles both locking and storing the value
    // in componentOverrides. For other variables, we still need setOverride for global overrides.
    lockVariable(varName, value);

    // Only set global override for non-base vars (base vars are handled by lockVariable)
    if (!varName.startsWith('--base-')) {
      setOverride(varName, value);
    }
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
        onclick={() => showOnlyModified = !showOnlyModified}
        class="text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors
               {showOnlyModified
                 ? 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40'
                 : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}"
        title={showOnlyModified ? 'Show all variables' : 'Show only modified variables'}
      >
        <i class="fa-solid fa-filter"></i>
        {#if modifiedCount > 0}
          <span class="text-[10px] font-medium">{modifiedCount}</span>
        {/if}
      </button>
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
    <!-- Base Layer Group (hidden when filtering and no modified base vars) -->
    {#if !showOnlyModified || filteredBaseVariables.length > 0}
      <VariableGroup
        name="Base Layer"
        bind:expanded={expandedGroups['Base Layer']}
        variableCount={filteredBaseVariables.length}
      >
        {#if !showOnlyModified}
          <div class="px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <i class="fa-solid fa-info-circle mr-1"></i>
            Shared variables for cascading mode. Lock to override calculated values.
          </div>
        {/if}
        {#each filteredBaseVariables as varName (varName)}
          <VariableRow
            {varName}
            value={$finalBaseTheme[varName] || ''}
            calculatedValue={$baseTheme[varName] || ''}
            isLocked={$effectiveLocked.has(varName)}
            {themeContext}
            description={getVariableDescription($selectedComponent, varName)}
            onToggleLock={() => handleToggleLock(varName)}
            onChange={(value) => handleValueChange(varName, value)}
            onReset={() => handleReset(varName)}
          />
        {/each}
      </VariableGroup>
    {/if}

    <!-- Component-specific groups -->
    {#each filteredVariableGroups as group (group.name)}
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
            isLocked={$effectiveLocked.has(varName)}
            {themeContext}
            description={getVariableDescription($selectedComponent, varName)}
            onToggleLock={() => handleToggleLock(varName)}
            onChange={(value) => handleValueChange(varName, value)}
            onReset={() => handleReset(varName)}
          />
        {/each}
      </VariableGroup>
    {/each}

    <!-- Empty state when filtering -->
    {#if showOnlyModified && modifiedCount === 0}
      <div class="flex flex-col items-center justify-center py-12 px-4 text-gray-400 dark:text-gray-500">
        <i class="fa-solid fa-check-circle text-3xl mb-2"></i>
        <p class="text-sm">No modified variables</p>
        <p class="text-xs mt-1">All values match calculated defaults</p>
      </div>
    {/if}
  </div>
</div>
