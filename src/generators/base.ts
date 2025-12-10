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

  // Text color levels (FluentUI-style hierarchy)
  const textLevel1 = text; // Full contrast - headers, titles
  const textLevel2 = mix(text, background, 85); // Body text, labels
  const textLevel3 = mix(text, background, 60); // Secondary content, subtitles
  const textLevel4 = mix(text, background, 40); // Hints, placeholders, captions
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

    // Text color levels (FluentUI-style hierarchy)
    '--base-text-color-1': textLevel1,
    '--base-text-color-2': textLevel2,
    '--base-text-color-3': textLevel3,
    '--base-text-color-4': textLevel4,
    '--base-text-on-accent': textOnAccent,

    // Border
    '--base-border-color': border,

    // Input field colors (same as base for most cases)
    '--base-input-background': background,
    '--base-input-color': textLevel1,
    '--base-input-border': `1px solid ${border}`,
    '--base-input-border-hover': `1px solid ${isDark ? lighten(border, 10) : darken(border, 10)}`,
    '--base-input-border-focus': `1px solid ${accent}`,
    '--base-input-placeholder-color': textLevel4,
    '--base-input-background-disabled': disabledBg,

    // Dropdown/popover colors
    '--base-dropdown-background': background,
    '--base-dropdown-border': `1px solid ${border}`,
    '--base-dropdown-box-shadow': boxShadow,

    // Tooltip colors
    '--base-tooltip-background': isDark ? lighten(background, 20) : '#333333',
    '--base-tooltip-text-color': isDark ? textLevel1 : '#ffffff',

    // Typography - Font Family
    '--base-font-family': input.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    // Typography - Font Sizes (unitless multipliers for calc with --*-rem)
    '--base-font-size-2xs': '1',
    '--base-font-size-xs': '1.2',
    '--base-font-size-sm': '1.4',
    '--base-font-size-base': '1.6',
    '--base-font-size-lg': '1.8',
    '--base-font-size-xl': '2',
    '--base-font-size-2xl': '2.4',

    // Typography - Font Weights
    '--base-font-weight-normal': '400',
    '--base-font-weight-medium': '500',
    '--base-font-weight-semibold': '600',

    // Typography - Line Heights
    '--base-line-height-tight': '1.25',
    '--base-line-height-normal': '1.5',
    '--base-line-height-relaxed': '1.75',

    // Border Radius (unitless multipliers for calc with --*-rem)
    '--base-border-radius-sm': '0.4',
    '--base-border-radius-md': '0.6',
    '--base-border-radius-lg': '0.8',

    // Input Size Heights (unitless multipliers for calc with --*-rem)
    // Standardized across all KeenMate components for consistent input sizing
    '--base-input-size-xs-height': '3.1',  // 31px at 10px rem
    '--base-input-size-sm-height': '3.3',  // 33px at 10px rem
    '--base-input-size-md-height': '3.5',  // 35px at 10px rem
    '--base-input-size-lg-height': '3.8',  // 38px at 10px rem
    '--base-input-size-xl-height': '4.1',  // 41px at 10px rem
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
