import type { ThemeInput } from '../types';
import {
  getLightness,
  lighten,
  darken,
  contrast,
} from '../color-utils';

/**
 * Generate theme overrides for @keenmate/web-multiselect
 *
 * Most variables are derived from --base-* in _variables.css via var() cascade
 * and color-mix() for opacity calculations. This generator only outputs variables
 * that need special computed values beyond what CSS can derive.
 *
 * @param input - Base colors for theme generation
 * @returns Object containing CSS custom properties that need explicit values
 */
export function generateMultiselectTheme(input: ThemeInput): Record<string, string> {
  const { background, accent } = input;
  const isDark = getLightness(background) < 50;

  // ==========================================================================
  // DERIVED COLORS (only those CSS can't compute)
  // ==========================================================================

  // Contrast-based text on accent (CSS can't detect this)
  const textOnAccent = contrast(accent);
  // Subtitle on accent - lighter/muted version for visual hierarchy
  // White text -> light gray (#dbdbdb), Black text -> dark gray (#4a4a4a)
  const subtitleOnAccent = textOnAccent === '#ffffff' ? '#dbdbdb' : '#4a4a4a';

  // Scrollbar colors (dark/light specific)
  const scrollbarThumb = isDark ? lighten(background, 15) : darken(background, 12);
  const scrollbarThumbHover = isDark ? lighten(background, 25) : darken(background, 20);

  // ==========================================================================
  // GENERATE THEME OBJECT
  // ==========================================================================
  // Only output values that CSS var() cascade and color-mix() cannot derive

  return {
    // ========================================================================
    // SPECIAL COMPUTED VALUES
    // ========================================================================
    // These variables need explicit values because CSS cannot compute them.

    // Option content - subtitle color on selected state (contrast-based)
    '--ms-option-subtitle-color-selected': subtitleOnAccent,
    '--ms-option-subtitle-color-selected-hover': subtitleOnAccent,

    // Box shadow (dark/light specific intensity)
    '--ms-selected-popover-box-shadow': isDark
      ? '0 8px 16px rgba(0, 0, 0, 0.6)'
      : '0 8px 16px rgba(0, 0, 0, 0.15)',

    // Scrollbar (dark/light specific - cannot be derived via CSS cascade)
    '--ms-scrollbar-thumb-bg': scrollbarThumb,
    '--ms-scrollbar-thumb-bg-hover': scrollbarThumbHover,
  };
}
