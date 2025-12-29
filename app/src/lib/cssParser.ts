/**
 * Parse CSS custom properties from a CSS string
 * Extracts --variable-name: value pairs
 */

export interface ParsedVariable {
  name: string;
  value: string;
  // The raw value from CSS (may contain var() references)
  rawValue: string;
}

/**
 * Strip CSS comments from a string
 * Handles both single-line and multi-line comments
 */
function stripCSSComments(css: string): string {
  // Remove /* ... */ comments (including multi-line)
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Parse CSS variables from a CSS string
 * @param css - Raw CSS string
 * @param prefix - Variable prefix to filter (e.g., '--ms-', '--drp-')
 * @returns Map of variable names to their values
 */
export function parseCSSVariables(css: string, prefix?: string): Map<string, string> {
  const variables = new Map<string, string>();

  // Strip comments first to avoid matching variable names inside comments
  const cleanCSS = stripCSSComments(css);

  // Match CSS custom property declarations
  // Handles: --var-name: value;
  // Also handles multi-line values and nested var() references
  const regex = /(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/gi;

  let match;
  while ((match = regex.exec(cleanCSS)) !== null) {
    const varName = match[1].trim();
    const value = match[2].trim();

    // Filter by prefix if specified
    if (prefix && !varName.startsWith(prefix)) {
      continue;
    }

    variables.set(varName, value);
  }

  return variables;
}

/**
 * Extract the formula/reference for a CSS variable
 * For var(--base-accent-color, #3b82f6), returns 'var(--base-accent-color)'
 * For simple values like #3b82f6, returns the value as-is
 */
export function extractFormula(value: string): string {
  // Check if value starts with var()
  const varMatch = value.match(/^var\(([^,)]+)/);
  if (varMatch) {
    return `var(${varMatch[1].trim()})`;
  }
  return value;
}

/**
 * Check if a value is a var() reference
 */
export function isVarReference(value: string): boolean {
  return value.trim().startsWith('var(');
}

/**
 * Extract the referenced variable name from a var() expression
 * For var(--base-accent-color, #fallback), returns '--base-accent-color'
 */
export function extractVarName(value: string): string | null {
  const match = value.match(/var\(\s*(--[a-z][a-z0-9-]*)/i);
  return match ? match[1] : null;
}

/**
 * Get all variables grouped by their source (base reference vs computed)
 */
export function categorizeVariables(
  variables: Map<string, string>
): { cascading: Map<string, string>; computed: Map<string, string> } {
  const cascading = new Map<string, string>();
  const computed = new Map<string, string>();

  for (const [name, value] of variables) {
    if (isVarReference(value)) {
      cascading.set(name, value);
    } else {
      computed.set(name, value);
    }
  }

  return { cascading, computed };
}
