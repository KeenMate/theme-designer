<script lang="ts">
  import { onMount } from 'svelte';
  import { resolvedTheme, colors, baseTheme } from '$lib/stores/theme';
  import { applyTheme } from '@keenmate/theme-designer';

  type DaterangepickerElement = HTMLElement & {
    value?: string;
    startDate?: string;
    endDate?: string;
    specialDates?: any[];
    getDateMetadataCallback?: (date: Date) => any;
  };

  // Element refs for each example
  let singleEl: DaterangepickerElement | undefined = $state();
  let rangeEl: DaterangepickerElement | undefined = $state();
  let multiMonthEl: DaterangepickerElement | undefined = $state();
  let badgesEl: DaterangepickerElement | undefined = $state();
  let tooltipsEl: DaterangepickerElement | undefined = $state();
  let manualEl: DaterangepickerElement | undefined = $state();
  let formatEl: DaterangepickerElement | undefined = $state();
  let disabledEl: DaterangepickerElement | undefined = $state();

  let mounted = $state(false);

  // Sample special dates for badges demo
  function getSpecialDates() {
    const today = new Date();
    const dates = [];

    // Add badges for next 2 weeks
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Add different badge types
      if (i % 3 === 0) {
        dates.push({
          date: date.toISOString().split('T')[0],
          badgeText: '$' + (99 + i * 10),
          badgeClass: 'badge-number'
        });
      } else if (i % 3 === 1) {
        dates.push({
          date: date.toISOString().split('T')[0],
          badgeText: (i + 1).toString(),
          badgeClass: 'badge-count'
        });
      }
    }
    return dates;
  }

  // Callback for tooltips demo
  function getTooltipMetadata(date: Date) {
    const day = date.getDate();
    if (day % 5 === 0) {
      return { dayTooltip: `Special date: ${date.toLocaleDateString()}` };
    }
    if (day % 7 === 0) {
      return { dayTooltip: 'Weekly event' };
    }
    return null;
  }

  onMount(async () => {
    if (typeof window !== 'undefined') {
      try {
        await import('@keenmate/web-daterangepicker');
        mounted = true;

        // Wait for elements to be ready
        await new Promise(resolve => setTimeout(resolve, 50));

        // Setup badges element with special dates
        if (badgesEl) {
          badgesEl.specialDates = getSpecialDates();
        }

        // Setup tooltips element with callback
        if (tooltipsEl) {
          tooltipsEl.getDateMetadataCallback = getTooltipMetadata;
        }
      } catch (e) {
        console.warn('Failed to load web-daterangepicker:', e);
      }
    }
  });

  // Apply theme to all elements whenever it changes
  $effect(() => {
    if ($resolvedTheme && $baseTheme) {
      const elements = [singleEl, rangeEl, multiMonthEl, badgesEl, tooltipsEl, manualEl, formatEl, disabledEl];
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

  function toggleManualPicker() {
    if (manualEl && 'toggle' in manualEl) {
      (manualEl as HTMLElement & { toggle: () => void }).toggle();
    }
  }
</script>

<div class="space-y-4">
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Live Preview</h3>
    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      Different daterangepicker configurations showing various theme variables
    </p>
  </div>

  <div
    class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-colors"
    style="background-color: {bgColor}"
  >
    {#if mounted}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Single Date Picker -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Single Date
          </h4>
          <web-daterangepicker
            bind:this={singleEl}
            selection-mode="single"
            placeholder="Select a date..."
          ></web-daterangepicker>
        </div>

        <!-- Date Range Picker -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Date Range
          </h4>
          <web-daterangepicker
            bind:this={rangeEl}
            selection-mode="range"
            placeholder="Start - End"
          ></web-daterangepicker>
        </div>

        <!-- Multi-Month Mode -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Multi-Month (2)
          </h4>
          <web-daterangepicker
            bind:this={multiMonthEl}
            selection-mode="range"
            visible-months="2"
            placeholder="Select range..."
          ></web-daterangepicker>
        </div>

        <!-- With Badges -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            With Badges
          </h4>
          <web-daterangepicker
            bind:this={badgesEl}
            selection-mode="single"
            placeholder="Open to see badges..."
          ></web-daterangepicker>
        </div>

        <!-- With Tooltips -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            With Tooltips
          </h4>
          <web-daterangepicker
            bind:this={tooltipsEl}
            selection-mode="single"
            placeholder="Hover days 5,7,10..."
          ></web-daterangepicker>
        </div>

        <!-- Manual Trigger -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Manual Trigger
          </h4>
          <div class="flex gap-2 items-stretch">
            <web-daterangepicker
              bind:this={manualEl}
              selection-mode="single"
              calendar-open-trigger="manual"
              placeholder="Use button..."
              class="flex-1"
            ></web-daterangepicker>
            <button
              type="button"
              onclick={toggleManualPicker}
              class="px-3 rounded border text-sm flex items-center"
              style="border-color: {textColor}; color: {textColor}; opacity: 0.7"
            >
              📅
            </button>
          </div>
        </div>

        <!-- Different Format -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            DD/MM/YYYY Format
          </h4>
          <web-daterangepicker
            bind:this={formatEl}
            selection-mode="single"
            date-format-mask="DD/MM/YYYY"
            placeholder="DD/MM/YYYY"
          ></web-daterangepicker>
        </div>

        <!-- Disabled State -->
        <div class="space-y-2">
          <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
            Disabled State
          </h4>
          <web-daterangepicker
            bind:this={disabledEl}
            selection-mode="single"
            placeholder="Disabled..."
            disabled
          ></web-daterangepicker>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each Array(8) as _}
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
        How base variables map to daterangepicker UI elements:
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
              <td class="py-2 pr-4">Selected day, range endpoints, today indicator</td>
              <td class="py-2">Primary brand color for selections</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-accent-color-hover</code></td>
              <td class="py-2 pr-4">Selected day hover state</td>
              <td class="py-2">Interactive feedback on selections</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-accent-color-light</code></td>
              <td class="py-2 pr-4">Range selection background, badges</td>
              <td class="py-2">Subtle accent for date ranges (10-15% opacity)</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-primary-bg</code></td>
              <td class="py-2 pr-4">Calendar background, input background</td>
              <td class="py-2">Main surface color</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-primary-bg-hover</code></td>
              <td class="py-2 pr-4">Day cell hover, nav button hover</td>
              <td class="py-2">Hover highlights</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-text-color-1</code></td>
              <td class="py-2 pr-4">Day numbers, month/year header</td>
              <td class="py-2">Primary readable text</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-text-color-3</code></td>
              <td class="py-2 pr-4">Weekday headers (Mon, Tue...)</td>
              <td class="py-2">Secondary/muted text</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-text-color-4</code></td>
              <td class="py-2 pr-4">Other month days, placeholder</td>
              <td class="py-2">Muted/inactive text</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-text-on-accent</code></td>
              <td class="py-2 pr-4">Text on selected days</td>
              <td class="py-2">Contrast text on accent backgrounds</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-border-color</code></td>
              <td class="py-2 pr-4">Calendar border, input border</td>
              <td class="py-2">Element separation</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-input-border-focus</code></td>
              <td class="py-2 pr-4">Input focus ring</td>
              <td class="py-2">Focus indicator (uses accent)</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-dropdown-box-shadow</code></td>
              <td class="py-2 pr-4">Calendar popup shadow</td>
              <td class="py-2">Floating elevation</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-tooltip-background</code></td>
              <td class="py-2 pr-4">Day tooltips</td>
              <td class="py-2">Tooltip surface color</td>
            </tr>
            <tr class="border-b border-gray-100 dark:border-gray-700/50">
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-font-family</code></td>
              <td class="py-2 pr-4">All text</td>
              <td class="py-2">Typography</td>
            </tr>
            <tr>
              <td class="py-2 pr-4"><code class="text-purple-600 dark:text-purple-400">--base-border-radius-*</code></td>
              <td class="py-2 pr-4">Day cells, input, calendar container</td>
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
