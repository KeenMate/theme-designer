/**
 * CSS variable groups for KeenMate component theming
 * Organized by component section for easier navigation
 */

import type { ComponentType, ComponentManifest } from '@keenmate/theme-designer';
import { getManifest } from '$lib/stores/theme';

export interface VariableGroup {
  name: string;
  expanded: boolean;
  variables: string[];
}

// =============================================================================
// MANIFEST-BASED GROUP GENERATION
// =============================================================================

/**
 * Get variable description from manifest
 * @param component - The component type
 * @param varName - The CSS variable name (with -- prefix)
 * @returns The usage description or null if not found
 */
export function getVariableDescription(component: ComponentType, varName: string): string | null {
  const manifest = getManifest(component);
  if (!manifest?.componentVariables) return null;

  // Strip the -- prefix for matching
  const name = varName.replace(/^--/, '');
  const variable = manifest.componentVariables.find(v => v.name === name);
  return variable?.usage ?? null;
}

/**
 * Format a category slug to a display name
 * e.g., "header" -> "Header", "context-menu" -> "Context Menu", "z-index" -> "Z-Index"
 */
function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate variable groups from a component manifest
 * Groups componentVariables by their category field
 */
export function generateGroupsFromManifest(manifest: ComponentManifest): VariableGroup[] {
  if (!manifest.componentVariables || manifest.componentVariables.length === 0) {
    return [];
  }

  // Group variables by category, preserving insertion order
  const categoryMap = new Map<string, string[]>();

  for (const variable of manifest.componentVariables) {
    const category = variable.category || 'other';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(`--${variable.name}`);
  }

  // Convert to VariableGroup array
  return Array.from(categoryMap.entries()).map(([category, variables], i) => ({
    name: formatCategoryName(category),
    expanded: i === 0, // First group expanded by default
    variables,
  }));
}

// =============================================================================
// MULTISELECT VARIABLE GROUPS
// =============================================================================

export const multiselectGroups: VariableGroup[] = [
  {
    name: 'Global Accent Colors',
    expanded: true,
    variables: [
      '--ms-accent-color',
      '--ms-accent-color-hover',
      '--ms-accent-color-active',
      '--ms-text-primary',
      '--ms-text-secondary',
      '--ms-text-on-accent',
      '--ms-primary-bg',
      '--ms-primary-bg-hover',
      '--ms-border-color',
    ],
  },
  {
    name: 'Input',
    expanded: false,
    variables: [
      '--ms-input-bg',
      '--ms-input-color',
      '--ms-input-border-style',
      '--ms-input-border-color-hover',
      '--ms-input-border-color-focus',
      '--ms-input-placeholder-color',
      '--ms-input-bg-disabled',
      '--ms-toggle-icon-color',
      '--ms-toggle-icon-color-open',
      '--ms-counter-badge-bg',
      '--ms-counter-badge-color',
      '--ms-counter-badge-bg-hover',
    ],
  },
  {
    name: 'Dropdown',
    expanded: false,
    variables: [
      '--ms-dropdown-bg',
      '--ms-dropdown-text-color',
      '--ms-dropdown-border',
      '--ms-dropdown-box-shadow',
    ],
  },
  {
    name: 'Options - Default',
    expanded: false,
    variables: [
      '--ms-option-bg',
      '--ms-option-text-color',
      '--ms-option-title-color',
      '--ms-option-subtitle-color',
    ],
  },
  {
    name: 'Options - Hover',
    expanded: false,
    variables: [
      '--ms-option-bg-hover',
      '--ms-option-color-hover',
      '--ms-option-subtitle-color-hover',
    ],
  },
  {
    name: 'Options - Focused',
    expanded: false,
    variables: [
      '--ms-option-bg-focused',
      '--ms-option-color-focused',
      '--ms-option-outline-focused',
      '--ms-option-bg-focused-hover',
      '--ms-option-color-focused-hover',
    ],
  },
  {
    name: 'Options - Matched',
    expanded: false,
    variables: [
      '--ms-option-bg-matched',
      '--ms-option-color-matched',
      '--ms-option-border-matched',
      '--ms-option-bg-matched-hover',
      '--ms-option-color-matched-hover',
      '--ms-option-mark-bg',
      '--ms-option-mark-color',
    ],
  },
  {
    name: 'Options - Selected',
    expanded: false,
    variables: [
      '--ms-option-bg-selected',
      '--ms-option-title-color-selected',
      '--ms-option-title-color-selected-hover',
      '--ms-option-subtitle-color-selected',
      '--ms-option-subtitle-color-selected-hover',
      '--ms-option-bg-selected-hover',
      '--ms-option-bg-selected-focused',
      '--ms-option-bg-selected-matched',
    ],
  },
  {
    name: 'Options - Disabled',
    expanded: false,
    variables: [
      '--ms-option-bg-disabled-selected',
    ],
  },
  {
    name: 'Checkboxes',
    expanded: false,
    variables: [
      '--ms-checkbox-bg',
      '--ms-checkbox-border',
      '--ms-checkbox-hover-border-color',
      '--ms-checkbox-checked-bg',
      '--ms-checkbox-checked-border',
      '--ms-checkbox-checkmark-color',
      '--ms-checkbox-checked-bg-hover',
      '--ms-checkbox-checked-border-color-hover',
      '--ms-checkbox-disabled-bg',
      '--ms-checkbox-disabled-border',
    ],
  },
  {
    name: 'Groups',
    expanded: false,
    variables: [
      '--ms-group-border-top',
      '--ms-group-label-color',
    ],
  },
  {
    name: 'Actions (Select All / Clear All)',
    expanded: false,
    variables: [
      '--ms-actions-bg',
      '--ms-action-button-bg',
      '--ms-action-button-color',
      '--ms-action-btn-border',
      '--ms-action-button-bg-hover',
      '--ms-action-button-border-color-hover',
    ],
  },
  {
    name: 'Badges - Selection',
    expanded: false,
    variables: [
      '--ms-badge-text-bg',
      '--ms-badge-text-color',
      '--ms-badge-text-bg-hover',
      '--ms-badge-text-color-hover',
      '--ms-badge-text-border',
      '--ms-badge-remove-bg',
      '--ms-badge-remove-color',
      '--ms-badge-remove-border',
      '--ms-badge-remove-bg-hover',
    ],
  },
  {
    name: 'Badges - Counter Variant',
    expanded: false,
    variables: [
      '--ms-badge-counter-border',
      '--ms-badge-counter-text-bg',
      '--ms-badge-counter-text-color',
      '--ms-badge-counter-remove-bg',
      '--ms-badge-counter-remove-color',
      '--ms-badge-counter-remove-bg-hover',
    ],
  },
  {
    name: 'Badges - More Badge',
    expanded: false,
    variables: [
      '--ms-more-badge-bg',
      '--ms-more-badge-hover-bg',
      '--ms-more-badge-active-bg',
    ],
  },
  {
    name: 'Count Display Mode',
    expanded: false,
    variables: [
      '--ms-counter-wrapper-bg',
      '--ms-counter-wrapper-border',
      '--ms-counter-wrapper-bg-hover',
      '--ms-counter-wrapper-border-color-hover',
      '--ms-count-text-color',
      '--ms-count-text-bg',
      '--ms-count-clear-bg',
      '--ms-count-clear-color',
      '--ms-count-clear-bg-hover',
      '--ms-count-clear-color-hover',
    ],
  },
  {
    name: 'Tooltip',
    expanded: false,
    variables: [
      '--ms-tooltip-bg',
      '--ms-tooltip-text-color',
    ],
  },
  {
    name: 'Selected Popover',
    expanded: false,
    variables: [
      '--ms-selected-popover-bg',
      '--ms-selected-popover-border',
      '--ms-selected-popover-box-shadow',
      '--ms-selected-popover-header-bg',
      '--ms-selected-popover-header-color',
      '--ms-selected-popover-header-border-bottom',
      '--ms-selected-popover-close-bg',
      '--ms-selected-popover-close-color',
      '--ms-selected-popover-close-bg-hover',
      '--ms-selected-popover-close-color-hover',
    ],
  },
  {
    name: 'Scrollbar',
    expanded: false,
    variables: [
      '--ms-scrollbar-track-bg',
      '--ms-scrollbar-thumb-bg',
      '--ms-scrollbar-thumb-bg-hover',
    ],
  },
  {
    name: 'Empty & Loading States',
    expanded: false,
    variables: [
      '--ms-empty-color',
      '--ms-loading-color',
    ],
  },
  {
    name: 'Floating Hint',
    expanded: false,
    variables: [
      '--ms-hint-bg',
      '--ms-hint-border',
      '--ms-hint-color',
    ],
  },
];

// =============================================================================
// DATERANGEPICKER VARIABLE GROUPS
// =============================================================================

export const daterangepickerGroups: VariableGroup[] = [
  {
    name: 'Global Colors',
    expanded: true,
    variables: [
      '--drp-accent-color',
      '--drp-accent-color-hover',
      '--drp-text-primary',
      '--drp-text-secondary',
      '--drp-text-on-accent',
      '--drp-primary-bg',
      '--drp-primary-bg-hover',
      '--drp-border-color',
      '--drp-dropdown-bg',
    ],
  },
  {
    name: 'Input',
    expanded: false,
    variables: [
      '--drp-input-bg',
      '--drp-input-color',
      '--drp-input-border',
      '--drp-input-border-hover',
      '--drp-input-border-focus',
      '--drp-input-placeholder-color',
      '--drp-input-bg-disabled',
      '--drp-input-focus-shadow-color',
    ],
  },
  {
    name: 'Header & Navigation',
    expanded: false,
    variables: [
      '--drp-header-text-color',
      '--drp-header-bg-hover',
      '--drp-header-bg-active',
      '--drp-nav-text-color',
      '--drp-nav-border-color',
      '--drp-nav-bg-hover',
      '--drp-nav-bg-active',
      '--drp-nav-border-hover',
    ],
  },
  {
    name: 'Rolling Selector',
    expanded: false,
    variables: [
      '--drp-rolling-bg',
      '--drp-rolling-border-color',
      '--drp-rolling-scrollbar-thumb',
      '--drp-rolling-scrollbar-thumb-hover',
      '--drp-rolling-item-bg-hover',
      '--drp-rolling-item-color',
      '--drp-rolling-item-bg-selected',
      '--drp-rolling-item-color-selected',
      '--drp-rolling-item-bg-selected-hover',
    ],
  },
  {
    name: 'Calendar Days - Default',
    expanded: false,
    variables: [
      '--drp-weekday-color',
      '--drp-day-text-color',
      '--drp-day-border-color',
      '--drp-day-other-month-color',
      '--drp-day-disabled-color',
    ],
  },
  {
    name: 'Calendar Days - Hover',
    expanded: false,
    variables: [
      '--drp-day-bg-hover',
      '--drp-day-border-hover',
    ],
  },
  {
    name: 'Calendar Days - Selected & Range',
    expanded: false,
    variables: [
      '--drp-day-today-border',
      '--drp-day-selected-bg',
      '--drp-day-selected-color',
      '--drp-day-selected-bg-hover',
      '--drp-day-focused-outline',
      '--drp-day-range-bg',
      '--drp-day-range-color',
    ],
  },
  {
    name: 'Calendar Days - Drag Preview',
    expanded: false,
    variables: [
      '--drp-day-drag-invalid-bg',
    ],
  },
  {
    name: 'Calendar Days - Special',
    expanded: false,
    variables: [
      '--drp-holiday-color',
      '--drp-event-color',
    ],
  },
  {
    name: 'Summary & Actions',
    expanded: false,
    variables: [
      '--drp-summary-text-color',
      '--drp-summary-border-color',
      '--drp-summary-count-color',
      '--drp-button-border-color',
      '--drp-button-bg',
      '--drp-button-bg-hover',
      '--drp-button-color',
      '--drp-button-border-hover',
      '--drp-button-today-color',
      '--drp-button-clear-color',
      '--drp-button-cancel-color',
      '--drp-button-apply-bg',
      '--drp-button-apply-color',
      '--drp-button-apply-border',
      '--drp-button-apply-bg-hover',
    ],
  },
  {
    name: 'Badges',
    expanded: false,
    variables: [
      '--drp-badge-number-bg',
      '--drp-badge-number-color',
      '--drp-badge-count-bg',
      '--drp-badge-count-color',
      '--drp-badge-text-bg',
      '--drp-badge-text-color',
    ],
  },
  {
    name: 'Unified Navigation',
    expanded: false,
    variables: [
      '--drp-unified-range-text-color',
      '--drp-unified-range-bg-hover',
      '--drp-unified-range-bg-active',
      '--drp-unified-month-color',
      '--drp-unified-rolling-disabled-color',
    ],
  },
  {
    name: 'Tooltip',
    expanded: false,
    variables: [
      '--drp-tooltip-bg',
      '--drp-tooltip-text-color',
    ],
  },
  {
    name: 'Loading',
    expanded: false,
    variables: [
      '--drp-loading-overlay-bg',
      '--drp-loading-spinner-color',
      '--drp-loading-spinner-accent',
    ],
  },
  {
    name: 'Effects',
    expanded: false,
    variables: [
      '--drp-shadow-xl',
    ],
  },
];

// =============================================================================
// COMPONENT GROUPS MAP
// =============================================================================

/**
 * Get variable groups for a specific component
 * Prefers manifest-based groups when available, falls back to hardcoded groups
 */
export function getVariableGroups(component: ComponentType): VariableGroup[] {
  // Try to generate groups from manifest first
  const manifest = getManifest(component);
  if (manifest) {
    const manifestGroups = generateGroupsFromManifest(manifest);
    if (manifestGroups.length > 0) {
      return manifestGroups;
    }
  }

  // Fall back to hardcoded groups
  switch (component) {
    case 'web-multiselect':
      return multiselectGroups;
    case 'web-daterangepicker':
      return daterangepickerGroups;
    default:
      return [];
  }
}

// Keep the old export for backwards compatibility
export const variableGroups = multiselectGroups;

/**
 * Helper to check if a variable value is a color (vs a border style, shadow, etc.)
 */
export function isColorVariable(varName: string, value: string): boolean {
  // Variables that are not pure colors
  const nonColorPatterns = [
    '-border-style',
    '-border',
    '-box-shadow',
    '-outline',
  ];

  // Check if the variable name suggests it's not a color
  if (nonColorPatterns.some((pattern) => varName.includes(pattern))) {
    return false;
  }

  // Check if value looks like a color
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
    return true;
  }

  // "transparent" is a color
  if (value === 'transparent') {
    return true;
  }

  return false;
}

/**
 * Extract the color from a complex value like "1px solid #333333"
 */
export function extractColor(value: string): string | null {
  // Match hex colors
  const hexMatch = value.match(/#[0-9a-fA-F]{3,8}/);
  if (hexMatch) return hexMatch[0];

  // Match rgb/rgba
  const rgbMatch = value.match(/rgba?\([^)]+\)/);
  if (rgbMatch) return rgbMatch[0];

  // Match hsl/hsla
  const hslMatch = value.match(/hsla?\([^)]+\)/);
  if (hslMatch) return hslMatch[0];

  // Check for transparent
  if (value.includes('transparent')) return 'transparent';

  return null;
}
