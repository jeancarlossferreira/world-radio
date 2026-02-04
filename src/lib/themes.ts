export interface Theme {
  id: string;
  name: string;
  colors: {
    '--bg-primary': string;
    '--bg-secondary': string;
    '--bg-tertiary': string;
    '--bg-elevated': string;
    '--bg-hover': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--text-muted': string;
    '--accent': string;
    '--accent-hover': string;
    '--accent-muted': string;
    '--border': string;
    '--shadow': string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      '--bg-primary': '#0a0a0a',
      '--bg-secondary': '#141414',
      '--bg-tertiary': '#1a1a1a',
      '--bg-elevated': '#242424',
      '--bg-hover': '#2a2a2a',
      '--text-primary': '#e8e8e8',
      '--text-secondary': '#a0a0a0',
      '--text-muted': '#666',
      '--accent': '#1db954',
      '--accent-hover': '#1ed760',
      '--accent-muted': 'rgba(29, 185, 84, 0.15)',
      '--border': '#2a2a2a',
      '--shadow': '0 4px 12px rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: {
      '--bg-primary': '#0b0e17',
      '--bg-secondary': '#111827',
      '--bg-tertiary': '#1a2234',
      '--bg-elevated': '#243044',
      '--bg-hover': '#2a3a52',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--accent': '#4a9eff',
      '--accent-hover': '#6bb3ff',
      '--accent-muted': 'rgba(74, 158, 255, 0.15)',
      '--border': '#1e293b',
      '--shadow': '0 4px 12px rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'purple',
    name: 'Purple Haze',
    colors: {
      '--bg-primary': '#0e0a15',
      '--bg-secondary': '#16101f',
      '--bg-tertiary': '#1e162c',
      '--bg-elevated': '#2a1f3d',
      '--bg-hover': '#342a4a',
      '--text-primary': '#ede9fe',
      '--text-secondary': '#a78bfa',
      '--text-muted': '#7c3aed',
      '--accent': '#a855f7',
      '--accent-hover': '#c084fc',
      '--accent-muted': 'rgba(168, 85, 247, 0.15)',
      '--border': '#2a1f3d',
      '--shadow': '0 4px 12px rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'crimson',
    name: 'Crimson',
    colors: {
      '--bg-primary': '#0f0a0a',
      '--bg-secondary': '#1a1111',
      '--bg-tertiary': '#221717',
      '--bg-elevated': '#2e1e1e',
      '--bg-hover': '#3a2626',
      '--text-primary': '#fce8e8',
      '--text-secondary': '#d4a0a0',
      '--text-muted': '#8b5c5c',
      '--accent': '#ef4444',
      '--accent-hover': '#f87171',
      '--accent-muted': 'rgba(239, 68, 68, 0.15)',
      '--border': '#2e1e1e',
      '--shadow': '0 4px 12px rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    colors: {
      '--bg-primary': '#0f0d0a',
      '--bg-secondary': '#1a1714',
      '--bg-tertiary': '#221f1a',
      '--bg-elevated': '#2e2922',
      '--bg-hover': '#3a342a',
      '--text-primary': '#faf5ee',
      '--text-secondary': '#c8b89a',
      '--text-muted': '#8a7a60',
      '--accent': '#f59e0b',
      '--accent-hover': '#fbbf24',
      '--accent-muted': 'rgba(245, 158, 11, 0.15)',
      '--border': '#2e2922',
      '--shadow': '0 4px 12px rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      '--bg-primary': '#f8f9fa',
      '--bg-secondary': '#ffffff',
      '--bg-tertiary': '#f0f1f3',
      '--bg-elevated': '#e5e7eb',
      '--bg-hover': '#dfe1e5',
      '--text-primary': '#111827',
      '--text-secondary': '#4b5563',
      '--text-muted': '#9ca3af',
      '--accent': '#1db954',
      '--accent-hover': '#1ed760',
      '--accent-muted': 'rgba(29, 185, 84, 0.12)',
      '--border': '#e5e7eb',
      '--shadow': '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
  },
];

export const DEFAULT_THEME_ID = 'dark';
