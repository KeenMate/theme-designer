/**
 * Tier 1 Variables - Unified naming convention across all KeenMate components
 *
 * These variables MUST have identical semantic meaning across all components.
 * Each component uses its own prefix (--ms-*, --drp-*, etc.) but the variable
 * names after the prefix are standardized.
 *
 * Example:
 * - --ms-accent-color (multiselect)
 * - --drp-accent-color (daterangepicker)
 * Both represent the primary brand/action color.
 */

/**
 * Tier 1 variable names (without prefix)
 * These are the standardized variable suffixes that all components must implement
 */
export const TIER1_VARIABLES = [
  // Core accent colors
  'accent-color', // Primary brand/action color
  'accent-color-hover', // Hover state of accent
  'accent-color-active', // Active/pressed state of accent

  // Background colors
  'primary-bg', // Main background color
  'primary-bg-hover', // Hover background

  // Text colors
  'text-primary', // Main text color
  'text-secondary', // Muted/secondary text
  'text-color-on-accent', // Text on accent backgrounds (contrasting)

  // Border
  'border-color', // Standard border color

  // Input field colors
  'input-bg', // Input field background
  'input-color', // Input text color
  'input-border-color-hover', // Input border on hover
  'input-border-color-focus', // Input border on focus
  'input-placeholder-color', // Placeholder text color
  'input-bg-disabled', // Disabled input background

  // Dropdown/popover colors
  'dropdown-bg', // Dropdown/popover background
  'dropdown-border', // Dropdown border (e.g., "1px solid #ccc")
  'dropdown-box-shadow', // Dropdown shadow

  // Tooltip colors
  'tooltip-bg', // Tooltip background
  'tooltip-text-color', // Tooltip text
] as const;

export type Tier1Variable = (typeof TIER1_VARIABLES)[number];

/**
 * Component prefixes for each supported component
 */
export const COMPONENT_PREFIXES = {
  'web-multiselect': 'ms',
  'web-daterangepicker': 'drp',
  'web-treeview': 'tv',
} as const;

export type ComponentType = keyof typeof COMPONENT_PREFIXES;
export type ComponentPrefix = (typeof COMPONENT_PREFIXES)[ComponentType];

/**
 * Get the full CSS variable name for a Tier 1 variable
 */
export function getTier1VarName(
  component: ComponentType,
  variable: Tier1Variable
): string {
  const prefix = COMPONENT_PREFIXES[component];
  return `--${prefix}-${variable}`;
}

/**
 * Get the base layer variable name (--base-*)
 */
export function getBaseVarName(variable: Tier1Variable): string {
  return `--base-${variable}`;
}

/**
 * Check if a variable name is a Tier 1 variable
 */
export function isTier1Variable(varName: string): boolean {
  // Extract the suffix after the prefix (e.g., "--ms-accent-color" -> "accent-color")
  const match = varName.match(/^--(?:ms|drp|tv|base)-(.+)$/);
  if (!match) return false;
  return TIER1_VARIABLES.includes(match[1] as Tier1Variable);
}

/**
 * Extract the variable suffix from a full CSS variable name
 */
export function extractVariableSuffix(varName: string): string | null {
  const match = varName.match(/^--(?:ms|drp|tv|base)-(.+)$/);
  return match ? match[1] : null;
}
