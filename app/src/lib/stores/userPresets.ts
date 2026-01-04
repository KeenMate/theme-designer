import { writable, get } from 'svelte/store';
import { colors, overrides, locked, setColors, resetOverrides, activePresetName, componentOverrides, componentLocked } from './theme';
import type { ColorState } from './theme';

// ============================================================================
// Types
// ============================================================================

export interface UserPreset {
  id: string;
  name: string;
  description?: string;
  colors: ColorState;
  overrides?: Record<string, string>;
  componentOverrides?: Record<string, Record<string, string>>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'theme-designer-user-presets';
const ACTIVE_PRESET_KEY = 'theme-designer-active-preset';

// ============================================================================
// Stores
// ============================================================================

/**
 * User presets stored in localStorage
 */
export const userPresets = writable<UserPreset[]>([]);

/**
 * Currently active preset ID (null if no preset loaded or theme was modified)
 */
export const activePresetId = writable<string | null>(null);

// ============================================================================
// localStorage sync
// ============================================================================

/**
 * Flag to track if we've loaded from storage.
 * Prevents the subscription from overwriting localStorage with empty array on init.
 */
let hasLoadedFromStorage = false;

/**
 * Load presets from localStorage
 */
export function loadFromStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserPreset[];
      userPresets.set(parsed);
    }

    // Load active preset ID
    const activeId = localStorage.getItem(ACTIVE_PRESET_KEY);
    if (activeId) {
      activePresetId.set(activeId);
      // Also restore the preset name for export metadata
      const presets = get(userPresets);
      const activePreset = presets.find(p => p.id === activeId);
      if (activePreset) {
        activePresetName.set(activePreset.name);
      }
    }
  } catch (e) {
    console.warn('Failed to load user presets from localStorage:', e);
  }

  // Mark as loaded so subscription can start saving
  hasLoadedFromStorage = true;
}

/**
 * Save presets to localStorage
 */
function saveToStorage(presets: UserPreset[]): void {
  if (typeof window === 'undefined') return;

  // Don't save until we've loaded from storage first
  if (!hasLoadedFromStorage) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (e) {
    console.warn('Failed to save user presets to localStorage:', e);
  }
}

// Subscribe to changes and auto-save
userPresets.subscribe((presets) => {
  saveToStorage(presets);
});

// Save active preset ID to localStorage when it changes
activePresetId.subscribe((id) => {
  if (typeof window === 'undefined') return;
  if (!hasLoadedFromStorage) return;

  if (id) {
    localStorage.setItem(ACTIVE_PRESET_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_PRESET_KEY);
  }
});

// Auto-update active preset when colors change
let isLoadingPreset = false;

colors.subscribe((currentColors) => {
  // Don't update if we're in the middle of loading a preset
  if (isLoadingPreset) return;
  // Don't update before presets are loaded
  if (!hasLoadedFromStorage) return;

  const activeId = get(activePresetId);
  if (!activeId) return;

  const presets = get(userPresets);
  const activePreset = presets.find(p => p.id === activeId);
  if (!activePreset) return;

  // Check if colors actually changed from what's stored in the preset
  const hasChanges = (
    currentColors.background !== activePreset.colors.background ||
    currentColors.text !== activePreset.colors.text ||
    currentColors.accent !== activePreset.colors.accent ||
    (currentColors.fontFamily ?? undefined) !== (activePreset.colors.fontFamily ?? undefined) ||
    (currentColors.fontImport ?? undefined) !== (activePreset.colors.fontImport ?? undefined)
  );

  if (hasChanges) {
    updatePresetWithCurrentTheme(activeId);
  }
});

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Generate a UUID for preset identification
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Get current timestamp in ISO format
 */
function now(): string {
  return new Date().toISOString();
}

// ============================================================================
// Preset CRUD operations
// ============================================================================

/**
 * Check if a preset name already exists
 * Returns the existing preset or null
 */
export function checkNameCollision(name: string): UserPreset | null {
  const presets = get(userPresets);
  const normalized = name.trim().toLowerCase();
  return presets.find(p => p.name.trim().toLowerCase() === normalized) ?? null;
}

/**
 * Save the current theme as a new preset
 * Returns the created preset
 */
export function saveCurrentAsPreset(name: string, description?: string): UserPreset {
  const currentColors = get(colors);
  const currentOverrides = get(overrides);
  const currentLocked = get(locked);
  const currentCompOverrides = get(componentOverrides);
  const currentCompLocked = get(componentLocked);

  // Only save global overrides that are locked
  const savedOverrides: Record<string, string> = {};
  for (const key of currentLocked) {
    if (currentOverrides[key] !== undefined) {
      savedOverrides[key] = currentOverrides[key];
    }
  }

  // Only save component overrides that are locked
  const savedCompOverrides: Record<string, Record<string, string>> = {};
  for (const [comp, compOvers] of Object.entries(currentCompOverrides)) {
    const lockedSet = currentCompLocked[comp];
    if (!lockedSet) continue;

    const compSavedOverrides: Record<string, string> = {};
    for (const [varName, value] of Object.entries(compOvers)) {
      if (lockedSet.has(varName)) {
        compSavedOverrides[varName] = value;
      }
    }

    if (Object.keys(compSavedOverrides).length > 0) {
      savedCompOverrides[comp] = compSavedOverrides;
    }
  }

  const trimmedName = name.trim();
  const preset: UserPreset = {
    id: generateId(),
    name: trimmedName,
    description: description?.trim() || undefined,
    colors: { ...currentColors },
    overrides: Object.keys(savedOverrides).length > 0 ? savedOverrides : undefined,
    componentOverrides: Object.keys(savedCompOverrides).length > 0 ? savedCompOverrides : undefined,
    createdAt: now(),
    updatedAt: now(),
  };

  userPresets.update(presets => [...presets, preset]);
  activePresetId.set(preset.id);
  activePresetName.set(trimmedName);

  return preset;
}

/**
 * Load a preset by ID
 * Applies colors and overrides, sets it as active
 */
export function loadPreset(id: string): boolean {
  const presets = get(userPresets);
  const preset = presets.find(p => p.id === id);

  if (!preset) return false;

  // Prevent auto-update while loading
  isLoadingPreset = true;

  // Reset existing overrides (including component-scoped)
  resetOverrides();

  // Apply preset colors - explicitly include font properties to ensure they're set/cleared
  setColors({
    background: preset.colors.background,
    text: preset.colors.text,
    accent: preset.colors.accent,
    fontFamily: preset.colors.fontFamily ?? undefined,
    fontImport: preset.colors.fontImport ?? undefined,
  });

  // Apply global preset overrides (lock them)
  if (preset.overrides) {
    for (const [varName, value] of Object.entries(preset.overrides)) {
      overrides.update(o => ({ ...o, [varName]: value }));
      locked.update(l => {
        const newLocked = new Set(l);
        newLocked.add(varName);
        return newLocked;
      });
    }
  }

  // Apply component-scoped preset overrides
  if (preset.componentOverrides) {
    for (const [comp, compOvers] of Object.entries(preset.componentOverrides)) {
      componentOverrides.update(co => ({
        ...co,
        [comp]: { ...(co[comp] ?? {}), ...compOvers },
      }));

      for (const varName of Object.keys(compOvers)) {
        componentLocked.update(cl => {
          const compSet = cl[comp] ?? new Set();
          const newCompSet = new Set(compSet);
          newCompSet.add(varName);
          return { ...cl, [comp]: newCompSet };
        });
      }
    }
  }

  activePresetId.set(id);
  activePresetName.set(preset.name);

  // Re-enable auto-update
  isLoadingPreset = false;

  return true;
}

/**
 * Update an existing preset
 */
export function updatePreset(id: string, updates: Partial<Pick<UserPreset, 'name' | 'description'>>): boolean {
  const presets = get(userPresets);
  const index = presets.findIndex(p => p.id === id);

  if (index === -1) return false;

  userPresets.update(list => {
    const updated = [...list];
    updated[index] = {
      ...updated[index],
      ...updates,
      updatedAt: now(),
    };
    return updated;
  });

  return true;
}

/**
 * Update a preset with current theme values
 */
export function updatePresetWithCurrentTheme(id: string): boolean {
  const presets = get(userPresets);
  const index = presets.findIndex(p => p.id === id);

  if (index === -1) return false;

  const currentColors = get(colors);
  const currentOverrides = get(overrides);
  const currentLocked = get(locked);
  const currentCompOverrides = get(componentOverrides);
  const currentCompLocked = get(componentLocked);

  // Only save global overrides that are locked
  const savedOverrides: Record<string, string> = {};
  for (const key of currentLocked) {
    if (currentOverrides[key] !== undefined) {
      savedOverrides[key] = currentOverrides[key];
    }
  }

  // Only save component overrides that are locked
  const savedCompOverrides: Record<string, Record<string, string>> = {};
  for (const [comp, compOvers] of Object.entries(currentCompOverrides)) {
    const lockedSet = currentCompLocked[comp];
    if (!lockedSet) continue;

    const compSavedOverrides: Record<string, string> = {};
    for (const [varName, value] of Object.entries(compOvers)) {
      if (lockedSet.has(varName)) {
        compSavedOverrides[varName] = value;
      }
    }

    if (Object.keys(compSavedOverrides).length > 0) {
      savedCompOverrides[comp] = compSavedOverrides;
    }
  }

  userPresets.update(list => {
    const updated = [...list];
    updated[index] = {
      ...updated[index],
      colors: { ...currentColors },
      overrides: Object.keys(savedOverrides).length > 0 ? savedOverrides : undefined,
      componentOverrides: Object.keys(savedCompOverrides).length > 0 ? savedCompOverrides : undefined,
      updatedAt: now(),
    };
    return updated;
  });

  return true;
}

/**
 * Delete a preset by ID
 */
export function deletePreset(id: string): boolean {
  const presets = get(userPresets);
  const index = presets.findIndex(p => p.id === id);

  if (index === -1) return false;

  userPresets.update(list => list.filter(p => p.id !== id));

  // Clear active if this was the active preset
  if (get(activePresetId) === id) {
    activePresetId.set(null);
    activePresetName.set(null);
  }

  return true;
}

/**
 * Get a preset by ID
 */
export function getPreset(id: string): UserPreset | null {
  const presets = get(userPresets);
  return presets.find(p => p.id === id) ?? null;
}

/**
 * Add a built-in preset to user presets
 * Used when copying from preset browser
 */
export function addBuiltInPreset(
  name: string,
  description: string,
  presetColors: ColorState,
  presetOverrides?: Record<string, string>,
  presetComponentOverrides?: Record<string, Record<string, string>>
): UserPreset {
  const preset: UserPreset = {
    id: generateId(),
    name: name.trim(),
    description: description?.trim() || undefined,
    colors: { ...presetColors },
    overrides: presetOverrides ? { ...presetOverrides } : undefined,
    componentOverrides: presetComponentOverrides ? { ...presetComponentOverrides } : undefined,
    createdAt: now(),
    updatedAt: now(),
  };

  userPresets.update(presets => [...presets, preset]);

  return preset;
}

// ============================================================================
// Active preset tracking
// ============================================================================

/**
 * Clear active preset (call when theme is manually modified)
 */
export function clearActivePreset(): void {
  activePresetId.set(null);
  activePresetName.set(null);
}

/**
 * Check if the current theme matches the active preset
 * Returns false if theme has been modified since loading
 */
export function isActivePresetCurrent(): boolean {
  const id = get(activePresetId);
  if (!id) return false;

  const preset = getPreset(id);
  if (!preset) return false;

  const currentColors = get(colors);

  // Compare colors
  if (
    currentColors.background !== preset.colors.background ||
    currentColors.text !== preset.colors.text ||
    currentColors.accent !== preset.colors.accent
  ) {
    return false;
  }

  return true;
}
