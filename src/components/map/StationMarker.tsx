import { Marker, Popup } from 'react-leaflet';
import { Play, Heart } from 'lucide-react';
import L from 'leaflet';
import type { Station } from '@/types/station';
import { usePlayer } from '@/context/PlayerContext';
import { renderToStaticMarkup } from 'react-dom/server';
import styles from './StationMarker.module.css';

const markerIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div style={{
      width: 12,
      height: 12,
      background: '#1db954',
      borderRadius: '50%',
      border: '2px solid #0a0a0a',
      boxShadow: '0 0 6px rgba(29,185,84,0.5)',
    }} />
  ),
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const estimatedMarkerIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div style={{
      width: 12,
      height: 12,
      background: '#e89020',
      borderRadius: '50%',
      border: '2px solid #0a0a0a',
      boxShadow: '0 0 6px rgba(232,144,32,0.5)',
    }} />
  ),
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface StationMarkerProps {
  station: Station;
  onSelect?: (station: Station) => void;
  isFavorite: boolean;
  onToggleFavorite: (station: Station) => void;
}

export function StationMarker({ station, onSelect, isFavorite, onToggleFavorite }: StationMarkerProps) {
  const { togglePlay, currentStation, isPlaying } = usePlayer();
  const isActive = currentStation?.stationuuid === station.stationuuid;

  if (station.geo_lat === null || station.geo_long === null) return null;

  const isEstimated = station._estimatedGeo === true;

  return (
    <Marker
      position={[station.geo_lat, station.geo_long]}
      icon={isEstimated ? estimatedMarkerIcon : markerIcon}
    >
      <Popup className={styles.popup}>
        <div className={styles.content}>
          <h4 className={styles.name}>{station.name}</h4>
          <p className={styles.meta}>
            {station.country}
            {station.state && ` · ${station.state}`}
            {station.bitrate > 0 && ` · ${station.bitrate} kbps`}
          </p>
          {isEstimated && (
            <p className={styles.estimated}>Approximate location</p>
          )}
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
