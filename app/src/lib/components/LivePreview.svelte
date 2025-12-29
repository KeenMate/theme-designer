<script lang="ts">
  import { onMount } from 'svelte';
  import { resolvedTheme, colors, baseTheme } from '$lib/stores/theme';
  import { applyTheme } from '@keenmate/theme-designer';

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

  // Sample data with groups and descriptions (for rich content examples)
  const sampleOptions = [
    { id: '1', name: 'React', description: 'A JavaScript library for building UIs', group: 'Frontend' },
    { id: '2', name: 'Vue', description: 'Progressive JavaScript framework', group: 'Frontend' },
    { id: '3', name: 'Angular', description: 'Platform for web applications', group: 'Frontend', disabled: true },
    { id: '4', name: 'Svelte', description: 'Cybernetically enhanced web apps', group: 'Frontend' },
    { id: '5', name: 'Node.js', description: 'JavaScript runtime', group: 'Backend' },
    { id: '6', name: 'Django', description: 'Python web framework', group: 'Backend', disabled: true },
    { id: '7', name: 'Rails', description: 'Ruby web framework', group: 'Backend' },
    { id: '8', name: 'Express', description: 'Node.js web framework', group: 'Backend' },
  ];

  // Simple options without descriptions (for single-line examples)
  const simpleOptions = [
    { id: '1', name: 'JavaScript' },
    { id: '2', name: 'TypeScript' },
    { id: '3', name: 'Python', disabled: true },
    { id: '4', name: 'Rust' },
    { id: '5', name: 'Go' },
    { id: '6', name: 'Java', disabled: true },
    { id: '7', name: 'C#' },
    { id: '8', name: 'Ruby' },
  ];

  function setupElement(el: MultiselectElement | undefined, options: {
    withGroup?: boolean;
    preselect?: string[];
    simple?: boolean;  // Use simple options without subtitles
  } = {}) {
    if (!el) return;
    el.valueMember = 'id';
    el.displayValueMember = 'name';
    (el as any).disabledMember = 'disabled';
    if (!options.simple) {
      el.subtitleMember = 'description';
    }
    if (options.withGroup) {
      el.groupMember = 'group';
    }
    el.options = options.simple ? simpleOptions : sampleOptions;
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

        // Setup all elements - mix of rich (with subtitles) and simple (single-line) options
        setupElement(basicEl, { preselect: ['1', '2'] });
        setupElement(singleEl, { simple: true });  // Single-line options
        setupElement(countEl, { preselect: ['1', '2', '3', '4'], simple: true });  // Single-line
        setupElement(compactEl, { preselect: ['1', '2', '3'] });
        setupElement(counterEl, { preselect: ['1', '2', '3'], simple: true });  // Single-line
        setupElement(checkboxEl, { simple: true });  // Single-line options
        setupElement(actionsEl);
        setupElement(groupedEl, { withGroup: true });
        setupElement(disabledEl, { preselect: ['1'], simple: true });  // Single-line
      } catch (e) {
        console.warn('Failed to load web-multiselect:', e);
      }
    }
  });

  // Apply theme to all elements whenever it changes
  $effect(() => {
    if ($resolvedTheme && $baseTheme) {
      const elements = [basicEl, singleEl, countEl, compactEl, counterEl, checkboxEl, actionsEl, groupedEl, disabledEl];
      elements.forEach(el => {
        if (el) {
          // Apply base theme first (includes font-family)
          applyTheme(el, $baseTheme);
          // Then apply component theme (resolved - all var() and color-mix() computed)
          applyTheme(el, $resolvedTheme);
        }
      });
    }
  });

  // Inject font @import into document when it changes
  $effect(() => {
    const fontImport = $colors.fontImport;
    if (typeof document === 'undefined') return;

    // Remove old font style element
    const oldStyle = document.getElementById('theme-generator-font');
    if (oldStyle) oldStyle.remove();

    // Add new font @import if present
    if (fontImport) {
      const style = document.createElement('style');
      style.id = 'theme-generator-font';
      style.textContent = fontImport;
      document.head.appendChild(style);
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
            enable-badge-tooltips="true"
          ></web-multiselect>
        </div>

        <!-- Single Select -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Single Select
          </h4>
          <web-multiselect
            bind:this={singleEl}
            placeholder="Select a language..."
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
            placeholder="Select languages..."
            enable-search="true"
            multiple="true"
            badges-display-mode="count"
            enable-badge-tooltips="true"
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
            enable-badge-tooltips="true"
          ></web-multiselect>
        </div>

        <!-- With Counter Badge -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            With Counter Badge
          </h4>
          <web-multiselect
            bind:this={counterEl}
            placeholder="Select languages..."
            enable-search="true"
            multiple="true"
            show-counter="true"
            enable-badge-tooltips="true"
          ></web-multiselect>
        </div>

        <!-- With Checkboxes -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            With Checkboxes
          </h4>
          <web-multiselect
            bind:this={checkboxEl}
            placeholder="Select languages..."
            enable-search="true"
            multiple="true"
            show-checkboxes="true"
            enable-badge-tooltips="true"
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
            enable-badge-tooltips="true"
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
            enable-badge-tooltips="true"
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
            enable-badge-tooltips="true"
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

  <!-- Variable Reference Legend -->
  <details class="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <summary class="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg select-none flex items-center justify-between">
      <span>Variable Reference</span>
      <svg class="w-4 h-4 transition-transform details-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </summary>
    <div class="px-4 pb-4 text-xs">
      <p class="text-gray-500 dark:text-gray-400 mb-3">
        How base variables map to multiselect UI elements:
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-600">
              <th class="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-300">Variable</th>
              <th class="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-300">Affects</th>
              <th class="pb-2 font-medium text-gray-600 dark:text-gray-300">Design Impact</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-400">
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-accent-color</code></td>
              <td class="py-2 pr-4">Checkboxes, focus ring, badge remove button</td>
              <td class="py-2">Primary brand color for selections</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-accent-color-hover</code></td>
              <td class="py-2 pr-4">Checkbox hover, badge remove hover</td>
              <td class="py-2">Interactive feedback on accent elements</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-accent-color-light</code></td>
              <td class="py-2 pr-4">Badge background, selected option tint</td>
              <td class="py-2">Subtle accent for backgrounds (10-15% opacity)</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-primary-bg</code></td>
              <td class="py-2 pr-4">Input background, dropdown background</td>
              <td class="py-2">Main surface color</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-primary-bg-hover</code></td>
              <td class="py-2 pr-4">Option hover background</td>
              <td class="py-2">Row highlight on hover</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-text-color-1</code></td>
              <td class="py-2 pr-4">Option labels, input text</td>
              <td class="py-2">Primary readable text</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-text-color-3</code></td>
              <td class="py-2 pr-4">Option subtitles, group labels</td>
              <td class="py-2">Secondary/muted text</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-text-color-4</code></td>
              <td class="py-2 pr-4">Placeholder text</td>
              <td class="py-2">Input hints/captions</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-text-on-accent</code></td>
              <td class="py-2 pr-4">Badge remove icon, checkbox checkmark</td>
              <td class="py-2">Contrast text on accent backgrounds</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-border-color</code></td>
              <td class="py-2 pr-4">Input border, dropdown border, group dividers</td>
              <td class="py-2">Element separation</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-input-border-focus</code></td>
              <td class="py-2 pr-4">Input focus ring</td>
              <td class="py-2">Focus indicator (uses accent)</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-dropdown-box-shadow</code></td>
              <td class="py-2 pr-4">Dropdown elevation</td>
              <td class="py-2">Depth/layering effect</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-tooltip-background</code></td>
              <td class="py-2 pr-4">Badge tooltips</td>
              <td class="py-2">Tooltip surface color</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-font-family</code></td>
              <td class="py-2 pr-4">All text</td>
              <td class="py-2">Typography</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-border-radius-*</code></td>
              <td class="py-2 pr-4">Input, badges, dropdown, checkboxes</td>
              <td class="py-2">Roundness style (sm/md/lg)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </details>

  <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
    Preview background matches your selected background color
  </p>
</div>
