import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Radio, MapPin } from 'lucide-react';
import type { Station } from '@/types/station';
import { usePlayer } from '@/context/PlayerContext';
import styles from './StationCard.module.css';

interface StationCardProps {
  station: Station;
  isFavorite: boolean;
  onToggleFavorite: (station: Station) => void;
}

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return '';
  const offset = 0x1F1E6;
  return String.fromCodePoint(
    code.charCodeAt(0) - 65 + offset,
    code.charCodeAt(1) - 65 + offset
  );
}

export function StationCard({ station, isFavorite, onToggleFavorite }: StationCardProps) {
  const { currentStation, isPlaying, isLoading, togglePlay } = usePlayer();
  const navigate = useNavigate();
  const isActive = currentStation?.stationuuid === station.stationuuid;
  const tags = station.tags ? station.tags.split(',').filter(Boolean).slice(0, 3) : [];

  return (
    <div className={`${styles.card} ${isActive ? styles.active : ''}`}>
      <div className={styles.artwork} onClick={() => togglePlay(station)}>
        {station.favicon ? (
          <img
            src={station.favicon}
            alt=""
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : null}
        <div className={styles.fallback}>
          <Radio size={24} />
        </div>
        <div className={styles.playOverlay}>
          {isActive && isLoading ? (
            <div className={styles.loadingDot} />
          ) : isActive && isPlaying ? (
            <Pause size={22} fill="white" />
          ) : (
            <Play size={22} fill="white" />
          )}
        </div>
      </div>

      <div className={styles.info}>
        <h4 className={styles.name} title={station.name}>
          {station.name}
        </h4>
        <div className={styles.meta}>
          {station.countrycode && (
            <span className={styles.country}>
              {countryFlag(station.countrycode.toUpperCase())} {station.country}
              {station.state && ` · ${station.state}`}
            </span>
          )}
          {station.bitrate > 0 && (
            <span className={styles.bitrate}>{station.bitrate} kbps</span>
          )}
        </div>
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag.trim()}</span>
            ))}
          </div>
        )}
      </div>

      {station.geo_lat !== null && station.geo_long !== null && (
        <button
          className={styles.locateBtn}
          onClick={() => navigate(`/map?lat=${station.geo_lat}&lng=${station.geo_long}&zoom=14&station=${station.stationuuid}`)}
          title="Locate on map"
        >
          <MapPin size={16} />
        </button>
      )}

      <button
        className={`${styles.favBtn} ${isFavorite ? styles.favActive : ''}`}
        onClick={() => onToggleFavorite(station)}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
