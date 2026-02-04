import type { Station, HistoryEntry } from '@/types/station';
import { STORAGE_KEYS, MAX_FAVORITES, MAX_HISTORY } from './constants';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Favorites
export function getFavorites(): Station[] {
  return readJSON<Station[]>(STORAGE_KEYS.FAVORITES, []);
}

export function addFavorite(station: Station): Station[] {
  const favs = getFavorites();
  if (favs.some(f => f.stationuuid === station.stationuuid)) return favs;
  const updated = [station, ...favs].slice(0, MAX_FAVORITES);
  writeJSON(STORAGE_KEYS.FAVORITES, updated);
  return updated;
}

export function removeFavorite(stationuuid: string): Station[] {
  const favs = getFavorites().filter(f => f.stationuuid !== stationuuid);
  writeJSON(STORAGE_KEYS.FAVORITES, favs);
  return favs;
}

export function isFavorite(stationuuid: string): boolean {
  return getFavorites().some(f => f.stationuuid === stationuuid);
}

// History
export function getHistory(): HistoryEntry[] {
  return readJSON<HistoryEntry[]>(STORAGE_KEYS.HISTORY, []);
}

export function addToHistory(station: Station): HistoryEntry[] {
  const history = getHistory().filter(h => h.station.stationuuid !== station.stationuuid);
  const entry: HistoryEntry = { station, playedAt: new Date().toISOString() };
  const updated = [entry, ...history].slice(0, MAX_HISTORY);
  writeJSON(STORAGE_KEYS.HISTORY, updated);
  return updated;
}

export function clearHistory(): void {
  writeJSON(STORAGE_KEYS.HISTORY, []);
}
