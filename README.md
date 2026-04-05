# @keenmate/theme-designer

Generate CSS variable themes for KeenMate web components from just 3 base colors.

## Theme Designer App

Design your themes visually with the interactive Theme Designer app:

**[theme-designer.keenmate.dev](https://theme-designer.keenmate.dev)**

Features:
- Live preview with actual components
- Real-time CSS variable editing with color pickers
- Lock/unlock individual variables to preserve custom values
- Import/export themes in CSS, JSON, and SCSS formats
- Support for both standalone and cascading (base layer) export modes
- Variable Reference legend showing how base variables map to component UI elements

## Installation

```bash
npm install @keenmate/theme-designer
```

## Quick Start

```typescript
import { generateTheme, applyTheme } from '@keenmate/theme-designer';

// Generate a dark theme
const darkTheme = generateTheme('web-multiselect', {
  background: '#1a1a1a',
  text: '#e5e5e5',
  accent: '#667eea'
});

// Apply to an element
const element = document.querySelector('web-multiselect');
applyTheme(element, darkTheme);
```

## Supported Components

- `web-multiselect` - [@keenmate/web-multiselect](https://www.npmjs.com/package/@keenmate/web-multiselect)
- `web-daterangepicker` - [@keenmate/web-daterangepicker](https://www.npmjs.com/package/@keenmate/web-daterangepicker)

## API

### `generateTheme(component, input)`

Generate a complete theme for a component.

```typescript
const theme = generateTheme('web-multiselect', {
  background: '#ffffff',  // Main background color
  text: '#111827',        // Primary text color
  accent: '#3b82f6'       // Accent/brand color
});
```

### `generateFullTheme(component, input)`

Generate a cascading theme with base layer and component layer.

```typescript
const fullTheme = generateFullTheme('web-multiselect', {
  background: '#ffffff',
  text: '#111827',
  accent: '#3b82f6'
});

// Returns: { base: {...}, component: {...} }
```

### `generateBaseTheme(input)`

Generate only the base layer variables (shared across components).

```typescript
const baseTheme = generateBaseTheme({
  background: '#ffffff',
  text: '#111827',
  accent: '#3b82f6'
});

// Returns: { '--base-primary-bg': '#ffffff', '--base-text-primary': '#111827', ... }
```

### Output Formatters

#### `toCSS(theme, selector?)`

Convert to CSS string:

```typescript
import { generateTheme, toCSS } from '@keenmate/theme-designer';

const theme = generateTheme('web-multiselect', { ... });
const css = toCSS(theme, '.dark-theme');

// Output:
// .dark-theme {
//   --ms-input-bg: #1a1a1a;
//   --ms-option-bg-hover: #2a2a2a;
//   ...
// }
```

#### `toJSON(theme, pretty?)`

Convert to JSON string:

```typescript
const json = toJSON(theme);
```

#### `toSCSS(theme, mapName?)`

Convert to SCSS map:

```typescript
const scss = toSCSS(theme, '$dark-theme');

// Output:
// $dark-theme: (
//   '--ms-input-bg': #1a1a1a,
//   ...
// );
```

### Helper Functions

#### `applyTheme(element, theme)`

Apply theme directly to a DOM element:

```typescript
applyTheme(document.querySelector('web-multiselect'), theme);
```

#### `removeTheme(element, theme)`

Remove theme from an element:

```typescript
removeTheme(element, theme);
```

## Color Utilities

All color manipulation functions are exported for advanced use cases:

```typescript
import {
  // Conversions
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,

  // Adjustments
  lighten,
  darken,
  saturate,
  desaturate,
  alpha,

  // Contrast
  contrast,      // Returns black or white for best contrast
  contrastRatio, // WCAG contrast ratio

  // Mixing
  mix,

  // Color harmony
  complementary,      // +180° on color wheel
  triadic,            // +120°, +240°
  tetradic,           // +90°, +180°, +270°
  splitComplementary, // +150°, +210°
  analogous,          // -30°, +30°

  // Utilities
  isDark,
  isLight,
  getLightness,
} from '@keenmate/theme-designer';
```

### Examples

```typescript
// Lighten a color by 20%
const lighter = lighten('#3b82f6', 20);

// Get contrasting text color
const textColor = contrast('#3b82f6'); // '#ffffff'

// Create semi-transparent version
const transparent = alpha('#3b82f6', 0.5); // 'rgba(59, 130, 246, 0.5)'

// Mix two colors
const mixed = mix('#ff0000', '#0000ff', 50); // Purple

// Get complementary color
const opposite = complementary('#3b82f6');
```

## Theme Examples

### Light Theme
```typescript
const lightTheme = generateTheme('web-multiselect', {
  background: '#ffffff',
  text: '#111827',
  accent: '#3b82f6'
});
```

### Dark Theme
```typescript
const darkTheme = generateTheme('web-multiselect', {
  background: '#1a1a1a',
  text: '#e5e5e5',
  accent: '#667eea'
});
```

### Corporate Theme (Audi-style)
```typescript
const corporateTheme = generateTheme('web-multiselect', {
  background: '#ffffff',
  text: '#333333',
  accent: '#bb0a30'
});
```

### Neon Theme
```typescript
const neonTheme = generateTheme('web-multiselect', {
  background: '#0a0a0a',
  text: '#00ffff',
  accent: '#ff00ff'
});
```

## CSS Variable Layers

The Theme Designer supports a cascading architecture with two layers:

### Base Layer (`--base-*`)

Shared variables derived from your 3 input colors. These provide consistent theming across all KeenMate components.

#### Base Variable Reference

| Variable | Derived From | Design Purpose | Typical Usage |
|----------|--------------|----------------|---------------|
| **Accent Colors** |
| `--base-accent-color` | `accent` input | Primary brand/action color | Selected states, focus rings, primary buttons |
| `--base-accent-color-hover` | accent ±10% lightness | Interactive feedback | Hover state on accent elements |
| `--base-accent-color-active` | accent ±15% lightness | Press feedback | Active/pressed state on accent elements |
| **Background Colors** |
| `--base-primary-bg` | `background` input | Main surface color | Input fields, dropdowns, containers |
| `--base-primary-bg-hover` | background ±5-8% lightness | Subtle highlight | Row hover, option hover |
| **Text Colors** |
| `--base-text-color-1` | `text` input (100%) | Primary text | Headers, labels, main content |
| `--base-text-color-2` | text 85% mix with bg | Secondary text | Body text, descriptions |
| `--base-text-color-3` | text 60% mix with bg | Tertiary text | Subtitles, secondary info |
| `--base-text-color-4` | text 40% mix with bg | Muted text | Placeholders, hints, captions |
| `--base-text-color-on-accent` | auto-contrast (black/white) | Legible on accent | Text on selected items, badges |
| **Border** |
| `--base-border-color` | background ±12-15% lightness | Element separation | Input borders, dividers |
| **Input Fields** |
| `--base-input-bg` | `background` input | Input surface | Text inputs, selects |
| `--base-input-color` | text-color-1 | Input text | User-entered text |
| `--base-input-border` | 1px solid border-color | Default border | Input resting state |
| `--base-input-border-hover` | border ±10% lightness | Hover hint | Input hover state |
| `--base-input-border-focus` | 1px solid accent | Focus indicator | Focused input (uses accent) |
| `--base-input-placeholder-color` | text-color-4 | Placeholder text | Input hints |
| `--base-input-bg-disabled` | text 3-5% alpha | Inactive surface | Disabled inputs |
| **Dropdown/Popover** |
| `--base-dropdown-bg` | `background` input | Popup surface | Dropdown menus, popovers |
| `--base-dropdown-border` | 1px solid border-color | Popup border | Dropdown edge |
| `--base-dropdown-box-shadow` | dark/light adaptive | Depth/elevation | Floating panel shadow |
| **Tooltip** |
| `--base-tooltip-bg` | dark: bg+20%, light: #333 | Tooltip surface | Help text, badge tooltips |
| `--base-tooltip-text-color` | auto-contrast | Tooltip text | Tooltip content |
| **Typography** |
| `--base-font-family` | system-ui stack (or custom) | Typeface | All component text |
| `--base-font-size-2xs` to `2xl` | 1.0 to 2.4 multipliers | Size scale | Font size × component rem |
| `--base-font-weight-*` | 400, 500, 600 | Weight scale | normal, medium, semibold |
| `--base-line-height-*` | 1.25, 1.5, 1.75 | Line height | tight, normal, relaxed |
| **Border Radius** |
| `--base-border-radius-sm` | 0.4 multiplier | Small roundness | Day cells, small buttons |
| `--base-border-radius-md` | 0.6 multiplier | Medium roundness | Inputs, standard controls |
| `--base-border-radius-lg` | 0.8 multiplier | Large roundness | Cards, containers |
| **Input Size Heights** |
| `--base-input-size-xs-height` | 3.1 multiplier | Extra small input | 31px at 10px rem |
| `--base-input-size-sm-height` | 3.3 multiplier | Small input | 33px at 10px rem |
| `--base-input-size-md-height` | 3.5 multiplier | Medium input (default) | 35px at 10px rem |
| `--base-input-size-lg-height` | 3.8 multiplier | Large input | 38px at 10px rem |
| `--base-input-size-xl-height` | 4.1 multiplier | Extra large input | 41px at 10px rem |

#### Dark vs Light Theme Behavior

The generator automatically detects dark/light themes using `getLightness(background) < 50`:

| Adjustment | Dark Theme | Light Theme |
|------------|------------|-------------|
| Hover backgrounds | Lighten | Darken |
| Borders | Lighten from bg | Darken from bg |
| Shadows | Stronger (0.6 alpha) | Softer (0.15 alpha) |
| Tooltips | Lightened background | Dark (#333) |

### Component Layer (`--ms-*`, `--drp-*`)

Component-specific variables that reference base layer variables:

```css
/* Multiselect references base layer */
--ms-input-bg: var(--base-primary-bg);
--ms-accent-color: var(--base-accent-color);

/* Daterangepicker references base layer */
--drp-primary-bg: var(--base-primary-bg);
--drp-accent-color: var(--base-accent-color);
```

This allows you to:
1. Change the base colors once and all components update
2. Override specific component variables when needed
3. Mix standalone and cascading exports as needed

### Adding Support for New Components

When creating a theme generator for a new component:

1. **Reference base variables** - Map your component's CSS variables to `--base-*` equivalents
2. **Follow naming conventions** - Use consistent suffixes across components:
   - `-bg` / `-background` for backgrounds
   - `-color` for text colors
   - `-border` for borders
   - `-hover`, `-active`, `-focus` for states
3. **Document the mapping** - Add a legend showing which base variables affect which UI elements

## How It Works

The generator uses HSL color math to derive all necessary color variations from your 3 base colors:

1. **Background variations**: Hover and active states are calculated by lightening (dark themes) or darkening (light themes) the base background
2. **Border colors**: Derived from background with adjusted lightness
3. **Text variations**: Muted text is mixed between primary text and background
4. **Accent variations**: Transparent overlays, hover states, and contrast text are all calculated
5. **Contrast detection**: Automatically determines if white or black text should be used on colored backgrounds (WCAG compliant)

## Development

```bash
# Install dependencies
make install

# Start development server
make dev

# Build library and app
make build

# Build and run Docker container
make docker-deploy
```

## License 

MIT
