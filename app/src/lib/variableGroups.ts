/**
 * CSS variable groups for KeenMate component theming
 * Organized by component section for easier navigation
 */

import type { ComponentType } from '@keenmate/theme-designer';

export interface VariableGroup {
  name: string;
  expanded: boolean;
  variables: string[];
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
      '--ms-input-background',
      '--ms-input-color',
      '--ms-input-border-style',
      '--ms-input-border-color-hover',
      '--ms-input-border-color-focus',
      '--ms-input-placeholder-color',
      '--ms-input-background-disabled',
      '--ms-toggle-icon-color',
      '--ms-toggle-icon-color-open',
      '--ms-counter-badge-background',
      '--ms-counter-badge-color',
      '--ms-counter-badge-background-hover',
    ],
  },
  {
    name: 'Dropdown',
    expanded: false,
    variables: [
      '--ms-dropdown-background',
      '--ms-dropdown-text-color',
      '--ms-dropdown-border',
      '--ms-dropdown-box-shadow',
    ],
  },
  {
    name: 'Options - Default',
    expanded: false,
    variables: [
      '--ms-option-background',
      '--ms-option-text-color',
      '--ms-option-title-color',
      '--ms-option-subtitle-color',
    ],
  },
  {
    name: 'Options - Hover',
    expanded: false,
    variables: [
      '--ms-option-background-hover',
      '--ms-option-color-hover',
      '--ms-option-subtitle-color-hover',
    ],
  },
  {
    name: 'Options - Focused',
    expanded: false,
    variables: [
      '--ms-option-background-focused',
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
      '--ms-option-background-matched',
      '--ms-option-color-matched',
      '--ms-option-border-matched',
      '--ms-option-bg-matched-hover',
      '--ms-option-color-matched-hover',
      '--ms-option-mark-background',
      '--ms-option-mark-color',
    ],
  },
  {
    name: 'Options - Selected',
    expanded: false,
    variables: [
      '--ms-option-background-selected',
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
      '--ms-actions-background',
      '--ms-action-button-background',
      '--ms-action-button-color',
      '--ms-action-btn-border',
      '--ms-action-button-background-hover',
      '--ms-action-button-border-color-hover',
    ],
  },
  {
    name: 'Badges - Selection',
    expanded: false,
    variables: [
      '--ms-badge-text-background',
      '--ms-badge-text-color',
      '--ms-badge-text-background-hover',
      '--ms-badge-text-color-hover',
      '--ms-badge-text-border',
      '--ms-badge-remove-background',
      '--ms-badge-remove-color',
      '--ms-badge-remove-border',
      '--ms-badge-remove-background-hover',
    ],
  },
  {
    name: 'Badges - Counter Variant',
    expanded: false,
    variables: [
      '--ms-badge-counter-border',
      '--ms-badge-counter-text-background',
      '--ms-badge-counter-text-color',
      '--ms-badge-counter-remove-background',
      '--ms-badge-counter-remove-color',
      '--ms-badge-counter-remove-background-hover',
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
      '--ms-counter-wrapper-background',
      '--ms-counter-wrapper-border',
      '--ms-counter-wrapper-background-hover',
      '--ms-counter-wrapper-border-color-hover',
      '--ms-count-text-color',
      '--ms-count-text-bg',
      '--ms-count-clear-background',
      '--ms-count-clear-color',
      '--ms-count-clear-background-hover',
      '--ms-count-clear-color-hover',
    ],
  },
  {
    name: 'Tooltip',
    expanded: false,
    variables: [
      '--ms-tooltip-background',
      '--ms-tooltip-text-color',
    ],
  },
  {
    name: 'Selected Popover',
    expanded: false,
    variables: [
      '--ms-selected-popover-background',
      '--ms-selected-popover-border',
      '--ms-selected-popover-box-shadow',
      '--ms-selected-popover-header-background',
      '--ms-selected-popover-header-color',
      '--ms-selected-popover-header-border-bottom',
      '--ms-selected-popover-close-background',
      '--ms-selected-popover-close-color',
      '--ms-selected-popover-close-background-hover',
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
      '--ms-hint-background',
      '--ms-hint-border',
      '--ms-hint-color',
    ],
  },
];

// =============================================================================
// DATERANGEPICKER VARIABLE GROUPS
// =============================================================================

export const daterangepickerGroups: VariableGroup[] = [
  // Note: Most --drp-* variables are derived from --base-* in CSS.
  // Only variables with special computed values are shown here.
  // To customize colors, use the Base Colors panel which affects all components.
  {
    name: 'Active States',
    expanded: true,
    variables: [
      '--drp-header-bg-active',
      '--drp-nav-bg-active',
      '--drp-unified-range-bg-active',
    ],
  },
  {
    name: 'Special Colors',
    expanded: true,
    variables: [
      '--drp-day-other-month-color',
      '--drp-loading-overlay-background',
    ],
  },
  {
    name: 'Effects',
    expanded: true,
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
 */
export function getVariableGroups(component: ComponentType): VariableGroup[] {
  switch (component) {
    case 'web-multiselect':
      return multiselectGroups;
    case 'web-daterangepicker':
      return daterangepickerGroups;
    default:
      return multiselectGroups;
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
