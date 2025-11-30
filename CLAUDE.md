# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run build    # TypeScript check + Vite build (outputs to dist/)
npm run dev      # Vite dev server
```

## Architecture

This is an ESM-only TypeScript library that generates CSS variable themes for KeenMate web components from 3 base colors (background, text, accent).

### Source Structure

- `src/index.ts` - Main entry point, exports generators and formatters
- `src/types.ts` - TypeScript interfaces (ThemeInput, ComponentType, RGB, HSL)
- `src/color-utils.ts` - Pure color manipulation functions (hex/rgb/hsl conversions, lighten/darken, contrast, mixing, color harmony)
- `src/generators/` - Component-specific theme generators
  - `multiselect.ts` - Generates ~70 CSS variables for @keenmate/web-multiselect
  - `daterangepicker.ts` - Theme generator for @keenmate/web-daterangepicker

### Key Patterns

**Theme Generation Flow:**
1. User provides `ThemeInput` with 3 hex colors: background, text, accent
2. Generator detects if theme is dark/light via `getLightness(background) < 50`
3. Derives variations using color-utils (hover states, borders, muted text, transparent overlays)
4. Returns object mapping CSS custom property names to color values

**Output Formatters:** `toCSS()`, `toJSON()`, `toSCSS()` convert theme objects to different formats

**Color Utils Design:** All functions work with hex strings (`#rrggbb` or `#rgb`). Internally convert to RGB/HSL for manipulation, return hex. WCAG-compliant contrast detection via luminance calculation.

### Adding a New Component Theme

1. Create `src/generators/<component>.ts` with a function returning `Record<string, string>`
2. Export from `src/generators/index.ts`
3. Add component type to `ComponentType` union in `src/types.ts`
4. Register in `generators` map in `src/index.ts`
