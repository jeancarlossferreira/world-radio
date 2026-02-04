import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Play, Heart } from 'lucide-react';
import L from 'leaflet';
import type { Station } from '@/types/station';
import { usePlayer } from '@/context/PlayerContext';
import { useTheme } from '@/context/ThemeContext';
import { renderToStaticMarkup } from 'react-dom/server';
import styles from './StationMarker.module.css';

function createMarkerIcon(accent: string, bg: string) {
  return L.divIcon({
    html: renderToStaticMarkup(
      <div style={{
        width: 12,
        height: 12,
        background: accent,
        borderRadius: '50%',
        border: `2px solid ${bg}`,
        boxShadow: `0 0 6px ${accent}80`,
      }} />
    ),
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

interface StationMarkerProps {
  station: Station;
  onSelect?: (station: Station) => void;
  isFavorite: boolean;
  onToggleFavorite: (station: Station) => void;
}

export function StationMarker({ station, onSelect, isFavorite, onToggleFavorite }: StationMarkerProps) {
  const { togglePlay, currentStation, isPlaying } = usePlayer();
  const { theme } = useTheme();
  const isActive = currentStation?.stationuuid === station.stationuuid;

  const icon = useMemo(
    () => createMarkerIcon(theme.colors['--accent'], theme.colors['--bg-primary']),
    [theme.id]
  );

  if (station.geo_lat === null || station.geo_long === null) return null;

  return (
    <Marker position={[station.geo_lat, station.geo_long]} icon={icon}>
      <Popup className={styles.popup}>
        <div className={styles.content}>
          <h4 className={styles.name}>{station.name}</h4>
          <p className={styles.meta}>
            {station.country}
            {station.state && ` · ${station.state}`}
            {station.bitrate > 0 && ` · ${station.bitrate} kbps`}
          </p>
          <div className={styles.actions}>
            <button
              className={styles.playBtn}
              onClick={() => {
                togglePlay(station);
                onSelect?.(station);
              }}
            >
              <Play size={14} fill="white" />
              {isActive && isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              className={`${styles.favBtn} ${isFavorite ? styles.favActive : ''}`}
              onClick={() => onToggleFavorite(station)}
            >
              <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
