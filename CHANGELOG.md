# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Base theme variables**:
  - `--base-border-radius-sm`, `--base-border-radius-md`, `--base-border-radius-lg` - Border radius coefficients (multiplied by rem)
  - `--base-input-border`, `--base-input-border-hover`, `--base-input-border-focus` - Full border properties for input states (allows controlling width, style, and color per state)
  - `--base-text-color-1` through `--base-text-color-4` - FluentUI-style text color hierarchy (level 1 = headers, level 4 = hints/placeholders)

- **Theme presets with overrides**: Presets can now include variable overrides (e.g., Corporate theme with zero border-radius)

- **Theme Designer App improvements**:
  - Number inputs with appropriate step values for numeric variables (font-size: 0.1, font-weight: 100, etc.)
  - Unit indicator column showing expected units (× rem, px, ms)
  - Color picker moved after input field for better layout
  - Responsive input width (wider on xl screens)

- **BASE_VARIABLES.md**: Documentation of all `--base-*` CSS custom properties

### Changed

- **BREAKING: Cascading theme architecture overhaul**
  - Component generators (`multiselect.ts`) no longer set redundant `--ms-*` variables that have `--base-*` equivalents
  - Removed ~20 variables from `multiselect.ts`: global colors, input colors, dropdown colors, tooltip colors
  - Theme generator now only sets `--base-*` variables (for cascading) and component-specific variables (states without base equivalents)
  - Components use `var(--base-*, fallback)` pattern to inherit from base layer

- **BREAKING: Text color variables renamed to numbered levels (FluentUI-style)**
  - `--base-text-primary` → `--base-text-color-1` (headers, titles)
  - `--base-text-secondary` → `--base-text-color-3` (secondary content)
  - Added `--base-text-color-2` (body text) and `--base-text-color-4` (hints, placeholders)
  - `--base-text-on-accent` kept as special case (auto-contrasted against accent)
  - web-multiselect: Added `--ms-text-color-1` through `--ms-text-color-4` with legacy aliases

- **web-multiselect `_css-variables.scss` updates**:
  - Color variables now use `var(--base-*, #{$scss-default})` fallback pattern
  - Input border variables changed from color-only to full border properties:
    - `--ms-input-border: var(--base-input-border, 1px solid var(--ms-border-color))`
    - `--ms-input-border-hover: var(--base-input-border-hover, ...)`
    - `--ms-input-border-focus: var(--base-input-border-focus, ...)`

- **web-multiselect `_input-dropdown.scss` updates**:
  - Input now uses full `--ms-input-border` variable instead of `--ms-input-border-style`
  - Hover/focus states use `--ms-input-border-hover` and `--ms-input-border-focus`

### Fixed

- **Color Picker Positioning** - Color picker now appears directly on the color swatch button instead of far away when deep in the variable list
- **Selected Option Title Color** - Added `--ms-option-title-color-selected` and `--ms-option-title-color-selected-hover` to multiselect generator so title text uses contrasted color on accent background
- **Variable Groups Updated** - Removed obsolete `--ms-option-color-selected*` variables, added `--ms-option-title-color-selected*` variables to "Options - Selected" group
- **Dropdown Border Removed** - Removed `--ms-dropdown-border` from multiselect generator (now cascades from `--base-dropdown-border`)
- White space appearing below body when CSS Variables section is expanded (html/body height constraint)
- Color input textboxes overflowing outside Base Colors card (added min-w-0)
- Svelte 5 `$derived` usage causing invalid color input values
- Base theme overrides (like border-radius) now persist when switching between components
- Theme-designer no longer overrides component CSS variable fallback chains (removed redundant `--ms-*` variables from generator)
- Duplicate `--ms-input-placeholder-color` definition in `_css-variables.scss` removed

- **Theme Designer App**: Interactive web application for designing themes visually
  - Live preview with actual web-multiselect component
  - Real-time CSS variable editing with color pickers
  - Lock/unlock individual variables to preserve custom values
  - Import/export themes in CSS, JSON, and SCSS formats
  - Support for both standalone and cascading (base layer) export modes
  - Available at [theme-designer.keenmate.dev](https://theme-designer.keenmate.dev)

- **Multi-component theming support**
  - Added `web-daterangepicker` component support
  - Shared base layer architecture (`--base-*` variables) for consistent theming across components
  - `generateFullTheme()` function for cascading theme generation
  - `generateBaseTheme()` function for base layer only

- **New exports**
  - `toFullCSS()` - Export with base and component layers
  - `COMPONENT_PREFIXES` - Map of component names to CSS variable prefixes

### Changed

- **BREAKING: Unified Theming Variable Renames**
  - `web-multiselect`: Renamed `--ms-text-white` to `--ms-text-on-accent` for semantic clarity
  - `web-daterangepicker`: Multiple variable renames for consistency:
    - `--drp-white` → `--drp-text-on-accent`
    - `--drp-body-bg` → `--drp-primary-bg`
    - `--drp-input-border` → `--drp-border-color`
    - `--drp-brand-secondary` → `--drp-accent-secondary`
    - `--drp-brand-primary` → `--drp-accent-color`

## [1.0.0] - 2024-11-30

### Added

- Initial release of `@keenmate/theme-designer`
- Generate complete CSS variable themes from 3 base colors (background, text, accent)
- Support for `web-multiselect` component
- Output formatters: `toCSS()`, `toJSON()`, `toSCSS()`
- Theme application helpers: `applyTheme()`, `removeTheme()`
- Comprehensive color utilities:
  - Conversions: `hexToRgb`, `rgbToHex`, `hexToHsl`, `hslToHex`
  - Adjustments: `lighten`, `darken`, `saturate`, `desaturate`, `alpha`
  - Contrast: `contrast`, `contrastRatio` (WCAG compliant)
  - Mixing: `mix`
  - Color harmony: `complementary`, `triadic`, `tetradic`, `splitComplementary`, `analogous`
  - Utilities: `isDark`, `isLight`, `getLightness`
