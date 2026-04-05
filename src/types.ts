/**
 * Base color input for theme generation
 */
export interface ThemeInput {
  /** Main background color (hex format, e.g., '#1a1a1a') */
  background: string;
  /** Primary text color (hex format, e.g., '#e5e5e5') */
  text: string;
  /** Accent/brand color (hex format, e.g., '#667eea') */
  accent: string;
  /** Font family (optional, defaults to system fonts) */
  fontFamily?: string;
  /** Google Fonts @import URL (optional) */
  fontImport?: string;
}

/**
 * Supported component types for theme generation
 */
export type ComponentType = 'web-multiselect' | 'web-daterangepicker' | 'web-treeview' | 'web-grid';

/**
 * RGB color representation
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * HSL color representation
 */
export interface HSL {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

/**
 * Theme generator function signature
 */
export type ThemeGenerator = (input: ThemeInput) => Record<string, string>;

/**
 * Generated theme with base layer and component-specific variables
 */
export interface GeneratedTheme {
  /** Base layer variables (--base-*) with resolved values */
  base: Record<string, string>;
  /** Component variables with var() references to base layer */
  component: Record<string, string>;
  /** Component variables with resolved values (standalone mode) */
  componentResolved: Record<string, string>;
}

/**
 * Full theme generator function signature (returns all three layers)
 */
export type FullThemeGenerator = (input: ThemeInput) => GeneratedTheme;

/**
 * Export options for theme output
 */
export interface ExportOptions {
  /** CSS selector to use (default: ':root') */
  selector?: string;
  /** Whether to use cascading var() references or resolved values */
  cascading?: boolean;
  /** Whether to include the base layer in output */
  includeBase?: boolean;
}

/**
 * Component manifest describing base and component-specific CSS variables
 */
export interface ComponentManifest {
  /** JSON schema reference (optional) */
  $schema?: string;
  /** Package name (e.g., '@keenmate/web-grid') */
  component: string;
  /** CSS variable prefix (e.g., 'wg' for --wg-*) */
  prefix: string;
  /** Base variables the component depends on */
  baseVariables: BaseVariableDefinition[];
  /** Component-specific CSS variables */
  componentVariables: ComponentVariableDefinition[];
}

/**
 * Definition of a base CSS variable used by a component
 */
export interface BaseVariableDefinition {
  /** Variable name without '--' prefix (e.g., 'base-accent-color') */
  name: string;
  /** Whether this variable is required for theming */
  required: boolean;
  /** Human-readable description of how this variable is used */
  usage: string;
}

/**
 * Definition of a component-specific CSS variable
 */
export interface ComponentVariableDefinition {
  /** Variable name without '--' prefix (e.g., 'wg-accent-color') */
  name: string;
  /** Category for UI grouping (e.g., 'accent', 'header', 'cell') */
  category: string;
  /** Human-readable description of what this variable controls */
  usage: string;
}
