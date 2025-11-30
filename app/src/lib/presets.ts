import type { ColorState } from './stores/theme';

export interface ThemePreset {
  name: string;
  description: string;
  colors: ColorState;
}

export const presets: ThemePreset[] = [
  {
    name: 'Light',
    description: 'Clean and modern',
    colors: {
      background: '#ffffff',
      text: '#111827',
      accent: '#3b82f6'
    }
  },
  {
    name: 'Dark',
    description: 'Easy on the eyes',
    colors: {
      background: '#1a1a1a',
      text: '#e5e5e5',
      accent: '#667eea'
    }
  },
  {
    name: 'Corporate',
    description: 'Professional red',
    colors: {
      background: '#ffffff',
      text: '#333333',
      accent: '#bb0a30'
    }
  },
  {
    name: 'Neon',
    description: 'Cyberpunk vibes',
    colors: {
      background: '#0a0a0a',
      text: '#00ffff',
      accent: '#ff00ff'
    }
  },
  {
    name: 'Ocean',
    description: 'Calm and cool',
    colors: {
      background: '#f0f9ff',
      text: '#0c4a6e',
      accent: '#0284c7'
    }
  },
  {
    name: 'Forest',
    description: 'Natural greens',
    colors: {
      background: '#f0fdf4',
      text: '#14532d',
      accent: '#16a34a'
    }
  },
  {
    name: 'Sunset',
    description: 'Warm evening',
    colors: {
      background: '#1c1917',
      text: '#fef3c7',
      accent: '#f59e0b'
    }
  },
  {
    name: 'Midnight',
    description: 'Deep purple night',
    colors: {
      background: '#0f172a',
      text: '#e2e8f0',
      accent: '#8b5cf6'
    }
  }
];
