import { createContext, useContext, useState, type ReactNode } from 'react';

export type MapTheme = 'dark' | 'light' | 'voyager' | 'satellite';

interface MapThemeContextValue {
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
}

const MapThemeContext = createContext<MapThemeContextValue | null>(null);

const STORAGE_KEY = 'astrotune-map-theme';

export const mapThemeOptions: { value: MapTheme; label: string; url: string; attribution: string }[] = [
  {
    value: 'dark',
    label: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
  },
  {
    value: 'light',
    label: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
  },
  {
    value: 'voyager',
    label: 'Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
  },
  {
    value: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
  },
];

export function MapThemeProvider({ children }: { children: ReactNode }) {
  const [mapTheme, setMapThemeState] = useState<MapTheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['dark', 'light', 'voyager', 'satellite'].includes(stored)) {
        return stored as MapTheme;
      }
    }
    return 'dark';
  });

  const setMapTheme = (theme: MapTheme) => {
    setMapThemeState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  };

  return (
    <MapThemeContext.Provider value={{ mapTheme, setMapTheme }}>
      {children}
    </MapThemeContext.Provider>
  );
}

export function useMapTheme() {
  const context = useContext(MapThemeContext);
  if (!context) {
    throw new Error('useMapTheme must be used within a MapThemeProvider');
  }
  return context;
}
