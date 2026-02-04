import type { Station } from '@/types/station';
import { StationCard } from './StationCard';
import styles from './StationList.module.css';

interface StationListProps {
  stations: Station[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (station: Station) => void;
}

export function StationList({ stations, isFavorite, onToggleFavorite }: StationListProps) {
  return (
    <div className={styles.grid}>
      {stations.map(station => (
        <StationCard
          key={station.stationuuid}
          station={station}
          isFavorite={isFavorite(station.stationuuid)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
