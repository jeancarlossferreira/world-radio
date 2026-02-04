import { useCallback, useState } from 'react';
import type { Station } from '@/types/station';
import * as storage from '@/lib/storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Station[]>(storage.getFavorites);

  const addFav = useCallback((station: Station) => {
    setFavorites(storage.addFavorite(station));
  }, []);

  const removeFav = useCallback((stationuuid: string) => {
    setFavorites(storage.removeFavorite(stationuuid));
  }, []);

  const toggleFav = useCallback((station: Station) => {
    if (storage.isFavorite(station.stationuuid)) {
      setFavorites(storage.removeFavorite(station.stationuuid));
    } else {
      setFavorites(storage.addFavorite(station));
    }
  }, []);

  const isFav = useCallback((stationuuid: string) => {
    return favorites.some(f => f.stationuuid === stationuuid);
  }, [favorites]);

  return { favorites, addFav, removeFav, toggleFav, isFav };
}
