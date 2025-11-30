import type { ThemeInput } from '../types';
import {
  getLightness,
  lighten,
  darken,
  alpha,
  contrast,
  mix,
} from '../color-utils';

/**
 * Generate the base layer theme (--base-* variables)
 *
 * This layer contains the derived values from the 3 input colors.
 * All components can reference these base values for consistency.
 *
 * @param input - Base colors for theme generation
 * @returns Object containing all --base-* CSS custom properties
 */
export function generateBaseTheme(input: ThemeInput): Record<string, string> {
  const { background, text, accent } = input;
  const isDark = getLightness(background) < 50;

  // ==========================================================================
  // DERIVED COLORS
  // ==========================================================================

  // Background variations
  const bgHover = isDark ? lighten(background, 8) : darken(background, 5);

  // Border color (derived from background)
  const border = isDark ? lighten(background, 15) : darken(background, 12);

  // Text variations
  const textMuted = mix(text, background, 60);
  const textOnAccent = contrast(accent);

  // Accent variations
  const accentHover = isDark ? lighten(accent, 10) : darken(accent, 10);
  const accentActive = isDark ? lighten(accent, 15) : darken(accent, 15);

  // Disabled colors
  const disabledBg = isDark ? alpha(text, 0.05) : alpha(text, 0.03);

  // Shadow
  const boxShadow = isDark
    ? '0 8px 16px rgba(0, 0, 0, 0.6)'
    : '0 8px 16px rgba(0, 0, 0, 0.15)';

  // ==========================================================================
  // GENERATE BASE THEME
  // ==========================================================================

  return {
    // Core accent colors
    '--base-accent-color': accent,
    '--base-accent-color-hover': accentHover,
    '--base-accent-color-active': accentActive,

    // Background colors
    '--base-primary-bg': background,
    '--base-primary-bg-hover': bgHover,

    // Text colors
    '--base-text-primary': text,
    '--base-text-secondary': textMuted,
    '--base-text-on-accent': textOnAccent,

    // Border
    '--base-border-color': border,

    // Input field colors (same as base for most cases)
    '--base-input-background': background,
    '--base-input-color': text,
    '--base-input-border-color-hover': isDark
      ? lighten(border, 10)
      : darken(border, 10),
    '--base-input-border-color-focus': accent,
    '--base-input-placeholder-color': textMuted,
    '--base-input-background-disabled': disabledBg,

    // Dropdown/popover colors
    '--base-dropdown-background': background,
    '--base-dropdown-border': `1px solid ${border}`,
    '--base-dropdown-box-shadow': boxShadow,

    // Tooltip colors
    '--base-tooltip-background': isDark ? lighten(background, 20) : '#333333',
    '--base-tooltip-text-color': isDark ? text : '#ffffff',
  };
}

/**
 * Map a base theme to component-specific var() references
 *
 * @param prefix - Component prefix (e.g., 'ms', 'drp')
 * @param baseTheme - The generated base theme
 * @returns Object with component variables referencing base variables
 */
export function mapBaseToComponent(
  prefix: string,
  baseTheme: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [baseVar] of Object.entries(baseTheme)) {
    // Convert --base-accent-color to --ms-accent-color with var(--base-accent-color)
    const suffix = baseVar.replace('--base-', '');
    const componentVar = `--${prefix}-${suffix}`;
    result[componentVar] = `var(${baseVar})`;
  }

  return result;
}

/**
 * Map a base theme to component-specific resolved values
 *
 * @param prefix - Component prefix (e.g., 'ms', 'drp')
 * @param baseTheme - The generated base theme
 * @returns Object with component variables containing resolved values
 */
export function mapBaseToComponentResolved(
  prefix: string,
  baseTheme: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [baseVar, value] of Object.entries(baseTheme)) {
    // Convert --base-accent-color to --ms-accent-color with the actual value
    const suffix = baseVar.replace('--base-', '');
    const componentVar = `--${prefix}-${suffix}`;
    result[componentVar] = value;
  }

  return result;
}
