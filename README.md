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
Shared variables that provide consistent theming across all components:
- `--base-primary-bg` - Primary background color
- `--base-text-primary` - Primary text color
- `--base-accent-color` - Accent/brand color
- And more...

### Component Layer (`--ms-*`, `--drp-*`)
Component-specific variables that reference base layer variables:
```css
--ms-input-bg: var(--base-primary-bg);
--ms-accent-color: var(--base-accent-color);
```

This allows you to:
1. Change the base colors once and all components update
2. Override specific component variables when needed
3. Mix standalone and cascading exports as needed

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
