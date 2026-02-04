import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Station } from '@/types/station';

interface MapFocusContextValue {
  countryStations: Station[];
  setCountryStations: (stations: Station[]) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  locateStation: (station: Station) => void;
  registerLocate: (fn: (station: Station) => void) => void;
}

const MapFocusContext = createContext<MapFocusContextValue | null>(null);

export function MapFocusProvider({ children }: { children: ReactNode }) {
  const [countryStations, setCountryStations] = useState<Station[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const locateRef = useRef<((station: Station) => void) | null>(null);

  const registerLocate = useCallback((fn: (station: Station) => void) => {
    locateRef.current = fn;
  }, []);

  const locateStation = useCallback((station: Station) => {
    locateRef.current?.(station);
  }, []);

  return (
    <MapFocusContext.Provider value={{
      countryStations,
      setCountryStations,
      showDropdown,
      setShowDropdown,
      locateStation,
      registerLocate,
    }}>
      {children}
    </MapFocusContext.Provider>
  );
}

export function useMapFocus(): MapFocusContextValue {
  const ctx = useContext(MapFocusContext);
  if (!ctx) throw new Error('useMapFocus must be used within MapFocusProvider');
  return ctx;
}
