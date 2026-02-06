/**
 * @fileoverview Custom React hook for managing favorite stations.
 *
 * This hook provides a reactive interface to the favorites stored in
 * localStorage. It syncs React state with localStorage, so UI updates
 * automatically when favorites change.
 *
 * Why a custom hook?
 * - Encapsulates favorites logic (add, remove, check)
 * - Syncs localStorage with React state for reactivity
 * - Provides memoized callbacks to prevent unnecessary re-renders
 *
 * @example
 * function StationCard({ station }) {
 *   const { isFav, toggleFav } = useFavorites();
 *
 *   return (
 *     <button onClick={() => toggleFav(station)}>
 *       {isFav(station.stationuuid) ? '❤️' : '🤍'}
 *     </button>
 *   );
 * }
 */

import { useCallback, useState } from 'react';
import type { Station } from '@/types/station';
import * as storage from '@/lib/storage';

/**
 * Custom hook for managing favorite stations with localStorage persistence.
 *
 * This hook bridges the gap between localStorage (which is not reactive)
 * and React (which needs state changes to re-render).
 *
 * How it works:
 * 1. Initializes state from localStorage on first render
 * 2. When favorites change, updates both localStorage AND React state
 * 3. React state triggers re-renders in components using this hook
 *
 * @returns Object with favorites list and control functions
 *
 * @example
 * const { favorites, isFav, toggleFav, addFav, removeFav } = useFavorites();
 *
 * // List all favorites
 * favorites.map(station => <StationCard key={station.stationuuid} station={station} />)
 *
 * // Check if a station is favorited
 * isFav(station.stationuuid); // true or false
 *
 * // Toggle favorite status
 * toggleFav(station); // Adds if not favorite, removes if is
 */
export function useFavorites() {
  /**
   * React state initialized from localStorage.
   * Using function form of useState (lazy initialization) so
   * getFavorites() only runs once, not on every render.
   */
  const [favorites, setFavorites] = useState<Station[]>(storage.getFavorites);

  /**
   * Adds a station to favorites.
   * Updates both localStorage and React state.
   *
   * @param station - The station to add
   */
  const addFav = useCallback((station: Station) => {
    setFavorites(storage.addFavorite(station));
  }, []);

  /**
   * Removes a station from favorites by its UUID.
   * Updates both localStorage and React state.
   *
   * @param stationuuid - The UUID of the station to remove
   */
  const removeFav = useCallback((stationuuid: string) => {
    setFavorites(storage.removeFavorite(stationuuid));
  }, []);

  /**
   * Toggles favorite status for a station.
   * If it's a favorite, removes it. If not, adds it.
   *
   * This is the main function used by favorite buttons/hearts.
   *
   * @param station - The station to toggle
   */
  const toggleFav = useCallback((station: Station) => {
    if (storage.isFavorite(station.stationuuid)) {
      setFavorites(storage.removeFavorite(station.stationuuid));
    } else {
      setFavorites(storage.addFavorite(station));
    }
  }, []);

  /**
   * Checks if a station is in the favorites list.
   *
   * Uses the React state (not localStorage directly) so this
   * function is reactive and will update if favorites change.
   *
   * @param stationuuid - The UUID of the station to check
   * @returns true if the station is a favorite
   */
  const isFav = useCallback((stationuuid: string) => {
    return favorites.some(f => f.stationuuid === stationuuid);
  }, [favorites]);

  return { favorites, addFav, removeFav, toggleFav, isFav };
}
