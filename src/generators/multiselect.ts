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
 * Generate a complete theme for @keenmate/web-multiselect
 * Covers all states defined in THEMING.md
 * @param input - Base colors for theme generation
 * @returns Object containing all CSS custom properties
 */
export function generateMultiselectTheme(input: ThemeInput): Record<string, string> {
  const { background, text, accent } = input;
  const isDark = getLightness(background) < 50;

  // ==========================================================================
  // DERIVED COLORS
  // ==========================================================================

  // Background variations
  const bgHover = isDark ? lighten(background, 8) : darken(background, 5);

  // Border color (derived from background)
  const border = isDark ? lighten(background, 15) : darken(background, 12);
  const borderLight = isDark ? lighten(background, 10) : darken(background, 8);

  // Text variations
  const textMuted = mix(text, background, 60);
  const textOnAccent = contrast(accent);
  // Subtitle on accent - lighter/muted version for visual hierarchy
  // White text -> light gray (#dbdbdb), Black text -> dark gray (#4a4a4a)
  const subtitleOnAccent = textOnAccent === '#ffffff' ? '#dbdbdb' : '#4a4a4a';

  // Accent variations
  const accentHover = isDark ? lighten(accent, 10) : darken(accent, 10);
  const accentActive = isDark ? lighten(accent, 15) : darken(accent, 15);
  const accentLight = alpha(accent, 0.15);
  const accentMedium = alpha(accent, 0.3);
  const accentSubtle = alpha(accent, 0.08);

  // Selected state variations (for combined states)
  const selectedBg = accent;
  const selectedBgHover = accentHover;
  const selectedBgFocused = isDark ? lighten(accent, 5) : darken(accent, 5);
  const selectedBgMatched = isDark ? lighten(accent, 8) : darken(accent, 8);

  // Matched state background
  const matchedBg = accentSubtle;
  const matchedBgHover = isDark ? alpha(accent, 0.12) : alpha(accent, 0.1);

  // Focused state background
  const focusedBg = bgHover;
  const focusedBgHover = isDark ? lighten(background, 12) : darken(background, 8);

  // Disabled colors
  const disabledBg = isDark ? alpha(text, 0.05) : alpha(text, 0.03);
  const disabledSelectedBg = isDark ? alpha(accent, 0.3) : alpha(accent, 0.4);

  // ==========================================================================
  // GENERATE THEME OBJECT
  // ==========================================================================

  return {
    // ========================================================================
    // GLOBAL ACCENT COLORS
    // ========================================================================
    '--ms-accent-color': accent,
    '--ms-accent-color-hover': accentHover,
    '--ms-accent-color-active': accentActive,
    '--ms-text-primary': text,
    '--ms-text-secondary': textMuted,
    '--ms-text-on-accent': textOnAccent,
    '--ms-primary-bg': background,
    '--ms-primary-bg-hover': bgHover,
    '--ms-border-color': border,

    // ========================================================================
    // INPUT
    // ========================================================================
    '--ms-input-background': background,
    '--ms-input-color': text,
    '--ms-input-border-style': `1px solid ${border}`,
    '--ms-input-border-color-hover': isDark ? lighten(border, 10) : darken(border, 10),
    '--ms-input-border-color-focus': accent,
    '--ms-input-placeholder-color': textMuted,
    '--ms-input-background-disabled': disabledBg,

    // Toggle icon
    '--ms-toggle-icon-color': textMuted,
    '--ms-toggle-icon-color-open': textMuted,

    // Counter badge (in input)
    '--ms-counter-badge-background': accent,
    '--ms-counter-badge-color': textOnAccent,
    '--ms-counter-badge-background-hover': accentHover,

    // ========================================================================
    // DROPDOWN
    // ========================================================================
    '--ms-dropdown-background': background,
    '--ms-dropdown-text-color': text,
    '--ms-dropdown-border': `1px solid ${border}`,
    '--ms-dropdown-box-shadow': isDark
      ? '0 8px 16px rgba(0, 0, 0, 0.6)'
      : '0 8px 16px rgba(0, 0, 0, 0.15)',

    // ========================================================================
    // OPTIONS - All States
    // ========================================================================
    // Default
    '--ms-option-background': 'transparent',
    '--ms-option-text-color': text,

    // Hover
    '--ms-option-background-hover': bgHover,
    '--ms-option-color-hover': text,

    // Focused
    '--ms-option-background-focused': focusedBg,
    '--ms-option-color-focused': text,
    '--ms-option-outline-focused': `2px solid ${accent}`,

    // Matched (search highlight)
    '--ms-option-background-matched': matchedBg,
    '--ms-option-color-matched': text,
    '--ms-option-border-matched': `3px solid ${accentMedium}`,

    // Selected
    '--ms-option-background-selected': selectedBg,
    '--ms-option-color-selected': textOnAccent,

    // Combined: Focused + Hover
    '--ms-option-bg-focused-hover': focusedBgHover,
    '--ms-option-color-focused-hover': text,

    // Combined: Matched + Hover
    '--ms-option-bg-matched-hover': matchedBgHover,
    '--ms-option-color-matched-hover': text,

    // Combined: Selected + Hover
    '--ms-option-bg-selected-hover': selectedBgHover,
    '--ms-option-color-selected-hover': textOnAccent,

    // Combined: Selected + Focused
    '--ms-option-bg-selected-focused': selectedBgFocused,
    '--ms-option-color-selected-focused': textOnAccent,

    // Combined: Selected + Matched
    '--ms-option-bg-selected-matched': selectedBgMatched,
    '--ms-option-color-selected-matched': textOnAccent,

    // Combined: Disabled + Selected
    '--ms-option-bg-disabled-selected': disabledSelectedBg,
    '--ms-option-color-disabled-selected': textOnAccent,

    // Option content - title
    '--ms-option-title-color': text,

    // Option content - subtitle (with all state variants for contrast)
    '--ms-option-subtitle-color': textMuted,
    '--ms-option-subtitle-color-hover': textMuted,
    '--ms-option-subtitle-color-selected': subtitleOnAccent,
    '--ms-option-subtitle-color-selected-hover': subtitleOnAccent,

    // Option content - mark (search highlight)
    '--ms-option-mark-background': alpha(accent, 0.25),
    '--ms-option-mark-color': text,

    // ========================================================================
    // CHECKBOXES - All States
    // ========================================================================
    // Default
    '--ms-checkbox-bg': isDark ? bgHover : background,
    '--ms-checkbox-border': `1px solid ${border}`,

    // Hover
    '--ms-checkbox-hover-border-color': accent,

    // Checked
    '--ms-checkbox-checked-bg': accent,
    '--ms-checkbox-checked-border': `1px solid ${accent}`,
    '--ms-checkbox-checkmark-color': textOnAccent,

    // Checked + Hover
    '--ms-checkbox-checked-bg-hover': accentHover,
    '--ms-checkbox-checked-border-color-hover': accentHover,

    // Disabled
    '--ms-checkbox-disabled-bg': disabledBg,
    '--ms-checkbox-disabled-border': `1px solid ${borderLight}`,

    // ========================================================================
    // GROUPS
    // ========================================================================
    '--ms-group-border-top': `1px solid ${borderLight}`,
    '--ms-group-label-color': textMuted,

    // ========================================================================
    // ACTIONS (Select All / Clear All) - All States
    // ========================================================================
    '--ms-actions-background': background,

    // Default button
    '--ms-action-button-background': 'transparent',
    '--ms-action-button-color': text,
    '--ms-action-btn-border': `1px solid ${border}`,

    // Hover
    '--ms-action-button-background-hover': bgHover,
    '--ms-action-button-border-color-hover': accent,

    // ========================================================================
    // BADGES - All States
    // ========================================================================
    // Badge container ("+X more" badge states)
    '--ms-more-badge-bg': isDark ? alpha(accent, 0.15) : alpha(accent, 0.1),
    '--ms-more-badge-hover-bg': isDark ? alpha(accent, 0.2) : alpha(accent, 0.15),
    '--ms-more-badge-active-bg': isDark ? alpha(accent, 0.25) : alpha(accent, 0.2),

    // Badge text part
    '--ms-badge-text-background': isDark ? alpha(accent, 0.2) : accentLight,
    '--ms-badge-text-color': isDark ? lighten(accent, 15) : darken(accent, 10),
    '--ms-badge-text-background-hover': isDark ? alpha(accent, 0.25) : alpha(accent, 0.2),
    '--ms-badge-text-color-hover': isDark ? lighten(accent, 20) : darken(accent, 15),
    '--ms-badge-text-border': `1px solid ${accentMedium}`,

    // Badge remove button
    '--ms-badge-remove-background': accent,
    '--ms-badge-remove-color': textOnAccent,
    '--ms-badge-remove-border': `1px solid ${accent}`,
    '--ms-badge-remove-background-hover': accentHover,

    // Badge counter variant (gray/neutral)
    '--ms-badge-counter-border': `1px solid ${border}`,
    '--ms-badge-counter-text-background': isDark ? lighten(background, 15) : darken(background, 8),
    '--ms-badge-counter-text-color': textMuted,
    '--ms-badge-counter-remove-background': textMuted,
    '--ms-badge-counter-remove-color': background,
    '--ms-badge-counter-remove-background-hover': text,

    // ========================================================================
    // COUNT DISPLAY MODE - All States
    // ========================================================================
    // Wrapper
    '--ms-counter-wrapper-background': 'transparent',
    '--ms-counter-wrapper-border': `1px solid ${border}`,
    '--ms-counter-wrapper-background-hover': bgHover,
    '--ms-counter-wrapper-border-color-hover': accent,

    // Text
    '--ms-count-text-color': text,
    '--ms-count-text-bg': 'transparent',

    // Clear button
    '--ms-count-clear-background': 'transparent',
    '--ms-count-clear-color': textMuted,
    '--ms-count-clear-background-hover': alpha(accent, 0.2),
    '--ms-count-clear-color-hover': accent,

    // ========================================================================
    // TOOLTIP
    // ========================================================================
    '--ms-tooltip-background': isDark ? lighten(background, 20) : '#333333',
    '--ms-tooltip-text-color': isDark ? text : '#ffffff',

    // ========================================================================
    // SELECTED POPOVER - All States
    // ========================================================================
    '--ms-selected-popover-background': background,
    '--ms-selected-popover-border': `1px solid ${border}`,
    '--ms-selected-popover-box-shadow': isDark
      ? '0 8px 16px rgba(0, 0, 0, 0.6)'
      : '0 8px 16px rgba(0, 0, 0, 0.15)',

    // Header
    '--ms-selected-popover-header-background': accentLight,
    '--ms-selected-popover-header-color': text,
    '--ms-selected-popover-header-border-bottom': `1px solid ${border}`,

    // Close button
    '--ms-selected-popover-close-background': 'transparent',
    '--ms-selected-popover-close-color': textMuted,
    '--ms-selected-popover-close-background-hover': bgHover,
    '--ms-selected-popover-close-color-hover': accent,

    // ========================================================================
    // SCROLLBAR
    // ========================================================================
    '--ms-scrollbar-track-bg': 'transparent',
    '--ms-scrollbar-thumb-bg': border,
    '--ms-scrollbar-thumb-bg-hover': textMuted,

    // ========================================================================
    // EMPTY & LOADING STATES
    // ========================================================================
    '--ms-empty-color': textMuted,
    '--ms-loading-color': textMuted,

    // ========================================================================
    // FLOATING HINT
    // ========================================================================
    '--ms-hint-background': background,
    '--ms-hint-border': `1px solid ${border}`,
    '--ms-hint-color': textMuted,
  };
}
