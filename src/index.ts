import type { ThemeInput, ComponentType, ThemeGenerator, GeneratedTheme, ExportOptions } from './types';
import { generateMultiselectTheme } from './generators/multiselect';
import { generateDaterangepickerTheme } from './generators/daterangepicker';
import { generateTreeviewTheme } from './generators/treeview';
import { generateBaseTheme, mapBaseToComponent } from './generators/base';

// =============================================================================
// TYPES
// =============================================================================

export type {
  ThemeInput,
  ComponentType,
  ThemeGenerator,
  GeneratedTheme,
  ExportOptions,
  RGB,
  HSL,
  ComponentManifest,
  BaseVariableDefinition,
  ComponentVariableDefinition,
} from './types';

import type { ComponentManifest } from './types';

// =============================================================================
// SHARED TIER 1 SPEC
// =============================================================================

export {
  TIER1_VARIABLES,
  COMPONENT_PREFIXES,
  getTier1VarName,
  getBaseVarName,
  isTier1Variable,
  extractVariableSuffix,
} from './shared/tier1-variables';

export type { Tier1Variable, ComponentPrefix } from './shared/tier1-variables';

// =============================================================================
// GENERATORS
// =============================================================================

/**
 * Map of component types to their theme generators
 * Note: web-grid returns empty object as CSS handles all var() cascading
 */
export const generators: Record<ComponentType, ThemeGenerator> = {
  'web-multiselect': generateMultiselectTheme,
  'web-daterangepicker': generateDaterangepickerTheme,
  'web-treeview': generateTreeviewTheme,
  'web-grid': () => ({}),
};

/**
 * Generate a complete CSS variable theme for a KeenMate web component
 *
 * @param component - The component type to generate theme for
 * @param input - Base colors for theme generation
 * @returns Object containing all CSS custom properties
 *
 * @example
 * ```typescript
 * const theme = generateTheme('web-multiselect', {
 *   background: '#1a1a1a',
 *   text: '#e5e5e5',
 *   accent: '#667eea'
 * });
 *
 * // Apply to element
 * Object.entries(theme).forEach(([prop, value]) => {
 *   element.style.setProperty(prop, value);
 * });
 * ```
 */
export function generateTheme(
  component: ComponentType,
  input: ThemeInput
): Record<string, string> {
  const generator = generators[component];
  if (!generator) {
    throw new Error(`Unknown component type: ${component}`);
  }
  return generator(input);
}

// =============================================================================
// MANIFEST LOADING
// =============================================================================

/** Cache for loaded manifests */
const manifestCache = new Map<ComponentType, ComponentManifest | null>();

/**
 * Load component manifest from npm package
 *
 * @param component - The component type to load manifest for
 * @returns ComponentManifest or null if not available
 *
 * @example
 * ```typescript
 * const manifest = await loadManifest('web-grid');
 * if (manifest) {
 *   console.log('Required base vars:', manifest.baseVariables.filter(v => v.required));
 *   console.log('Component vars:', manifest.componentVariables.length);
 * }
 * ```
 */
export async function loadManifest(component: ComponentType): Promise<ComponentManifest | null> {
  // Check cache first
  if (manifestCache.has(component)) {
    return manifestCache.get(component) ?? null;
  }

  try {
    // Dynamic import from npm package
    // Vite handles JSON imports automatically in bundled code
    const manifest = await import(`@keenmate/${component}/manifest`);
    const result = (manifest.default ?? manifest) as ComponentManifest;
    manifestCache.set(component, result);
    return result;
  } catch {
    // Manifest not available for this component
    manifestCache.set(component, null);
    return null;
  }
}

/**
 * Clear manifest cache (useful for testing or reloading)
 */
export function clearManifestCache(): void {
  manifestCache.clear();
}

/**
 * Get component prefix from manifest or fallback
 */
export function getComponentPrefix(component: ComponentType): string {
  return componentPrefixes[component];
}

// =============================================================================
// OUTPUT FORMATTERS
// =============================================================================

/**
 * Convert theme object to CSS string
 *
 * @param theme - Theme object from generateTheme()
 * @param selector - CSS selector to wrap the variables (default: ':root')
 * @returns CSS string
 *
 * @example
 * ```typescript
 * const css = toCSS(theme, '#my-component');
 * // Output:
 * // #my-component {
 * //   --ms-input-bg: #1a1a1a;
 * //   ...
 * // }
 * ```
 */
export function toCSS(theme: Record<string, string>, selector: string = ':root'): string {
  const properties = Object.entries(theme)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');

  return `${selector} {\n${properties}\n}`;
}

/**
 * Convert theme object to JSON string
 *
 * @param theme - Theme object from generateTheme()
 * @param pretty - Whether to format with indentation (default: true)
 * @returns JSON string
 */
export function toJSON(theme: Record<string, string>, pretty: boolean = true): string {
  return JSON.stringify(theme, null, pretty ? 2 : 0);
}

/**
 * Convert theme object to SCSS map
 *
 * @param theme - Theme object from generateTheme()
 * @param mapName - Name for the SCSS map (default: '$theme')
 * @returns SCSS string
 *
 * @example
 * ```typescript
 * const scss = toSCSS(theme, '$dark-theme');
 * // Output:
 * // $dark-theme: (
 * //   '--ms-input-bg': #1a1a1a,
 * //   ...
 * // );
 * ```
 */
export function toSCSS(theme: Record<string, string>, mapName: string = '$theme'): string {
  const entries = Object.entries(theme)
    .map(([prop, value]) => `  '${prop}': ${value}`)
    .join(',\n');

  return `${mapName}: (\n${entries}\n);`;
}

/**
 * Apply theme directly to an element
 *
 * @param element - DOM element to apply theme to
 * @param theme - Theme object from generateTheme()
 *
 * @example
 * ```typescript
 * const el = document.querySelector('web-multiselect');
 * applyTheme(el, theme);
 * ```
 */
export function applyTheme(element: HTMLElement, theme: Record<string, string>): void {
  Object.entries(theme).forEach(([prop, value]) => {
    element.style.setProperty(prop, value);
  });
}

/**
 * Remove theme from an element (clear all custom properties)
 *
 * @param element - DOM element to clear theme from
 * @param theme - Theme object (to know which properties to remove)
 */
export function removeTheme(element: HTMLElement, theme: Record<string, string>): void {
  Object.keys(theme).forEach((prop) => {
    element.style.removeProperty(prop);
  });
}

// =============================================================================
// COLOR UTILITIES (re-exported for advanced users)
// =============================================================================

export {
  // Conversions
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  rgbToHsl,
  hslToRgb,

  // Lightness
  getLightness,
  lighten,
  darken,
  saturate,
  desaturate,

  // Transparency
  alpha,

  // Contrast
  luminance,
  contrastRatio,
  contrast,

  // Mixing
  mix,

  // Color harmony
  rotateHue,
  complementary,
  triadic,
  tetradic,
  splitComplementary,
  analogous,

  // Utilities
  isValidHex,
  normalizeHex,
  isDark,
  isLight,
} from './color-utils';

// Re-export generators for direct access
export { generateMultiselectTheme } from './generators/multiselect';
export { generateDaterangepickerTheme } from './generators/daterangepicker';
export { generateTreeviewTheme } from './generators/treeview';
export { generateBaseTheme, mapBaseToComponent, mapBaseToComponentResolved } from './generators/base';

// =============================================================================
// FULL THEME GENERATION (with base layer)
// =============================================================================

const componentPrefixes: Record<ComponentType, string> = {
  'web-multiselect': 'ms',
  'web-daterangepicker': 'drp',
  'web-treeview': 'tv',
  'web-grid': 'wg',
};

/**
 * Generate a complete theme with base layer and component layer
 *
 * @param component - The component type to generate theme for
 * @param input - Base colors for theme generation
 * @returns GeneratedTheme with base, component (var refs), and componentResolved
 */
export function generateFullTheme(
  component: ComponentType,
  input: ThemeInput
): GeneratedTheme {
  const base = generateBaseTheme(input);
  const componentTheme = generateTheme(component, input);
  const prefix = componentPrefixes[component];

  // Create component layer with var() references to base
  const componentWithRefs = mapBaseToComponent(prefix, base);

  // Merge base-mapped vars with full component theme (component-specific vars keep resolved values)
  const mergedComponent: Record<string, string> = { ...componentTheme };
  for (const [varName, varRef] of Object.entries(componentWithRefs)) {
    if (varName in mergedComponent) {
      mergedComponent[varName] = varRef;
    }
  }

  return {
    base,
    component: mergedComponent,
    componentResolved: componentTheme,
  };
}

/**
 * Convert GeneratedTheme to CSS string with export options
 *
 * @param theme - GeneratedTheme from generateFullTheme()
 * @param options - Export options
 * @returns CSS string
 */
export function toFullCSS(
  theme: GeneratedTheme,
  options: ExportOptions = {}
): string {
  const { selector = ':root', cascading = true, includeBase = true } = options;

  const parts: string[] = [];

  // Add base layer if requested
  if (cascading && includeBase) {
    const baseProps = Object.entries(theme.base)
      .map(([prop, value]) => `  ${prop}: ${value};`)
      .join('\n');
    parts.push(`/* Base Layer */\n${selector} {\n${baseProps}\n}`);
  }

  // Add component layer
  const componentTheme = cascading ? theme.component : theme.componentResolved;
  const componentProps = Object.entries(componentTheme)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');

  const componentComment = cascading
    ? `/* Component Layer (references base) */`
    : `/* Component (standalone) */`;
  parts.push(`${componentComment}\n${selector} {\n${componentProps}\n}`);

  return parts.join('\n\n');
}
