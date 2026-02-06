/**
 * @fileoverview Local storage utilities for persisting user data.
 *
 * This module handles storing and retrieving user data in the browser's
 * localStorage. Data is serialized as JSON strings.
 *
 * Two main data types are stored:
 * - **Favorites**: Stations the user has marked as favorites
 * - **History**: Recently played stations with timestamps
 *
 * Both are capped at a maximum size to prevent unbounded storage growth.
 *
 * localStorage characteristics:
 * - Persists across browser sessions (unlike sessionStorage)
 * - ~5MB limit per origin
 * - Synchronous API (blocks the main thread)
 * - String-only storage (we use JSON.stringify/parse)
 *
 * @example
 * import { addFavorite, getFavorites, addToHistory } from '@/lib/storage';
 *
 * // Add a station to favorites
 * addFavorite(station);
 *
 * // Get all favorites
 * const favs = getFavorites();
 *
 * // Record a station play in history
 * addToHistory(station);
 */

import type { Station, HistoryEntry } from '@/types/station';
import { STORAGE_KEYS, MAX_FAVORITES, MAX_HISTORY } from './constants';

/**
 * Reads and parses a JSON value from localStorage.
 *
 * This is a type-safe wrapper around localStorage.getItem() that:
 * - Handles missing keys by returning the fallback
 * - Catches JSON parse errors and returns the fallback
 * - Uses TypeScript generics for type safety
 *
 * @template T - The expected type of the stored data
 * @param key - The localStorage key to read
 * @param fallback - Value to return if key doesn't exist or is invalid
 * @returns The parsed value, or fallback if reading fails
 */
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    // JSON.parse can throw if data is corrupted
    return fallback;
  }
}

/**
 * Writes a value to localStorage as JSON.
 *
 * @template T - The type of data being stored
 * @param key - The localStorage key to write
 * @param data - The data to serialize and store
 */
function writeJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============================================================================
// FAVORITES
// ============================================================================

/**
 * Retrieves all favorite stations from localStorage.
 *
 * @returns Array of favorite stations, newest first. Empty array if none.
 *
 * @example
 * const favorites = getFavorites();
 * console.log(`You have ${favorites.length} favorite stations`);
 */
export function getFavorites(): Station[] {
  return readJSON<Station[]>(STORAGE_KEYS.FAVORITES, []);
}

/**
 * Adds a station to the favorites list.
 *
 * Behavior:
 * - If station is already a favorite, returns existing list unchanged
 * - New favorites are added at the beginning (most recent first)
 * - List is capped at MAX_FAVORITES (oldest are removed if over limit)
 *
 * @param station - The station to add to favorites
 * @returns The updated favorites array
 *
 * @example
 * const updatedFavs = addFavorite(station);
 * // Station is now at the top of the favorites list
 */
export function addFavorite(station: Station): Station[] {
  const favs = getFavorites();

  // Don't add duplicates
  if (favs.some(f => f.stationuuid === station.stationuuid)) return favs;

  // Add to front, cap at max size
  const updated = [station, ...favs].slice(0, MAX_FAVORITES);
  writeJSON(STORAGE_KEYS.FAVORITES, updated);
  return updated;
}

/**
 * Removes a station from the favorites list.
 *
 * @param stationuuid - The UUID of the station to remove
 * @returns The updated favorites array (without the removed station)
 *
 * @example
 * removeFavorite(station.stationuuid);
 */
export function removeFavorite(stationuuid: string): Station[] {
  const favs = getFavorites().filter(f => f.stationuuid !== stationuuid);
  writeJSON(STORAGE_KEYS.FAVORITES, favs);
  return favs;
}

/**
 * Checks if a station is in the favorites list.
 *
 * @param stationuuid - The UUID of the station to check
 * @returns true if the station is a favorite, false otherwise
 *
 * @example
 * if (isFavorite(station.stationuuid)) {
 *   // Show filled heart icon
 * }
 */
export function isFavorite(stationuuid: string): boolean {
  return getFavorites().some(f => f.stationuuid === stationuuid);
}

// ============================================================================
// HISTORY
// ============================================================================

/**
 * Retrieves the listening history from localStorage.
 *
 * @returns Array of history entries with station and playedAt timestamp.
 *          Most recently played first. Empty array if none.
 *
 * @example
 * const history = getHistory();
 * history.forEach(entry => {
 *   console.log(`Played ${entry.station.name} at ${entry.playedAt}`);
 * });
 */
export function getHistory(): HistoryEntry[] {
  return readJSON<HistoryEntry[]>(STORAGE_KEYS.HISTORY, []);
}

/**
 * Adds a station to the listening history.
 *
 * Behavior:
 * - Removes any existing entry for this station (prevents duplicates)
 * - Adds new entry at the beginning with current timestamp
 * - Caps at MAX_HISTORY entries (oldest are removed if over limit)
 *
 * This is called automatically when a user plays a station.
 *
 * @param station - The station that was played
 * @returns The updated history array
 *
 * @example
 * // Called internally by useAudioPlayer when playing a station
 * addToHistory(station);
 */
export function addToHistory(station: Station): HistoryEntry[] {
  // Remove existing entry for this station (we'll add it fresh at the top)
  const history = getHistory().filter(h => h.station.stationuuid !== station.stationuuid);

  // Create new entry with ISO timestamp
  const entry: HistoryEntry = { station, playedAt: new Date().toISOString() };

  // Add to front, cap at max size
  const updated = [entry, ...history].slice(0, MAX_HISTORY);
  writeJSON(STORAGE_KEYS.HISTORY, updated);
  return updated;
}

/**
 * Clears all listening history.
 *
 * Use this when the user wants to clear their history for privacy.
 *
 * @example
 * <button onClick={clearHistory}>Clear History</button>
 */
export function clearHistory(): void {
  writeJSON(STORAGE_KEYS.HISTORY, []);
}
