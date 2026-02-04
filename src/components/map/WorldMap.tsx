import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import type { Station } from '@/types/station';
import { searchStations } from '@/lib/api';
import { StationMarker } from './StationMarker';
import 'leaflet/dist/leaflet.css';
import styles from './WorldMap.module.css';

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
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

function MapController({ center, zoom, focusStationId, stations }: {
  center?: [number, number];
  zoom?: number;
  focusStationId?: string;
  stations: Station[];
}) {
  const map = useMap();
  const hasFocused = useRef(false);

  useEffect(() => {
    if (center && !hasFocused.current) {
      map.setView(center, zoom ?? 14);
      hasFocused.current = true;
    }
  }, [center, zoom, map]);

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
}

export function WorldMap({ onStationSelect, isFavorite, onToggleFavorite, initialCenter, initialZoom, focusStationId }: WorldMapProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const boundsRef = useRef<Bounds | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadStations = useCallback(async (bounds?: Bounds, zoom?: number) => {
    setLoading(true);
    try {
      const results = await searchStations({
        has_geo_info: true,
        limit: 200,
        order: 'clickcount',
        reverse: true,
      });

      if (bounds && zoom !== undefined && zoom >= 8) {
        const filtered = results.filter(s =>
          s.geo_lat !== null && s.geo_long !== null &&
          s.geo_lat >= bounds.south && s.geo_lat <= bounds.north &&
          s.geo_long >= bounds.west && s.geo_long <= bounds.east
        );
        setStations(filtered.length > 0 ? filtered : results);
      } else {
        setStations(results);
      }
    } catch {
      // keep existing stations
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBoundsChange = useCallback((bounds: Bounds, zoom: number) => {
    boundsRef.current = bounds;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadStations(bounds, zoom);
    }, 300);
  }, [loadStations]);

  const center = initialCenter ?? [20, 0] as [number, number];
  const zoom = initialZoom ?? 3;

  return (
    <div className={styles.container}>
      {loading && <div className={styles.loading}>Loading stations...</div>}
      <MapContainer
        center={center}
        zoom={zoom}
        className={styles.map}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapEventHandler onBoundsChange={handleBoundsChange} />
        <MapController
          center={initialCenter}
          zoom={initialZoom}
          focusStationId={focusStationId}
          stations={stations}
        />
        {stations.map(station => (
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
