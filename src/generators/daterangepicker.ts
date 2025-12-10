import type { ThemeInput } from '../types';
import {
  getLightness,
  lighten,
  darken,
  mix,
} from '../color-utils';

/**
 * Generate theme overrides for @keenmate/web-daterangepicker
 *
 * Most variables are derived from --base-* in _variables.css, so this generator
 * only outputs variables that need special computed values beyond what the CSS
 * cascade provides.
 *
 * @param input - Base colors for theme generation
 * @returns Object containing CSS custom properties that need explicit values
 */
export function generateDaterangepickerTheme(input: ThemeInput): Record<string, string> {
  const { background, text } = input;
  const isDark = getLightness(background) < 50;

  // Derived values for special cases
  const textMuted = mix(text, background, 60);
  const bgActive = isDark ? lighten(background, 12) : darken(background, 8);

  return {
    // ========================================================================
    // SPECIAL COMPUTED VALUES
    // ========================================================================
    // These variables need explicit values because they differ from what
    // the CSS cascade would provide via --base-* → --drp-* references.

    // Active states (darker/lighter than hover)
    '--drp-header-bg-active': bgActive,
    '--drp-nav-bg-active': bgActive,
    '--drp-unified-range-bg-active': bgActive,

    // Other-month days get extra fading beyond --drp-text-secondary
    '--drp-day-other-month-color': mix(textMuted, background, 50),

    // Loading overlay adapts to dark/light theme
    '--drp-loading-overlay-background': isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)',

    // Shadow intensity varies by theme
    '--drp-shadow-xl': isDark
      ? '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)'
      : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  };
}
