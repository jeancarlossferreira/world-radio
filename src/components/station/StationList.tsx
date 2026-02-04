import type { Station } from '@/types/station';
import { StationCard } from './StationCard';

interface StationListProps {
  stations: Station[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (station: Station) => void;
}

export function StationList({ stations, isFavorite, onToggleFavorite }: StationListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
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
