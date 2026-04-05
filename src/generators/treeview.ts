import type { ThemeInput } from '../types';
import {
  getLightness,
  contrast,
} from '../color-utils';

/**
 * Generate theme overrides for @keenmate/web-treeview
 *
 * Most variables are derived from --base-* in _variables.css via var() cascade.
 * This generator only outputs variables that need special computed values
 * beyond what the CSS cascade provides.
 *
 * @param input - Base colors for theme generation
 * @returns Object containing CSS custom properties that need explicit values
 */
export function generateTreeviewTheme(input: ThemeInput): Record<string, string> {
  const { background, accent } = input;
  const isDark = getLightness(background) < 50;

  // Contrast-based text on accent (CSS can't detect this)
  const textOnAccent = contrast(accent);

  // Loading overlay needs theme-aware background
  const loadingBg = isDark
    ? 'rgba(0, 0, 0, 0.6)'
    : 'rgba(255, 255, 255, 0.8)';

  // Context menu shadow differs by theme brightness
  const contextMenuShadow = isDark
    ? '0 8px 16px rgba(0, 0, 0, 0.6)'
    : '0 2px 10px rgba(0, 0, 0, 0.1)';

  return {
    '--tv-text-color-on-accent': textOnAccent,
    '--tv-loading-bg': loadingBg,
    '--tv-context-menu-shadow': contextMenuShadow,
  };
}
