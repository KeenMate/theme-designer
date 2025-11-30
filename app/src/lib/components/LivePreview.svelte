<script lang="ts">
  import { onMount } from 'svelte';
  import { theme, colors } from '$lib/stores/theme';
  import { applyTheme } from '@keenmate/theme-generator';

  type MultiselectElement = HTMLElement & {
    options?: unknown[];
    valueMember?: string;
    displayValueMember?: string;
    subtitleMember?: string;
    groupMember?: string;
    setSelected?: (values: string[]) => void;
  };

  // Element refs for each example
  let basicEl: MultiselectElement | undefined = $state();
  let singleEl: MultiselectElement | undefined = $state();
  let countEl: MultiselectElement | undefined = $state();
  let compactEl: MultiselectElement | undefined = $state();
  let counterEl: MultiselectElement | undefined = $state();
  let checkboxEl: MultiselectElement | undefined = $state();
  let actionsEl: MultiselectElement | undefined = $state();
  let groupedEl: MultiselectElement | undefined = $state();
  let disabledEl: MultiselectElement | undefined = $state();

  let mounted = $state(false);

  // Sample data with groups and descriptions
  const sampleOptions = [
    { id: '1', name: 'React', description: 'A JavaScript library for building UIs', group: 'Frontend' },
    { id: '2', name: 'Vue', description: 'Progressive JavaScript framework', group: 'Frontend' },
    { id: '3', name: 'Angular', description: 'Platform for web applications', group: 'Frontend' },
    { id: '4', name: 'Svelte', description: 'Cybernetically enhanced web apps', group: 'Frontend' },
    { id: '5', name: 'Node.js', description: 'JavaScript runtime', group: 'Backend' },
    { id: '6', name: 'Django', description: 'Python web framework', group: 'Backend' },
    { id: '7', name: 'Rails', description: 'Ruby web framework', group: 'Backend' },
    { id: '8', name: 'Express', description: 'Node.js web framework', group: 'Backend' },
  ];

  function setupElement(el: MultiselectElement | undefined, options: {
    withGroup?: boolean;
    preselect?: string[];
  } = {}) {
    if (!el) return;
    el.valueMember = 'id';
    el.displayValueMember = 'name';
    el.subtitleMember = 'description';
    if (options.withGroup) {
      el.groupMember = 'group';
    }
    el.options = sampleOptions;
    if (options.preselect && el.setSelected) {
      setTimeout(() => el.setSelected?.(options.preselect!), 10);
    }
  }

  onMount(async () => {
    if (typeof window !== 'undefined') {
      try {
        await import('@keenmate/web-multiselect');
        mounted = true;

        // Wait for next tick to ensure elements are ready
        await new Promise(resolve => setTimeout(resolve, 50));

        // Setup all elements
        setupElement(basicEl, { preselect: ['1', '2'] });
        setupElement(singleEl);
        setupElement(countEl, { preselect: ['1', '2', '3', '4'] });
        setupElement(compactEl, { preselect: ['1', '2', '3'] });
        setupElement(counterEl, { preselect: ['1', '2', '3'] });
        setupElement(checkboxEl);
        setupElement(actionsEl);
        setupElement(groupedEl, { withGroup: true });
        setupElement(disabledEl, { preselect: ['1'] });
      } catch (e) {
        console.warn('Failed to load web-multiselect:', e);
      }
    }
  });

  // Apply theme to all elements whenever it changes
  $effect(() => {
    if ($theme) {
      const elements = [basicEl, singleEl, countEl, compactEl, counterEl, checkboxEl, actionsEl, groupedEl, disabledEl];
      elements.forEach(el => {
        if (el) applyTheme(el, $theme);
      });
    }
  });

  // Get current background color for preview container
  let bgColor = $derived($colors.background);
  let textColor = $derived($colors.text);
</script>

<div class="space-y-4">
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Live Preview</h3>
    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      Different multiselect configurations showing various theme variables
    </p>
  </div>

  <div
    class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-colors"
    style="background-color: {bgColor}"
  >
    {#if mounted}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Basic Multi-Select with Badges -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Multi-Select (Badges)
          </h4>
          <web-multiselect
            bind:this={basicEl}
            placeholder="Select frameworks..."
            enable-search="true"
            multiple="true"
          ></web-multiselect>
        </div>

        <!-- Single Select -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Single Select
          </h4>
          <web-multiselect
            bind:this={singleEl}
            placeholder="Select one..."
            enable-search="true"
            multiple="false"
          ></web-multiselect>
        </div>

        <!-- Count Display Mode -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Count Mode
          </h4>
          <web-multiselect
            bind:this={countEl}
            placeholder="Select multiple..."
            enable-search="true"
            multiple="true"
            badges-display-mode="count"
          ></web-multiselect>
        </div>

        <!-- Compact Display Mode -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Compact Mode (+X more)
          </h4>
          <web-multiselect
            bind:this={compactEl}
            placeholder="Select multiple..."
            enable-search="true"
            multiple="true"
            badges-display-mode="compact"
          ></web-multiselect>
        </div>

        <!-- With Counter Badge -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            With Counter Badge
          </h4>
          <web-multiselect
            bind:this={counterEl}
            placeholder="Select frameworks..."
            enable-search="true"
            multiple="true"
            show-counter="true"
          ></web-multiselect>
        </div>

        <!-- With Checkboxes -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            With Checkboxes
          </h4>
          <web-multiselect
            bind:this={checkboxEl}
            placeholder="Select with checkboxes..."
            enable-search="true"
            multiple="true"
            show-checkboxes="true"
          ></web-multiselect>
        </div>

        <!-- With Actions (Select All / Clear All) -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Select All / Clear All
          </h4>
          <web-multiselect
            bind:this={actionsEl}
            placeholder="Select frameworks..."
            enable-search="true"
            multiple="true"
            show-select-all="true"
            show-checkboxes="true"
          ></web-multiselect>
        </div>

        <!-- Grouped Options -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Grouped Options
          </h4>
          <web-multiselect
            bind:this={groupedEl}
            placeholder="Select by category..."
            enable-search="true"
            multiple="true"
          ></web-multiselect>
        </div>

        <!-- Disabled State -->
        <div class="space-y-2 md:col-span-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Disabled State
          </h4>
          <web-multiselect
            bind:this={disabledEl}
            placeholder="Disabled..."
            multiple="true"
            disabled
          ></web-multiselect>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each Array(9) as _}
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        {/each}
      </div>
    {/if}
  </div>

  <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
    Preview background matches your selected background color
  </p>
</div>
