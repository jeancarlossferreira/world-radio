import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Station } from '@/types/station';
import { searchStations, getStationsByCountry } from '@/lib/api';
import { useMapFocus } from '@/context/MapFocusContext';
import { StationMarker } from './StationMarker';
import { NoStationOverlay } from './NoStationOverlay';
import { COUNTRY_BBOXES } from '@/lib/country-bboxes';
import 'leaflet/dist/leaflet.css';
import styles from './WorldMap.module.css';

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

let globalStationsCache: Station[] | null = null;

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function assignApproximateCoords(stations: Station[], countryCode: string): Station[] {
  const bbox = COUNTRY_BBOXES[countryCode];
  if (!bbox) return stations;
  const [south, north, west, east] = bbox;
  const latRange = north - south;
  const lngRange = east - west;
  const latPad = latRange * 0.2;
  const lngPad = lngRange * 0.2;

  return stations.map(s => {
    if (s.geo_lat !== null && s.geo_long !== null) return s;
    const h = hashCode(s.stationuuid);
    const h2 = hashCode(s.stationuuid + '_lng');
    const lat = (south + latPad) + ((h % 10000) / 10000) * (latRange - 2 * latPad);
    const lng = (west + lngPad) + ((h2 % 10000) / 10000) * (lngRange - 2 * lngPad);
    return { ...s, geo_lat: lat, geo_long: lng, _estimatedGeo: true };
  });
}

function getCountryCodesInBounds(bounds: Bounds): string[] {
  const codes: string[] = [];
  for (const [code, bbox] of Object.entries(COUNTRY_BBOXES)) {
    const [south, north, west, east] = bbox;
    const overlaps =
      south <= bounds.north && north >= bounds.south &&
      west <= bounds.east && east >= bounds.west;
    if (overlaps) codes.push(code);
  }
  return codes;
}

function MapEventHandler({ onBoundsChange }: { onBoundsChange: (bounds: Bounds, zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const b = map.getBounds();
    onBoundsChange(
      { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() },
      map.getZoom()
    );
  }, []);

  useMapEvents({
    moveend: (e) => {
      const m = e.target;
      const b = m.getBounds();
      onBoundsChange(
        { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() },
        m.getZoom()
      );
    },
  });
  return null;
}

function MapController({ center, zoom, focusStationId, focusBounds, stations }: {
  center?: [number, number];
  zoom?: number;
  focusStationId?: string;
  focusBounds?: [[number, number], [number, number]];
  stations: Station[];
}) {
  const map = useMap();
  const hasFocused = useRef(false);

  useEffect(() => {
    if (hasFocused.current) return;
    if (focusBounds) {
      map.fitBounds(focusBounds, { padding: [30, 30] });
      hasFocused.current = true;
    } else if (center) {
      map.setView(center, zoom ?? 14);
      hasFocused.current = true;
    }
  }, [center, zoom, focusBounds, map]);

  useEffect(() => {
    if (focusStationId && stations.length > 0 && hasFocused.current) {
      const station = stations.find(s => s.stationuuid === focusStationId);
      if (station && station.geo_lat !== null && station.geo_long !== null) {
        map.eachLayer(layer => {
          if ('getLatLng' in layer) {
            const latlng = (layer as any).getLatLng();
            if (
              Math.abs(latlng.lat - station.geo_lat!) < 0.001 &&
              Math.abs(latlng.lng - station.geo_long!) < 0.001
            ) {
              (layer as any).openPopup();
            }
          }
        });
      }
    }
  }, [focusStationId, stations, map]);

  return null;
}

interface WorldMapProps {
  onStationSelect?: (station: Station) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (station: Station) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  focusStationId?: string;
  focusCountry?: string;
}

export function WorldMap({ onStationSelect, isFavorite, onToggleFavorite, initialCenter, initialZoom, focusStationId, focusCountry }: WorldMapProps) {
  const [visibleStations, setVisibleStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const stationMapRef = useRef<Map<string, Station>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const countryTierRef = useRef<Map<string, number>>(new Map());
  const boundsRef = useRef<Bounds | null>(null);
  const zoomRef = useRef<number>(3);
  const mapRef = useRef<L.Map | null>(null);
  const { setCountryStations, setShowDropdown, registerLocate } = useMapFocus();

  const focusBounds = useRef<[[number, number], [number, number]] | undefined>(undefined);

  if (focusCountry && COUNTRY_BBOXES[focusCountry]) {
    const [south, north, west, east] = COUNTRY_BBOXES[focusCountry];
    focusBounds.current = [[south, west], [north, east]];
  }

  const handleLocateStation = useCallback((station: Station) => {
    if (station.geo_lat !== null && station.geo_long !== null && mapRef.current) {
      const map = mapRef.current;
      map.setView([station.geo_lat, station.geo_long], Math.max(map.getZoom(), 10));
      setTimeout(() => {
        map.eachLayer((layer: any) => {
          if ('getLatLng' in layer) {
            const latlng = layer.getLatLng();
            if (
              Math.abs(latlng.lat - station.geo_lat!) < 0.001 &&
              Math.abs(latlng.lng - station.geo_long!) < 0.001
            ) {
              layer.openPopup();
            }
          }
        });
      }, 300);
    }
  }, []);

  useEffect(() => {
    registerLocate(handleLocateStation);
  }, [registerLocate, handleLocateStation]);

  function getTier(zoom: number): number {
    if (zoom >= 8) return 3;
    if (zoom >= 6) return 2;
    if (zoom >= 4) return 1;
    return 0;
  }

  function getLimitForTier(tier: number): number {
    if (tier >= 3) return 500;
    if (tier >= 2) return 200;
    if (tier >= 1) return 50;
    return 10;
  }

  function getMaxMarkers(zoom: number): number {
    if (zoom >= 10) return 2000;
    if (zoom >= 8) return 800;
    if (zoom >= 6) return 400;
    if (zoom >= 5) return 200;
    if (zoom >= 4) return 100;
    return 60;
  }

  function filterToViewport(allStations: Station[], bounds: Bounds | null, zoom: number) {
    let filtered: Station[];
    if (!bounds || zoom <= 3) {
      filtered = allStations;
    } else {
      filtered = allStations.filter(s =>
        s.geo_lat !== null && s.geo_long !== null &&
        s.geo_lat >= bounds.south && s.geo_lat <= bounds.north &&
        s.geo_long >= bounds.west && s.geo_long <= bounds.east
      );
    }

    const max = getMaxMarkers(zoom);
    if (filtered.length <= max) return filtered;

    const byCountry = new Map<string, Station[]>();
    for (const s of filtered) {
      const cc = s.countrycode || '_';
      if (!byCountry.has(cc)) byCountry.set(cc, []);
      byCountry.get(cc)!.push(s);
    }

    const guaranteed: Station[] = [];
    const rest: Station[] = [];

    for (const [, stations] of byCountry) {
      stations.sort((a, b) => b.clickcount - a.clickcount);
      guaranteed.push(stations[0]);
      for (let i = 1; i < stations.length; i++) {
        rest.push(stations[i]);
      }
    }

    rest.sort((a, b) => b.clickcount - a.clickcount);
    const remaining = Math.max(0, max - guaranteed.length);
    return [...guaranteed, ...rest.slice(0, remaining)];
  }

  useEffect(() => {
    if (globalStationsCache) {
      globalStationsCache.forEach(s => stationMapRef.current.set(s.stationuuid, s));
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchStations({
      has_geo_info: true,
      limit: 500,
      order: 'clickcount',
      reverse: true,
    }).then(results => {
      if (cancelled) return;
      globalStationsCache = results;
      results.forEach(s => stationMapRef.current.set(s.stationuuid, s));
      setVisibleStations(results);
    }).catch(() => {
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!focusCountry) return;

    let cancelled = false;
    setLoading(true);

    getStationsByCountry(focusCountry, 500).then(results => {
      if (cancelled) return;
      const withCoords = assignApproximateCoords(results, focusCountry);
      setCountryStations(withCoords);
      setShowDropdown(true);
      withCoords.forEach(s => stationMapRef.current.set(s.stationuuid, s));
      countryTierRef.current.set(focusCountry, 3);
      const all = Array.from(stationMapRef.current.values());
      setVisibleStations(filterToViewport(all, boundsRef.current, zoomRef.current));
    }).catch(() => {
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [focusCountry, setCountryStations, setShowDropdown]);

  const loadRegionalStations = useCallback(async (bounds: Bounds, zoom: number) => {
    const tier = getTier(zoom);
    const countryCodes = getCountryCodesInBounds(bounds);

    const codesToLoad = countryCodes.filter(c => {
      const loadedTier = countryTierRef.current.get(c);
      return loadedTier === undefined || loadedTier < tier;
    });

    if (codesToLoad.length === 0) return;

    const batch = codesToLoad.slice(0, 6);
    const limit = getLimitForTier(tier);

    setLoading(true);
    try {
      const fetches = batch.map(code =>
        searchStations({
          countrycode: code,
          has_geo_info: true,
          limit,
          order: 'clickcount',
          reverse: true,
        }).then(results => {
          countryTierRef.current.set(code, tier);
          return results;
        }).catch(() => [] as Station[])
      );

      const allResults = await Promise.all(fetches);
      const newStations = allResults.flat();

      if (newStations.length > 0) {
        newStations.forEach(s => stationMapRef.current.set(s.stationuuid, s));
        const all = Array.from(stationMapRef.current.values());
        setVisibleStations(filterToViewport(all, boundsRef.current, zoomRef.current));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBoundsChange = useCallback((bounds: Bounds, zoom: number) => {
    boundsRef.current = bounds;
    zoomRef.current = zoom;

    setVisibleStations(filterToViewport(
      Array.from(stationMapRef.current.values()), bounds, zoom
    ));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadRegionalStations(bounds, zoom);
    }, 500);
  }, [loadRegionalStations]);

  const center = initialCenter ?? [20, 0] as [number, number];
  const zoom = initialZoom ?? 3;

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className={styles.overlay + ' top-3 left-1/2 -translate-x-1/2'}>
          <span className="loading loading-spinner loading-xs" />
          Loading stations...
        </div>
      )}
      <div className={styles.overlay + ' top-3 right-3'}>
        {visibleStations.length} stations
      </div>
      <MapContainer
        center={center}
        zoom={Math.max(zoom, 3)}
        minZoom={3}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        className="w-full h-full bg-base-300"
        scrollWheelZoom={true}
        zoomControl={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />
        <NoStationOverlay />
        <MapEventHandler onBoundsChange={handleBoundsChange} />
        <MapController
          center={initialCenter}
          zoom={initialZoom}
          focusStationId={focusStationId}
          focusBounds={focusBounds.current}
          stations={visibleStations}
        />
        {visibleStations.map(station => (
          station.geo_lat !== null && station.geo_long !== null && (
            <StationMarker
              key={station.stationuuid}
              station={station}
              onSelect={onStationSelect}
              isFavorite={isFavorite(station.stationuuid)}
              onToggleFavorite={onToggleFavorite}
            />
          )
        ))}
      </MapContainer>
    </div>
  );
}
