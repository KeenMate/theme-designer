/**
 * Component CSS defaults
 * Imports component CSS and extracts default variable values
 */

import { parseCSSVariables } from './cssParser';
import type { ComponentType } from '@keenmate/theme-designer';

// Import CSS as raw strings using Vite's ?raw feature
// These paths point to the installed npm packages
import multiselectCSS from '@keenmate/web-multiselect/src/css/_variables.css?raw';
import daterangepickerCSS from '@keenmate/web-daterangepicker/src/css/_variables.css?raw';
import webGridCSS from '@keenmate/web-grid/src/css/_variables.css?raw';

// Parse variables once at module load
const multiselectDefaults = parseCSSVariables(multiselectCSS, '--ms-');
const daterangepickerDefaults = parseCSSVariables(daterangepickerCSS, '--drp-');
const webGridDefaults = parseCSSVariables(webGridCSS, '--wg-');

/**
 * Get default CSS variable values for a component
 * These are the values defined in the component's _variables.css
 */
export function getComponentDefaults(component: ComponentType): Map<string, string> {
  switch (component) {
    case 'web-multiselect':
      return multiselectDefaults;
    case 'web-daterangepicker':
      return daterangepickerDefaults;
    case 'web-grid':
      return webGridDefaults;
    default:
      return new Map();
  }
}

/**
 * Get all defaults as a plain object (for use in stores)
 */
export function getComponentDefaultsObject(component: ComponentType): Record<string, string> {
  const defaults = getComponentDefaults(component);
  return Object.fromEntries(defaults);
}

/**
 * Check if we have defaults loaded for a component
 */
export function hasComponentDefaults(component: ComponentType): boolean {
  const defaults = getComponentDefaults(component);
  return defaults.size > 0;
}

// Export parsed defaults for direct access
export { multiselectDefaults, daterangepickerDefaults, webGridDefaults };
