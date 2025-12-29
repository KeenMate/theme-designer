import { writable, derived, get } from 'svelte/store';
import {
  generateTheme,
  generateFullTheme,
  toCSS,
  toJSON,
  toSCSS,
  toFullCSS,
  generateBaseTheme,
  COMPONENT_PREFIXES,
} from '@keenmate/theme-designer';
import type { ThemeInput, ComponentType, GeneratedTheme } from '@keenmate/theme-designer';
import { getComponentDefaultsObject } from '$lib/componentDefaults';
import { resolveTheme, buildThemeContext } from '$lib/colorResolver';

// All valid CSS variable prefixes we support
const VALID_PREFIXES = ['--ms-', '--drp-', '--base-'];

export interface ColorState extends ThemeInput {
  background: string;
  text: string;
  accent: string;
  fontFamily?: string;
  fontImport?: string;
}

const defaultColors: ColorState = {
  background: '#ffffff',
  text: '#111827',
  accent: '#3b82f6',
  fontFamily: undefined,
  fontImport: undefined,
};

// Base colors store
export const colors = writable<ColorState>(defaultColors);

// Selected component store
export const selectedComponent = writable<ComponentType>('web-multiselect');

// Export mode: cascading (with base layer) or standalone
export const cascadingMode = writable<boolean>(false);

// Calculated base theme (--base-* variables)
export const baseTheme = derived(colors, ($colors) => generateBaseTheme($colors));

// Calculated full theme with base + component layers
export const fullTheme = derived(
  [colors, selectedComponent],
  ([$colors, $component]) => generateFullTheme($component, $colors)
);

// Calculated theme from generator (based on base colors and selected component)
// Merges CSS defaults with generator output (generator values override defaults)
export const calculatedTheme = derived(
  [colors, selectedComponent],
  ([$colors, $component]) => {
    const defaults = getComponentDefaultsObject($component);
    const generated = generateTheme($component, $colors);
    return { ...defaults, ...generated };
  }
);

// User overrides for individual variables
export const overrides = writable<Record<string, string>>({});

// Set of locked variable names (won't be recalculated when base colors change)
export const locked = writable<Set<string>>(new Set());

// Final theme merges calculated with locked overrides
export const finalTheme = derived(
  [calculatedTheme, overrides, locked],
  ([$calc, $over, $locked]) => {
    const result = { ...$calc };
    for (const key of $locked) {
      if ($over[key] !== undefined) {
        result[key] = $over[key];
      }
    }
    return result;
  }
);

// Final base theme merges calculated base with locked overrides
export const finalBaseTheme = derived(
  [baseTheme, overrides, locked],
  ([$base, $over, $locked]) => {
    const result = { ...$base };
    for (const key of $locked) {
      if (key.startsWith('--base-') && $over[key] !== undefined) {
        result[key] = $over[key];
      }
    }
    return result;
  }
);

// Export formats derived from final theme and cascading mode
export const cssOutput = derived(
  [fullTheme, finalTheme, finalBaseTheme, cascadingMode, colors],
  ([$fullTheme, $finalTheme, $finalBase, $cascading, $colors]) => {
    // Build @import statement if fontImport is set
    const importStatement = $colors.fontImport ? `${$colors.fontImport}\n\n` : '';

    if ($cascading) {
      // In cascading mode, export base layer (with overrides) + component layer with var() refs
      const baseProps = Object.entries($finalBase)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join('\n');
      const componentProps = Object.entries($fullTheme.component)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join('\n');
      return `${importStatement}/* Base Layer */\n:root {\n${baseProps}\n}\n\n/* Component Layer (references base) */\n:root {\n${componentProps}\n}`;
    }
    // Standalone mode: just the component variables with resolved values
    return `${importStatement}${toCSS($finalTheme, ':root')}`;
  }
);

export const jsonOutput = derived(
  [fullTheme, finalTheme, finalBaseTheme, cascadingMode],
  ([$fullTheme, $finalTheme, $finalBase, $cascading]) => {
    if ($cascading) {
      // In cascading mode, export structured object with base (with overrides) and component
      return JSON.stringify(
        {
          base: $finalBase,
          component: $fullTheme.component,
        },
        null,
        2
      );
    }
    // Standalone mode: flat theme object
    return toJSON($finalTheme, true);
  }
);

export const scssOutput = derived(
  [fullTheme, finalTheme, finalBaseTheme, cascadingMode],
  ([$fullTheme, $finalTheme, $finalBase, $cascading]) => {
    if ($cascading) {
      // In cascading mode, export both SCSS maps (base with overrides)
      const baseMap = toSCSS($finalBase, '$base-theme');
      const componentMap = toSCSS($fullTheme.component, '$component-theme');
      return `${baseMap}\n\n${componentMap}`;
    }
    // Standalone mode: single theme map
    return toSCSS($finalTheme, '$theme');
  }
);

// Keep the old theme export for backwards compatibility
export const theme = finalTheme;

// Resolved theme for live preview - all var() and color-mix() resolved to actual values
export const resolvedTheme = derived(
  [finalTheme, baseTheme, colors],
  ([$finalTheme, $baseTheme, $colors]) => {
    const context = buildThemeContext($baseTheme, $finalTheme);
    return resolveTheme($finalTheme, context, $colors.background);
  }
);

// ============================================================================
// Base color functions
// ============================================================================

export function setColors(newColors: ColorState) {
  colors.set(newColors);
}

export function updateColor(key: keyof ColorState, value: string) {
  colors.update((c) => ({ ...c, [key]: value }));
}

export function resetColors() {
  colors.set(defaultColors);
}

// ============================================================================
// Variable override functions
// ============================================================================

/**
 * Set an override value for a specific variable
 */
export function setOverride(varName: string, value: string) {
  overrides.update((o) => ({ ...o, [varName]: value }));
}

/**
 * Remove an override for a specific variable
 */
export function clearOverride(varName: string) {
  overrides.update((o) => {
    const newOverrides = { ...o };
    delete newOverrides[varName];
    return newOverrides;
  });
}

/**
 * Lock a variable so it won't be recalculated when base colors change
 */
export function lockVariable(varName: string) {
  // When locking, save the current calculated value as an override
  const currentTheme = get(calculatedTheme);
  const currentOverrides = get(overrides);

  // Use existing override or current calculated value
  const valueToLock = currentOverrides[varName] ?? currentTheme[varName];

  if (valueToLock !== undefined) {
    overrides.update((o) => ({ ...o, [varName]: valueToLock }));
  }

  locked.update((l) => {
    const newLocked = new Set(l);
    newLocked.add(varName);
    return newLocked;
  });
}

/**
 * Unlock a variable so it will be recalculated when base colors change
 */
export function unlockVariable(varName: string) {
  locked.update((l) => {
    const newLocked = new Set(l);
    newLocked.delete(varName);
    return newLocked;
  });

  // Optionally clear the override when unlocking
  clearOverride(varName);
}

/**
 * Toggle lock state for a variable
 */
export function toggleLock(varName: string) {
  const currentLocked = get(locked);
  if (currentLocked.has(varName)) {
    unlockVariable(varName);
  } else {
    lockVariable(varName);
  }
}

/**
 * Check if a variable is locked
 */
export function isLocked(varName: string): boolean {
  return get(locked).has(varName);
}

/**
 * Reset all overrides and locks
 */
export function resetOverrides() {
  overrides.set({});
  locked.set(new Set());
}

/**
 * Reset only component-specific overrides (--ms-*, --drp-*), preserve --base-* overrides
 */
export function resetComponentOverrides() {
  overrides.update((o) => {
    const newOverrides: Record<string, string> = {};
    for (const [key, value] of Object.entries(o)) {
      if (key.startsWith('--base-')) {
        newOverrides[key] = value;
      }
    }
    return newOverrides;
  });

  locked.update((l) => {
    const newLocked = new Set<string>();
    for (const key of l) {
      if (key.startsWith('--base-')) {
        newLocked.add(key);
      }
    }
    return newLocked;
  });
}

/**
 * Reset everything to defaults
 */
export function resetAll() {
  resetColors();
  resetOverrides();
}

// ============================================================================
// Import functions
// ============================================================================

/**
 * Check if a variable name has a valid prefix we support
 */
function hasValidPrefix(varName: string): boolean {
  return VALID_PREFIXES.some((prefix) => varName.startsWith(prefix));
}

/**
 * Parse CSS variables from a CSS string
 * Handles formats like:
 *   --ms-accent-color: #3b82f6;
 *   --drp-accent-color: #3b82f6;
 *   --base-accent-color: #3b82f6;
 *   :root { --ms-accent-color: #3b82f6; }
 */
export function parseCSS(css: string): Record<string, string> {
  const variables: Record<string, string> = {};
  // Match --ms-*, --drp-*, --base-* variables with their values
  const regex = /(--(?:ms|drp|base)-[a-z0-9-]+)\s*:\s*([^;]+)/gi;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const varName = match[1].trim();
    const value = match[2].trim();
    variables[varName] = value;
  }
  return variables;
}

/**
 * Parse JSON theme object
 * Supports flat format: { "--ms-accent-color": "#3b82f6" }
 * And structured format: { "base": {...}, "component": {...} }
 */
export function parseJSON(json: string): Record<string, string> {
  try {
    const parsed = JSON.parse(json);
    const variables: Record<string, string> = {};

    // Check for structured format with base and component keys
    if (parsed.base && typeof parsed.base === 'object') {
      for (const [key, value] of Object.entries(parsed.base)) {
        if (hasValidPrefix(key) && typeof value === 'string') {
          variables[key] = value;
        }
      }
    }
    if (parsed.component && typeof parsed.component === 'object') {
      for (const [key, value] of Object.entries(parsed.component)) {
        if (hasValidPrefix(key) && typeof value === 'string') {
          variables[key] = value;
        }
      }
    }

    // If no structured format found, treat as flat object
    if (Object.keys(variables).length === 0) {
      for (const [key, value] of Object.entries(parsed)) {
        if (hasValidPrefix(key) && typeof value === 'string') {
          variables[key] = value;
        }
      }
    }

    return variables;
  } catch {
    return {};
  }
}

/**
 * Parse SCSS variables from a SCSS string
 * Handles formats like:
 *   $theme: (
 *     "--ms-accent-color": #3b82f6,
 *     "--drp-accent-color": #3b82f6,
 *     "--base-accent-color": #3b82f6,
 *   );
 */
export function parseSCSS(scss: string): Record<string, string> {
  const variables: Record<string, string> = {};
  // Match "--ms-*", "--drp-*", "--base-*": value patterns
  const regex = /"(--(?:ms|drp|base)-[a-z0-9-]+)"\s*:\s*([^,\n)]+)/gi;
  let match;
  while ((match = regex.exec(scss)) !== null) {
    const varName = match[1].trim();
    let value = match[2].trim();
    // Remove trailing comma if present
    value = value.replace(/,\s*$/, '');
    variables[varName] = value;
  }
  return variables;
}

/**
 * Auto-detect format and parse
 */
export function autoParseTheme(input: string): Record<string, string> {
  const trimmed = input.trim();

  // Try JSON first (starts with { or [)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const result = parseJSON(trimmed);
    if (Object.keys(result).length > 0) return result;
  }

  // Try SCSS (contains $theme or map structure with any supported prefix)
  if (
    trimmed.includes('$') ||
    (trimmed.includes('(') && (trimmed.includes('"--ms-') || trimmed.includes('"--drp-') || trimmed.includes('"--base-')))
  ) {
    const result = parseSCSS(trimmed);
    if (Object.keys(result).length > 0) return result;
  }

  // Default to CSS
  return parseCSS(trimmed);
}

/**
 * Get the currently selected component's prefix
 */
function getCurrentPrefix(): string {
  const component = get(selectedComponent);
  return COMPONENT_PREFIXES[component];
}

/**
 * Import theme variables - locks and overrides all imported values
 * Also updates base colors if the corresponding variables are present
 * Supports --ms-*, --drp-*, and --base-* variables
 */
export function importTheme(variables: Record<string, string>) {
  const currentCalc = get(calculatedTheme);
  const prefix = getCurrentPrefix();

  // Extract base colors from imported variables to update the colors store
  // Check for base-* variables first, then component-specific ones
  const newColors: Partial<ColorState> = {};

  // Priority: --base-* > --{prefix}-* (current component)
  const bgKey = variables['--base-primary-bg'] ?? variables[`--${prefix}-primary-bg`];
  const textKey = variables['--base-text-primary'] ?? variables[`--${prefix}-text-primary`];
  const accentKey = variables['--base-accent-color'] ?? variables[`--${prefix}-accent-color`];

  if (bgKey) {
    newColors.background = bgKey;
  }
  if (textKey) {
    newColors.text = textKey;
  }
  if (accentKey) {
    newColors.accent = accentKey;
  }

  // Update base colors if any were found
  if (Object.keys(newColors).length > 0) {
    colors.update((c) => ({ ...c, ...newColors }));
  }

  // Lock and override all imported variables for the current component
  for (const [varName, value] of Object.entries(variables)) {
    // Skip var() references - we only want resolved values
    if (value.startsWith('var(')) continue;

    // Import variables that match the current component prefix
    if (varName.startsWith(`--${prefix}-`) && varName in currentCalc) {
      locked.update((l) => {
        const newLocked = new Set(l);
        newLocked.add(varName);
        return newLocked;
      });
      overrides.update((o) => ({ ...o, [varName]: value }));
    }
  }
}

/**
 * Import from string (auto-detects format)
 * Returns number of variables imported
 */
export function importFromString(input: string): number {
  const variables = autoParseTheme(input);
  const count = Object.keys(variables).length;
  if (count > 0) {
    importTheme(variables);
  }
  return count;
}
