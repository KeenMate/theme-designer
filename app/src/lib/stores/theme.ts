import { writable, derived, get } from 'svelte/store';
import {
  generateTheme,
  toJSON,
  toSCSS,
  generateBaseTheme,
  COMPONENT_PREFIXES,
} from '@keenmate/theme-designer';
import type { ThemeInput, ComponentType, GeneratedTheme, ComponentManifest } from '@keenmate/theme-designer';
import { getComponentDefaultsObject } from '$lib/componentDefaults';
import { resolveTheme, buildThemeContext } from '$lib/colorResolver';

// Note: userPresets imports are avoided here to prevent circular dependency
// The preset name for exports is managed via a separate store

// ============================================================================
// localStorage persistence for current theme state
// ============================================================================

const THEME_STATE_KEY = 'theme-designer-current-state';

interface PersistedThemeState {
  colors: ColorState;
  overrides: Record<string, string>;
  locked: string[];
  selectedComponent: ComponentType;
  componentOverrides?: Record<string, Record<string, string>>;
  componentLocked?: Record<string, string[]>;
}

let hasLoadedThemeState = false;

function saveThemeState(): void {
  if (typeof window === 'undefined') return;
  if (!hasLoadedThemeState) return;

  try {
    // Convert componentLocked sets to arrays for JSON serialization
    const compLocked = get(componentLocked);
    const compLockedArrays: Record<string, string[]> = {};
    for (const [comp, lockedSet] of Object.entries(compLocked)) {
      compLockedArrays[comp] = Array.from(lockedSet);
    }

    const state: PersistedThemeState = {
      colors: get(colors),
      overrides: get(overrides),
      locked: Array.from(get(locked)),
      selectedComponent: get(selectedComponent),
      componentOverrides: get(componentOverrides),
      componentLocked: compLockedArrays,
    };
    localStorage.setItem(THEME_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save theme state to localStorage:', e);
  }
}

/**
 * Load theme state from localStorage
 * Call this on app initialization
 */
export function loadThemeState(): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(THEME_STATE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as PersistedThemeState;
      if (state.colors) {
        // Explicitly set all properties including font (JSON strips undefined values)
        colors.set({
          background: state.colors.background,
          text: state.colors.text,
          accent: state.colors.accent,
          fontFamily: state.colors.fontFamily ?? undefined,
          fontImport: state.colors.fontImport ?? undefined,
        });
      }
      if (state.overrides) overrides.set(state.overrides);
      if (state.locked) locked.set(new Set(state.locked));
      if (state.selectedComponent) selectedComponent.set(state.selectedComponent);
      if (state.componentOverrides) componentOverrides.set(state.componentOverrides);
      if (state.componentLocked) {
        // Convert arrays back to sets
        const compLockedSets: Record<string, Set<string>> = {};
        for (const [comp, lockedArr] of Object.entries(state.componentLocked)) {
          compLockedSets[comp] = new Set(lockedArr);
        }
        componentLocked.set(compLockedSets);
      }
    }
  } catch (e) {
    console.warn('Failed to load theme state from localStorage:', e);
  }

  hasLoadedThemeState = true;
}

// Static imports for component manifests (JSON requires special handling)
// @ts-ignore - JSON import
import webGridManifest from '@keenmate/web-grid/manifest' with { type: 'json' };
// @ts-ignore - JSON import
import webMultiselectManifest from '@keenmate/web-multiselect/component-variables.manifest.json' with { type: 'json' };
// @ts-ignore - JSON import
import webDaterangepickerManifest from '@keenmate/web-daterangepicker/component-variables.manifest.json' with { type: 'json' };

// Map of available manifests (exported for use in variableGroups.ts)
export const manifests: Record<ComponentType, ComponentManifest> = {
  'web-grid': webGridManifest as ComponentManifest,
  'web-multiselect': webMultiselectManifest as ComponentManifest,
  'web-daterangepicker': webDaterangepickerManifest as ComponentManifest,
};

/**
 * Get manifest for a component (synchronous, uses static imports)
 */
export function getManifest(component: ComponentType): ComponentManifest | null {
  return manifests[component] ?? null;
}

// All valid CSS variable prefixes we support
const VALID_PREFIXES = ['--ms-', '--drp-', '--wg-', '--base-'];

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

// Manifest store - loaded when component changes
export const manifest = writable<ComponentManifest | null>(null);

// Export mode: 'full' exports all base vars, 'subset' exports only component's base vars
export type ExportMode = 'full' | 'subset';
export const exportMode = writable<ExportMode>('full');

// Active preset name for export metadata (set by userPresets store)
export const activePresetName = writable<string | null>(null);

// Load manifest when component changes (synchronous since we use static imports)
selectedComponent.subscribe((component) => {
  const loadedManifest = getManifest(component);
  manifest.set(loadedManifest);
});

// Filtered base variables based on manifest (null = show all)
export const filteredBaseVarNames = derived(manifest, ($manifest) => {
  if (!$manifest) return null;
  return new Set($manifest.baseVariables.map((v) => `--${v.name}`));
});

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

// User overrides for individual variables (global)
export const overrides = writable<Record<string, string>>({});

// Set of locked variable names (won't be recalculated when base colors change)
export const locked = writable<Set<string>>(new Set());

// Component-specific overrides for base variables
// Key is component name (e.g., "web-grid"), value is map of base variable overrides
export const componentOverrides = writable<Record<string, Record<string, string>>>({});

// Component-specific locked variables
// Key is component name, value is set of locked variable names
export const componentLocked = writable<Record<string, Set<string>>>({});

// Effective locked set - merges global locks with component-scoped locks for current component
export const effectiveLocked = derived(
  [locked, componentLocked, selectedComponent],
  ([$locked, $compLocked, $component]) => {
    const result = new Set($locked);
    if ($component && $compLocked[$component]) {
      for (const varName of $compLocked[$component]) {
        result.add(varName);
      }
    }
    return result;
  }
);

// Auto-save theme state to localStorage when stores change
colors.subscribe(() => saveThemeState());
overrides.subscribe(() => saveThemeState());
locked.subscribe(() => saveThemeState());
selectedComponent.subscribe(() => saveThemeState());
componentOverrides.subscribe(() => saveThemeState());
componentLocked.subscribe(() => saveThemeState());

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

// Final base theme merges calculated base with locked overrides (global + component-scoped)
export const finalBaseTheme = derived(
  [baseTheme, overrides, locked, selectedComponent, componentOverrides, componentLocked],
  ([$base, $over, $locked, $component, $compOver, $compLocked]) => {
    const result = { ...$base };

    // Apply global locked overrides
    for (const key of $locked) {
      if (key.startsWith('--base-') && $over[key] !== undefined) {
        result[key] = $over[key];
      }
    }

    // Apply component-scoped overrides for selected component
    if ($component && $compOver[$component]) {
      const compLockedSet = $compLocked[$component] ?? new Set();
      for (const [key, value] of Object.entries($compOver[$component])) {
        if (compLockedSet.has(key)) {
          result[key] = value;
        }
      }
    }

    return result;
  }
);

// Helper to generate metadata header
function generateMetadataHeader(presetName: string | null, colors: ColorState, format: 'css' | 'scss'): string {
  const name = presetName || 'Untitled Theme';
  const timestamp = new Date().toISOString();
  const lines = [
    `/*`,
    ` * Theme: ${name}`,
    ` * Generated: ${timestamp}`,
    ` * Colors: bg=${colors.background}, text=${colors.text}, accent=${colors.accent}`,
    ` *`,
    ` * Generated by KeenMate Theme Designer`,
    ` * https://theme-designer.keenmate.dev`,
    ` */`,
  ];
  return lines.join('\n');
}

// Export formats - exports base vars (full or subset) + user-overridden component vars + component-scoped base overrides
export const cssOutput = derived(
  [finalBaseTheme, overrides, locked, selectedComponent, colors, exportMode, filteredBaseVarNames, activePresetName, componentOverrides, componentLocked],
  ([$finalBase, $over, $locked, $component, $colors, $exportMode, $filteredVars, $presetName, $compOverrides, $compLocked]) => {
    const metadata = generateMetadataHeader($presetName, $colors, 'css');
    const importStatement = $colors.fontImport ? `${$colors.fontImport}\n\n` : '';
    const prefix = COMPONENT_PREFIXES[$component];

    // Filter base vars based on export mode
    let baseVarsToExport = $finalBase;
    if ($exportMode === 'subset' && $filteredVars) {
      baseVarsToExport = {};
      for (const [key, value] of Object.entries($finalBase)) {
        if ($filteredVars.has(key)) {
          baseVarsToExport[key] = value;
        }
      }
    }

    const baseProps = Object.entries(baseVarsToExport)
      .map(([prop, value]) => `  ${prop}: ${value};`)
      .join('\n');

    // Only export component vars that user explicitly overrode (global)
    const globalComponentOverrides: Record<string, string> = {};
    for (const key of $locked) {
      if (key.startsWith(`--${prefix}-`) && $over[key] !== undefined) {
        globalComponentOverrides[key] = $over[key];
      }
    }

    let output = `${metadata}\n\n${importStatement}:root {\n${baseProps}\n}`;

    // Add global component overrides if any
    if (Object.keys(globalComponentOverrides).length > 0) {
      const componentProps = Object.entries(globalComponentOverrides)
        .map(([prop, value]) => `  ${prop}: ${value};`)
        .join('\n');
      output += `\n\n/* Component Overrides */\n:root {\n${componentProps}\n}`;
    }

    // Add component-scoped base variable overrides
    const componentSelectors: Record<string, string> = {
      'web-grid': 'web-grid',
      'web-multiselect': 'web-multiselect, multi-select',
      'web-daterangepicker': 'date-range-picker',
    };

    for (const [comp, compOvers] of Object.entries($compOverrides)) {
      const lockedSet = $compLocked[comp] ?? new Set();
      const lockedOverrides: Record<string, string> = {};

      for (const [varName, value] of Object.entries(compOvers)) {
        if (lockedSet.has(varName)) {
          lockedOverrides[varName] = value;
        }
      }

      if (Object.keys(lockedOverrides).length > 0) {
        const selector = componentSelectors[comp] ?? comp;
        const props = Object.entries(lockedOverrides)
          .map(([prop, value]) => `  ${prop}: ${value};`)
          .join('\n');
        output += `\n\n/* ${comp} Overrides */\n${selector} {\n${props}\n}`;
      }
    }

    return output;
  }
);

export const jsonOutput = derived(
  [finalBaseTheme, overrides, locked, selectedComponent, colors, exportMode, filteredBaseVarNames, activePresetName],
  ([$finalBase, $over, $locked, $component, $colors, $exportMode, $filteredVars, $presetName]) => {
    const prefix = COMPONENT_PREFIXES[$component];

    // Build metadata object
    const _meta = {
      name: $presetName || 'Untitled Theme',
      generated: new Date().toISOString(),
      colors: {
        background: $colors.background,
        text: $colors.text,
        accent: $colors.accent,
      },
      generator: 'KeenMate Theme Designer',
      url: 'https://theme-designer.keenmate.dev',
    };

    // Filter base vars based on export mode
    let baseVarsToExport = $finalBase;
    if ($exportMode === 'subset' && $filteredVars) {
      baseVarsToExport = {};
      for (const [key, value] of Object.entries($finalBase)) {
        if ($filteredVars.has(key)) {
          baseVarsToExport[key] = value;
        }
      }
    }

    // Collect user-overridden component vars
    const componentOverrides: Record<string, string> = {};
    for (const key of $locked) {
      if (key.startsWith(`--${prefix}-`) && $over[key] !== undefined) {
        componentOverrides[key] = $over[key];
      }
    }

    if (Object.keys(componentOverrides).length === 0) {
      return JSON.stringify({ _meta, base: baseVarsToExport }, null, 2);
    }

    return JSON.stringify({ _meta, base: baseVarsToExport, component: componentOverrides }, null, 2);
  }
);

export const scssOutput = derived(
  [finalBaseTheme, overrides, locked, selectedComponent, colors, exportMode, filteredBaseVarNames, activePresetName],
  ([$finalBase, $over, $locked, $component, $colors, $exportMode, $filteredVars, $presetName]) => {
    const metadata = generateMetadataHeader($presetName, $colors, 'scss');
    const prefix = COMPONENT_PREFIXES[$component];

    // Filter base vars based on export mode
    let baseVarsToExport = $finalBase;
    if ($exportMode === 'subset' && $filteredVars) {
      baseVarsToExport = {};
      for (const [key, value] of Object.entries($finalBase)) {
        if ($filteredVars.has(key)) {
          baseVarsToExport[key] = value;
        }
      }
    }

    // Collect user-overridden component vars
    const componentOverrides: Record<string, string> = {};
    for (const key of $locked) {
      if (key.startsWith(`--${prefix}-`) && $over[key] !== undefined) {
        componentOverrides[key] = $over[key];
      }
    }

    const baseMap = toSCSS(baseVarsToExport, '$base-theme');

    if (Object.keys(componentOverrides).length === 0) {
      return `${metadata}\n\n${baseMap}`;
    }

    const componentMap = toSCSS(componentOverrides, '$component-overrides');
    return `${metadata}\n\n${baseMap}\n\n${componentMap}`;
  }
);

// Keep the old theme export for backwards compatibility
export const theme = finalTheme;

// Resolved theme for live preview - all var() and color-mix() resolved to actual values
// Uses finalBaseTheme to include component-scoped base variable overrides
export const resolvedTheme = derived(
  [finalTheme, finalBaseTheme, colors],
  ([$finalTheme, $finalBaseTheme, $colors]) => {
    const context = buildThemeContext($finalBaseTheme, $finalTheme);
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
 * For --base-* variables: if a component is selected, creates a component-scoped override
 * For component variables (--ms-*, --wg-*, --drp-*): always uses global overrides
 * @param varName - The CSS variable name to lock
 * @param newValue - Optional value to set (if provided, uses this instead of current calculated value)
 */
export function lockVariable(varName: string, newValue?: string) {
  // When locking, save the current calculated value as an override
  const currentTheme = get(calculatedTheme);
  const currentBase = get(baseTheme);
  const currentOverrides = get(overrides);
  const currentCompOverrides = get(componentOverrides);
  const component = get(selectedComponent);

  // Check if this is a base variable and a component is selected
  const isBaseVar = varName.startsWith('--base-');

  if (isBaseVar && component) {
    // Component-scoped base variable override
    // Priority: newValue > current component override > current global override > calculated base
    const valueToLock = newValue ?? currentCompOverrides[component]?.[varName] ?? currentOverrides[varName] ?? currentBase[varName];

    if (valueToLock !== undefined) {
      componentOverrides.update((co) => ({
        ...co,
        [component]: {
          ...(co[component] ?? {}),
          [varName]: valueToLock,
        },
      }));
    }

    componentLocked.update((cl) => {
      const compSet = cl[component] ?? new Set();
      const newCompSet = new Set(compSet);
      newCompSet.add(varName);
      return { ...cl, [component]: newCompSet };
    });
  } else {
    // Global override (for component-specific vars or base vars with no component selected)
    const valueToLock = newValue ?? currentOverrides[varName] ?? currentTheme[varName];

    if (valueToLock !== undefined) {
      overrides.update((o) => ({ ...o, [varName]: valueToLock }));
    }

    locked.update((l) => {
      const newLocked = new Set(l);
      newLocked.add(varName);
      return newLocked;
    });
  }
}

/**
 * Unlock a variable so it will be recalculated when base colors change
 * Checks both global and component-scoped locks
 */
export function unlockVariable(varName: string) {
  const component = get(selectedComponent);
  const isBaseVar = varName.startsWith('--base-');

  // Check if it's a component-scoped lock
  if (isBaseVar && component) {
    const compLocked = get(componentLocked);
    if (compLocked[component]?.has(varName)) {
      // Remove from component-scoped locks
      componentLocked.update((cl) => {
        const compSet = cl[component] ?? new Set();
        const newCompSet = new Set(compSet);
        newCompSet.delete(varName);
        return { ...cl, [component]: newCompSet };
      });

      // Clear component-scoped override
      componentOverrides.update((co) => {
        if (!co[component]) return co;
        const newCompOvers = { ...co[component] };
        delete newCompOvers[varName];
        return { ...co, [component]: newCompOvers };
      });
      return;
    }
  }

  // Global unlock
  locked.update((l) => {
    const newLocked = new Set(l);
    newLocked.delete(varName);
    return newLocked;
  });

  // Clear the override when unlocking
  clearOverride(varName);
}

/**
 * Toggle lock state for a variable
 */
export function toggleLock(varName: string) {
  if (isLocked(varName)) {
    unlockVariable(varName);
  } else {
    lockVariable(varName);
  }
}

/**
 * Check if a variable is locked (globally or for current component)
 */
export function isLocked(varName: string): boolean {
  // Check global lock first
  if (get(locked).has(varName)) return true;

  // For base variables, also check component-scoped lock
  if (varName.startsWith('--base-')) {
    const component = get(selectedComponent);
    if (component) {
      const compLocked = get(componentLocked);
      if (compLocked[component]?.has(varName)) return true;
    }
  }

  return false;
}

/**
 * Get the scope of a locked variable: 'global', component name, or null if not locked
 */
export function getLockedScope(varName: string): string | null {
  // Check global lock first
  if (get(locked).has(varName)) return 'global';

  // For base variables, check component-scoped locks
  if (varName.startsWith('--base-')) {
    const compLocked = get(componentLocked);
    for (const [comp, lockedSet] of Object.entries(compLocked)) {
      if (lockedSet.has(varName)) return comp;
    }
  }

  return null;
}

/**
 * Reset all overrides and locks (including component-scoped)
 */
export function resetOverrides() {
  overrides.set({});
  locked.set(new Set());
  componentOverrides.set({});
  componentLocked.set({});
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

/**
 * Set the export mode (full or subset)
 */
export function setExportMode(mode: ExportMode) {
  exportMode.set(mode);
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
  // Match --ms-*, --drp-*, --wg-*, --base-* variables with their values
  const regex = /(--(?:ms|drp|wg|base)-[a-z0-9-]+)\s*:\s*([^;]+)/gi;
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
  // Match "--ms-*", "--drp-*", "--wg-*", "--base-*": value patterns
  const regex = /"(--(?:ms|drp|wg|base)-[a-z0-9-]+)"\s*:\s*([^,\n)]+)/gi;
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
    (trimmed.includes('(') && (trimmed.includes('"--ms-') || trimmed.includes('"--drp-') || trimmed.includes('"--wg-') || trimmed.includes('"--base-')))
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
  const currentBase = get(baseTheme);
  const prefix = getCurrentPrefix();

  // Extract base colors from imported variables to update the colors store
  // Check for base-* variables first, then component-specific ones
  const newColors: Partial<ColorState> = {};

  // Priority: --base-* > --{prefix}-* (current component)
  const bgKey = variables['--base-primary-bg'] ?? variables[`--${prefix}-primary-bg`];
  const textKey = variables['--base-text-color-1'] ?? variables[`--${prefix}-text-color-1`];
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

  // Lock and override all imported variables
  for (const [varName, value] of Object.entries(variables)) {
    // Skip var() references - we only want resolved values
    if (value.startsWith('var(')) continue;

    // Import --base-* variables
    if (varName.startsWith('--base-') && varName in currentBase) {
      locked.update((l) => {
        const newLocked = new Set(l);
        newLocked.add(varName);
        return newLocked;
      });
      overrides.update((o) => ({ ...o, [varName]: value }));
    }

    // Import component variables that match the current component prefix
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
