import type { RGB, HSL } from './types';

// =============================================================================
// COLOR CONVERSIONS
// =============================================================================

/**
 * Convert hex color to RGB
 * @param hex - Hex color string (e.g., '#ff5500' or 'ff5500')
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Handle shorthand (e.g., 'f00' -> 'ff0000')
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;

  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

/**
 * Convert HSL to hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// =============================================================================
// LIGHTNESS ADJUSTMENTS
// =============================================================================

/**
 * Get the lightness value of a color (0-100)
 */
export function getLightness(color: string): number {
  return hexToHsl(color).l;
}

/**
 * Lighten a color by a percentage
 * @param color - Hex color
 * @param amount - Amount to lighten (0-100)
 */
export function lighten(color: string, amount: number): string {
  const hsl = hexToHsl(color);
  hsl.l = Math.min(100, hsl.l + amount);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Darken a color by a percentage
 * @param color - Hex color
 * @param amount - Amount to darken (0-100)
 */
export function darken(color: string, amount: number): string {
  const hsl = hexToHsl(color);
  hsl.l = Math.max(0, hsl.l - amount);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Saturate a color by a percentage
 */
export function saturate(color: string, amount: number): string {
  const hsl = hexToHsl(color);
  hsl.s = Math.min(100, hsl.s + amount);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Desaturate a color by a percentage
 */
export function desaturate(color: string, amount: number): string {
  const hsl = hexToHsl(color);
  hsl.s = Math.max(0, hsl.s - amount);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

// =============================================================================
// TRANSPARENCY
// =============================================================================

/**
 * Convert a hex color to rgba with given opacity
 * @param color - Hex color
 * @param opacity - Opacity value (0-1)
 */
export function alpha(color: string, opacity: number): string {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// =============================================================================
// CONTRAST
// =============================================================================

/**
 * Calculate relative luminance of a color (WCAG formula)
 */
export function luminance(color: string): number {
  const { r, g, b } = hexToRgb(color);

  const toLinear = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculate contrast ratio between two colors (WCAG)
 * @returns Contrast ratio (1-21)
 */
export function contrastRatio(color1: string, color2: string): number {
  const l1 = luminance(color1);
  const l2 = luminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get the best contrasting color (black or white) for a background
 * Uses WCAG luminance calculation
 */
export function contrast(bgColor: string): '#ffffff' | '#000000' {
  const lum = luminance(bgColor);
  // Use 0.179 as threshold (roughly middle of perceptual range)
  return lum > 0.179 ? '#000000' : '#ffffff';
}

// =============================================================================
// MIXING
// =============================================================================

/**
 * Mix two colors together
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @param weight - Weight of color1 (0-100, default 50)
 */
export function mix(color1: string, color2: string, weight: number = 50): string {
  const w = weight / 100;
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  return rgbToHex(
    Math.round(rgb1.r * w + rgb2.r * (1 - w)),
    Math.round(rgb1.g * w + rgb2.g * (1 - w)),
    Math.round(rgb1.b * w + rgb2.b * (1 - w))
  );
}

// =============================================================================
// COLOR HARMONY (HUE ROTATION)
// =============================================================================

/**
 * Rotate the hue of a color by degrees
 */
export function rotateHue(color: string, degrees: number): string {
  const hsl = hexToHsl(color);
  hsl.h = (hsl.h + degrees + 360) % 360;
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Get the complementary color (opposite on color wheel)
 * +180 degrees
 */
export function complementary(color: string): string {
  return rotateHue(color, 180);
}

/**
 * Get triadic colors (three evenly spaced colors)
 * +120 and +240 degrees
 */
export function triadic(color: string): [string, string] {
  return [
    rotateHue(color, 120),
    rotateHue(color, 240),
  ];
}

/**
 * Get tetradic/square colors (four evenly spaced colors)
 * +90, +180, +270 degrees
 */
export function tetradic(color: string): [string, string, string] {
  return [
    rotateHue(color, 90),
    rotateHue(color, 180),
    rotateHue(color, 270),
  ];
}

/**
 * Get split-complementary colors
 * +150 and +210 degrees (colors adjacent to complement)
 */
export function splitComplementary(color: string): [string, string] {
  return [
    rotateHue(color, 150),
    rotateHue(color, 210),
  ];
}

/**
 * Get analogous colors (adjacent on color wheel)
 * -30 and +30 degrees
 */
export function analogous(color: string): [string, string] {
  return [
    rotateHue(color, -30),
    rotateHue(color, 30),
  ];
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a color string is valid hex
 */
export function isValidHex(color: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

/**
 * Normalize a hex color (ensure # prefix and 6 digits)
 */
export function normalizeHex(color: string): string {
  const clean = color.replace(/^#/, '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  return `#${full.toLowerCase()}`;
}

/**
 * Determine if a color is "dark" (lightness < 50)
 */
export function isDark(color: string): boolean {
  return getLightness(color) < 50;
}

/**
 * Determine if a color is "light" (lightness >= 50)
 */
export function isLight(color: string): boolean {
  return getLightness(color) >= 50;
}
