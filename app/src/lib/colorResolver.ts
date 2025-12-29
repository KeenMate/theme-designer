/**
 * Resolve CSS color formulas to actual color values for preview display
 * Handles var() references and color-mix() functions
 */

/**
 * Parse a hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, '');
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(clean)) {
    return null;
  }
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Mix two colors in sRGB color space
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @param weight1 - Weight of color1 (0-100)
 */
function mixColors(color1: string, color2: string, weight1: number): string | null {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return null;

  const w = weight1 / 100;
  return rgbToHex(
    Math.round(rgb1.r * w + rgb2.r * (1 - w)),
    Math.round(rgb1.g * w + rgb2.g * (1 - w)),
    Math.round(rgb1.b * w + rgb2.b * (1 - w))
  );
}

/**
 * Resolve a var() reference to its value
 * Handles: var(--name) and var(--name, fallback)
 */
function resolveVar(
  value: string,
  context: Record<string, string>,
  maxDepth: number = 10
): string {
  if (maxDepth <= 0) return value;

  // Match var(--name) or var(--name, fallback)
  const varRegex = /var\(\s*(--[a-z][a-z0-9-]*)\s*(?:,\s*([^)]+))?\s*\)/gi;

  let result = value;
  let match;

  // Reset regex
  varRegex.lastIndex = 0;

  while ((match = varRegex.exec(value)) !== null) {
    const varName = match[1];
    const fallback = match[2]?.trim();

    // Look up in context
    let resolved = context[varName];

    // Use fallback if not found
    if (resolved === undefined && fallback) {
      resolved = fallback;
    }

    if (resolved !== undefined) {
      // Recursively resolve if the resolved value also contains var()
      if (resolved.includes('var(')) {
        resolved = resolveVar(resolved, context, maxDepth - 1);
      }
      result = result.replace(match[0], resolved);
    }
  }

  return result;
}

/**
 * Parse and compute a color-mix() expression
 * Format: color-mix(in srgb, <color1> <percent>%, <color2>)
 */
function computeColorMix(
  expression: string,
  context: Record<string, string>,
  backgroundColor: string = '#ffffff'
): string | null {
  // Match: color-mix(in srgb, color1 percent%, color2)
  const mixRegex = /color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+(\d+(?:\.\d+)?)%\s*,\s*(.+?)\s*\)/i;
  const match = expression.match(mixRegex);

  if (!match) return null;

  let color1 = match[1].trim();
  const percent = parseFloat(match[2]);
  let color2 = match[3].trim();

  // Resolve any var() references in the colors
  color1 = resolveVar(color1, context);
  color2 = resolveVar(color2, context);

  // Handle transparent - mix with background color
  if (color1 === 'transparent') {
    color1 = backgroundColor;
  }
  if (color2 === 'transparent') {
    color2 = backgroundColor;
  }

  // Normalize hex colors
  if (!color1.startsWith('#')) {
    // Try to find it in context
    const resolved = context[color1];
    if (resolved) color1 = resolved;
  }
  if (!color2.startsWith('#')) {
    const resolved = context[color2];
    if (resolved) color2 = resolved;
  }

  return mixColors(color1, color2, percent);
}

/**
 * Extract a color from a complex CSS value like "3px solid #333" or "3px solid color-mix(...)"
 */
function extractColorPart(value: string): string | null {
  // If value contains color-mix, extract that part
  const colorMixMatch = value.match(/color-mix\([^)]+\)/i);
  if (colorMixMatch) {
    return colorMixMatch[0];
  }

  // Look for hex color
  const hexMatch = value.match(/#[0-9a-fA-F]{3,8}/);
  if (hexMatch) return hexMatch[0];

  // Look for rgb/rgba
  const rgbMatch = value.match(/rgba?\([^)]+\)/);
  if (rgbMatch) return rgbMatch[0];

  // Look for hsl/hsla
  const hslMatch = value.match(/hsla?\([^)]+\)/);
  if (hslMatch) return hslMatch[0];

  return null;
}

/**
 * Check if a value is a simple color (hex, rgb, hsl)
 */
function isSimpleColor(value: string): boolean {
  const trimmed = value.trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(trimmed) ||
         /^rgba?\([^)]+\)$/.test(trimmed) ||
         /^hsla?\([^)]+\)$/.test(trimmed) ||
         trimmed === 'transparent';
}

/**
 * Convert rgb/rgba string to hex
 */
function rgbStringToHex(rgbStr: string): string | null {
  const match = rgbStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  return rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
}

/**
 * Main resolver: takes a CSS value formula and returns a hex color for display
 *
 * @param formula - The CSS value (may contain var(), color-mix(), etc.)
 * @param context - Theme context with all variable values
 * @param backgroundColor - Background color for mixing with transparent (default white)
 * @returns Resolved hex color or null if not a color
 */
export function resolveColorFormula(
  formula: string,
  context: Record<string, string>,
  backgroundColor: string = '#ffffff'
): string | null {
  if (!formula) return null;

  const trimmed = formula.trim();

  // Skip non-color values
  if (trimmed === 'inherit' || trimmed === 'initial' || trimmed === 'unset') {
    return null;
  }

  // Handle transparent
  if (trimmed === 'transparent') {
    return 'transparent';
  }

  // If it's already a simple hex color, return it
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return trimmed.length <= 7 ? trimmed : trimmed.slice(0, 7); // Strip alpha if present
  }

  // Handle rgb/rgba - convert to hex
  if (/^rgba?\(/.test(trimmed)) {
    return rgbStringToHex(trimmed);
  }

  // Extract color part from complex values (like "3px solid #333")
  const colorPart = extractColorPart(trimmed);
  if (!colorPart) {
    // No color found in value - might be a size or other non-color
    return null;
  }

  // If extracted part is a simple color, return it
  if (/^#[0-9a-fA-F]{3,8}$/.test(colorPart)) {
    return colorPart.length <= 7 ? colorPart : colorPart.slice(0, 7);
  }

  // Handle color-mix()
  if (colorPart.toLowerCase().startsWith('color-mix(')) {
    return computeColorMix(colorPart, context, backgroundColor);
  }

  // Handle var() reference
  if (trimmed.includes('var(')) {
    const resolved = resolveVar(trimmed, context);

    // Try again with resolved value
    if (resolved !== trimmed) {
      return resolveColorFormula(resolved, context, backgroundColor);
    }
  }

  return null;
}

/**
 * Build a complete theme context for color resolution
 * Combines base theme and component theme variables
 */
export function buildThemeContext(
  baseTheme: Record<string, string>,
  componentTheme: Record<string, string>
): Record<string, string> {
  return { ...baseTheme, ...componentTheme };
}

/**
 * Resolve all var() references and color-mix() in a CSS value
 * Returns the fully resolved string with actual values
 *
 * @param value - CSS value that may contain var() or color-mix()
 * @param context - Theme context with all variable values
 * @param backgroundColor - Background color for mixing with transparent
 * @returns Fully resolved CSS value
 */
export function resolveValue(
  value: string,
  context: Record<string, string>,
  backgroundColor: string = '#ffffff'
): string {
  if (!value) return value;

  let result = value;

  // First, resolve all var() references
  if (result.includes('var(')) {
    result = resolveVar(result, context);
  }

  // Then, resolve color-mix() expressions
  if (result.toLowerCase().includes('color-mix(')) {
    const colorMixRegex = /color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+(\d+(?:\.\d+)?)%\s*,\s*(.+?)\s*\)/gi;
    result = result.replace(colorMixRegex, (match) => {
      const resolved = computeColorMix(match, context, backgroundColor);
      return resolved || match;
    });
  }

  return result;
}

/**
 * Resolve all CSS formulas in a theme object
 * Returns a new object with all var() and color-mix() resolved to actual values
 *
 * @param theme - Theme object with CSS variable values
 * @param context - Full context including base and component variables
 * @param backgroundColor - Background color for mixing with transparent
 * @returns Theme object with all values resolved
 */
export function resolveTheme(
  theme: Record<string, string>,
  context: Record<string, string>,
  backgroundColor: string = '#ffffff'
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const [key, value] of Object.entries(theme)) {
    resolved[key] = resolveValue(value, context, backgroundColor);
  }

  return resolved;
}
