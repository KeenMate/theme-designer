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
 * Generate a complete theme for @keenmate/web-daterangepicker
 * Covers all themeable CSS custom properties
 * @param input - Base colors for theme generation
 * @returns Object containing all CSS custom properties
 */
export function generateDaterangepickerTheme(input: ThemeInput): Record<string, string> {
  const { background, text, accent } = input;
  const isDark = getLightness(background) < 50;

  // ==========================================================================
  // DERIVED COLORS (same calculation as multiselect for consistency)
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

  // Disabled colors
  const disabledBg = isDark ? alpha(text, 0.05) : alpha(text, 0.03);

  // ==========================================================================
  // GENERATE THEME OBJECT
  // ==========================================================================

  return {
    // ========================================================================
    // TIER 1 - GLOBAL COLORS (unified naming with multiselect)
    // ========================================================================
    '--drp-accent-color': accent,
    '--drp-accent-color-hover': accentHover,
    '--drp-text-primary': text,
    '--drp-text-secondary': textMuted,
    '--drp-text-on-accent': textOnAccent,
    '--drp-primary-bg': background,
    '--drp-primary-bg-hover': bgHover,
    '--drp-border-color': border,
    '--drp-dropdown-background': background,

    // ========================================================================
    // TIER 1 - INPUT (unified naming)
    // ========================================================================
    '--drp-input-background': background,
    '--drp-input-color': text,
    '--drp-input-border-color': border,
    '--drp-input-border-color-hover': accent,
    '--drp-input-border-color-focus': accent,
    '--drp-input-placeholder-color': textMuted,
    '--drp-input-background-disabled': disabledBg,

    // ========================================================================
    // TIER 1 - TOOLTIP (unified naming)
    // ========================================================================
    '--drp-tooltip-background': isDark ? lighten(background, 20) : '#333333',
    '--drp-tooltip-text-color': isDark ? text : '#ffffff',

    // ========================================================================
    // TIER 2 - DATERANGEPICKER SPECIFIC
    // ========================================================================

    // Button text
    '--drp-button-text-color': textOnAccent,

    // Header & Navigation
    '--drp-header-text-color': text,
    '--drp-header-bg-hover': bgHover,
    '--drp-header-bg-active': isDark ? lighten(background, 12) : darken(background, 8),

    '--drp-nav-text-color': text,
    '--drp-nav-border-color': border,
    '--drp-nav-bg-hover': bgHover,
    '--drp-nav-bg-active': isDark ? lighten(background, 12) : darken(background, 8),
    '--drp-nav-border-hover': accent,

    // Rolling selector
    '--drp-rolling-bg': bgHover,
    '--drp-rolling-border-color': border,
    '--drp-rolling-scrollbar-thumb': border,
    '--drp-rolling-scrollbar-thumb-hover': accent,
    '--drp-rolling-item-bg-hover': bgHover,
    '--drp-rolling-item-bg-selected': accent,
    '--drp-rolling-item-color-selected': textOnAccent,
    '--drp-rolling-item-bg-selected-hover': accentHover,

    // Weekday header
    '--drp-weekday-color': textMuted,

    // Day cells
    '--drp-day-text-color': text,
    '--drp-day-bg-hover': bgHover,
    '--drp-day-border-hover': accent,
    '--drp-day-today-border': accent,
    '--drp-day-selected-bg': accent,
    '--drp-day-selected-color': textOnAccent,
    '--drp-day-selected-bg-hover': accentHover,
    '--drp-day-focused-outline': accent,
    '--drp-day-disabled-color': textMuted,
    '--drp-day-other-month-color': mix(textMuted, background, 50),
    '--drp-day-range-bg': accent,
    '--drp-day-range-color': textOnAccent,

    // Summary & Actions
    '--drp-summary-text-color': textMuted,
    '--drp-summary-border-color': border,
    '--drp-summary-count-color': accent,

    '--drp-button-border-color': border,
    '--drp-button-bg-hover': bgHover,
    '--drp-button-border-hover': accent,
    '--drp-button-today-color': accent,
    '--drp-button-clear-color': textMuted,
    '--drp-button-cancel-color': textMuted,
    '--drp-button-apply-bg': accent,
    '--drp-button-apply-color': textOnAccent,
    '--drp-button-apply-border': accent,
    '--drp-button-apply-bg-hover': accentHover,

    // Badges
    '--drp-badge-number-bg': accent,
    '--drp-badge-number-color': textOnAccent,
    '--drp-badge-count-bg': '#ef4444', // Error/red color
    '--drp-badge-count-color': '#ffffff',
    '--drp-badge-text-bg': textMuted,
    '--drp-badge-text-color': '#ffffff',

    // Unified nav (multi-month mode)
    '--drp-unified-range-text-color': text,
    '--drp-unified-range-bg-hover': bgHover,
    '--drp-unified-range-bg-active': isDark ? lighten(background, 12) : darken(background, 8),
    '--drp-unified-month-color': textMuted,
    '--drp-unified-rolling-disabled-color': textMuted,

    // Other properties
    '--drp-shadow-xl': isDark
      ? '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)'
      : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  };
}
