<script lang="ts">
  import { onMount } from 'svelte';
  import { resolvedTheme, colors, finalBaseTheme } from '$lib/stores/theme';
  import { applyTheme } from '@keenmate/theme-designer';

  type GridElement = HTMLElement & {
    columns?: unknown[];
    items?: unknown[];
    pageSize?: number;
    editable?: boolean;
    editTrigger?: string;
    showRowNumbers?: boolean;
    sortable?: boolean;
    striped?: boolean;
    hoverable?: boolean;
    pageable?: boolean;
    customStylesCallback?: () => string;
    rowClassCallback?: (row: any, index: number) => string | null;
  };

  let gridEl: GridElement | undefined = $state();
  let mounted = $state(false);

  // Sample employee data from web-grid examples
  const sampleData = [
    { id: 1847, name: 'Alice Johnson', email: 'alice@example.com', department: 'Engineering', salary: 85000, startDate: '2020-03-15', status: 'Active', manager: 'John Doe', location: 'New York' },
    { id: 2391, name: 'Bob Smith', email: 'bob@example.com', department: 'Marketing', salary: 72000, startDate: '2019-07-22', status: 'Active', manager: 'Jane Smith', location: 'Los Angeles' },
    { id: 1052, name: 'Carol Williams', email: 'carol@example.com', department: 'Engineering', salary: 92000, startDate: '2018-11-01', status: 'Active', manager: 'John Doe', location: 'New York' },
    { id: 3764, name: 'David Brown', email: 'david@example.com', department: 'Sales', salary: 68000, startDate: '2021-01-10', status: 'Active', manager: 'Mike Johnson', location: 'Chicago' },
    { id: 2908, name: 'Eva Martinez', email: 'eva@example.com', department: 'HR', salary: 65000, startDate: '2020-06-20', status: 'Active', manager: 'Sarah Lee', location: 'Miami' },
    { id: 1523, name: 'Frank Lee', email: 'frank@example.com', department: 'Engineering', salary: 88000, startDate: '2019-02-14', status: 'Active', manager: 'John Doe', location: 'New York' },
    { id: 4281, name: 'Grace Kim', email: 'grace@example.com', department: 'Marketing', salary: 75000, startDate: '2020-09-05', status: 'On Leave', manager: 'Jane Smith', location: 'Los Angeles' },
    { id: 3156, name: 'Henry Chen', email: 'henry@example.com', department: 'Sales', salary: 71000, startDate: '2021-04-18', status: 'Active', manager: 'Mike Johnson', location: 'Chicago' },
  ];

  // Options for select editors
  const departmentOptions = [
    { value: 'Engineering', label: 'Engineering', icon: '⚙️', subtitle: 'Product & Development' },
    { value: 'Marketing', label: 'Marketing', icon: '📢', subtitle: 'Brand & Communications' },
    { value: 'Sales', label: 'Sales', icon: '💼', subtitle: 'Revenue & Growth' },
    { value: 'HR', label: 'HR', icon: '👥', subtitle: 'People & Culture' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active', icon: '✅' },
    { value: 'Inactive', label: 'Inactive', icon: '⏸️' },
    { value: 'On Leave', label: 'On Leave', icon: '🏖️' },
  ];

  const locationOptions = [
    { value: 'New York', label: 'New York' },
    { value: 'Los Angeles', label: 'Los Angeles' },
    { value: 'Chicago', label: 'Chicago' },
    { value: 'Miami', label: 'Miami' },
    { value: 'Seattle', label: 'Seattle' },
  ];

  // Column definitions
  const columns = [
    { field: 'id', title: 'ID', width: '60px', align: 'center', editable: false },
    { field: 'name', title: 'Name', width: '140px', editor: 'text' },
    { field: 'email', title: 'Email', width: '180px', editor: 'text' },
    {
      field: 'department',
      title: 'Dept',
      width: '140px',
      editor: 'select',
      editorOptions: {
        options: departmentOptions,
        showOnFocus: false,
        iconMember: 'icon',
        subtitleMember: 'subtitle'
      },
      dropdownToggleVisibility: 'on-focus'
    },
    {
      field: 'salary',
      title: 'Salary',
      width: '100px',
      align: 'right',
      editor: 'number',
      formatCallback: (val: number) => val != null ? `$${val.toLocaleString()}` : ''
    },
    {
      field: 'startDate',
      title: 'Start Date',
      width: '110px',
      editor: 'date',
      editorOptions: { dateFormat: 'DD.MM.YYYY', outputFormat: 'iso' },
      formatCallback: (val: string) => {
        if (!val) return '';
        const date = new Date(val);
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
      }
    },
    {
      field: 'status',
      title: 'Status',
      width: '110px',
      editor: 'select',
      editorOptions: { options: statusOptions, showOnFocus: false, iconMember: 'icon' }
    },
    {
      field: 'location',
      title: 'Location',
      width: '120px',
      editor: 'combobox',
      editorOptions: { options: locationOptions, showOnFocus: false }
    }
  ];

  function setupGrid(el: GridElement | undefined) {
    if (!el) return;
    el.items = sampleData;
    el.columns = columns;
    el.pageSize = 5;
    el.editable = true;
    el.editTrigger = 'navigate';
    el.showRowNumbers = true;
    el.sortable = true;
    el.striped = true;
    el.hoverable = true;
    el.pageable = true;

    // Dynamic row styling based on status
    el.rowClassCallback = (row: any) => {
      if (row.status === 'On Leave' || row.status === 'Inactive') return 'row-inactive';
      return null;
    };

    // Custom styles for shadow DOM
    el.customStylesCallback = () => `
      .row-inactive { opacity: 0.6; background-color: var(--wg-surface-2) !important; }
    `;
  }

  onMount(async () => {
    if (typeof window !== 'undefined') {
      try {
        await import('@keenmate/web-grid');
        await import('@keenmate/web-grid/css');
        mounted = true;

        // Wait for next tick to ensure elements are ready
        await new Promise(resolve => setTimeout(resolve, 50));

        setupGrid(gridEl);
      } catch (e) {
        console.warn('Failed to load web-grid:', e);
      }
    }
  });

  // Apply theme whenever it changes
  $effect(() => {
    if ($finalBaseTheme && gridEl) {
      // Apply base theme (includes user overrides)
      applyTheme(gridEl, $finalBaseTheme);
      // Then apply any component-specific overrides if present
      if ($resolvedTheme && Object.keys($resolvedTheme).length > 0) {
        applyTheme(gridEl, $resolvedTheme);
      }
    }
  });

  // Inject font @import into document when it changes
  $effect(() => {
    const fontImport = $colors.fontImport;
    if (typeof document === 'undefined') return;

    const oldStyle = document.getElementById('theme-generator-font');
    if (oldStyle) oldStyle.remove();

    if (fontImport) {
      const style = document.createElement('style');
      style.id = 'theme-generator-font';
      style.textContent = fontImport;
      document.head.appendChild(style);
    }
  });

  let bgColor = $derived($colors.background);
  let textColor = $derived($colors.text);
</script>

<div class="space-y-4">
  <div>
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Live Preview</h3>
    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      Employee Grid with sorting, pagination, and inline editing
    </p>
  </div>

  <div
    class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-colors overflow-x-auto"
    style="background-color: {bgColor}"
  >
    {#if mounted}
      <div class="space-y-2">
        <h4 class="text-xs font-medium opacity-70" style="color: {textColor}">
          Click column headers to sort. Click cells to edit. Use arrow keys to navigate.
        </h4>
        <web-grid
          bind:this={gridEl}
          style="min-width: 900px; max-height: 400px;"
        ></web-grid>
      </div>
    {:else}
      <div class="space-y-2">
        <div class="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    {/if}
  </div>

  <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
    Preview background matches your selected background color
  </p>
</div>
