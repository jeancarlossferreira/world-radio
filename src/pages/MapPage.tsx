import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WorldMap } from '@/components/map/WorldMap';
import { useFavorites } from '@/hooks/useFavorites';

export function MapPage() {
  const { isFav, toggleFav } = useFavorites();
  const [searchParams] = useSearchParams();

  const mapParams = useMemo(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');
    const station = searchParams.get('station');

    if (lat && lng) {
      return {
        center: [parseFloat(lat), parseFloat(lng)] as [number, number],
        zoom: zoom ? parseInt(zoom, 10) : 14,
        stationId: station || undefined,
      };
    }
    return undefined;
  }, [searchParams]);

  const focusCountry = searchParams.get('country') || undefined;

  return (
    <div className="h-full">
      <WorldMap
        isFavorite={isFav}
        onToggleFavorite={toggleFav}
        initialCenter={mapParams?.center}
        initialZoom={mapParams?.zoom}
        focusStationId={mapParams?.stationId}
        focusCountry={focusCountry}
      />
    </div>
  );
}
