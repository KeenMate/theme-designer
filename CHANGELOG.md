# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
