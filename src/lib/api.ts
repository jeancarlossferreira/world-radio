/**
 * @fileoverview API module for communicating with the Radio Browser API.
 *
 * The Radio Browser API (https://www.radio-browser.info/) is a free, open-source
 * database of internet radio stations. This module provides functions to:
 * - Search for stations by name, country, tag, etc.
 * - Get top/trending stations
 * - Get stations by country or genre tag
 * - Track station clicks (for popularity ranking)
 *
 * All functions are async and return Promises.
 */

import type { Station } from '@/types/station';
import type { Country, Tag, SearchParams } from '@/types/api';
import { API_BASE, DEFAULT_PAGE_SIZE } from './constants';

/**
 * Generic fetch wrapper for the Radio Browser API.
 *
 * This is a private helper function that:
 * 1. Builds the full URL with query parameters
 * 2. Makes the HTTP request with proper headers
 * 3. Handles errors and parses JSON response
 *
 * @template T - The expected response type
 * @param endpoint - API endpoint path (e.g., '/json/stations/search')
 * @param params - Optional query parameters to append to the URL
 * @returns Promise resolving to the parsed JSON response
 * @throws Error if the HTTP response is not OK (status 200-299)
 *
 * @example
 * // Fetch top 10 stations
 * const stations = await apiFetch<Station[]>('/json/stations/topclick', { limit: 10 });
 */
async function apiFetch<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  // Build the full URL from base + endpoint
  const url = new URL(`${API_BASE}${endpoint}`);

  // Add query parameters, filtering out undefined/empty values
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  // Make the request with a User-Agent header (required by some API servers)
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'WorldRadioApp/1.0' },
  });

  // Throw an error if the response is not successful
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  // Parse and return the JSON response
  return res.json();
}

/**
 * Fetches the most popular radio stations (by click count).
 *
 * "Top" stations are ranked by how many times users have clicked/played them.
 * This is useful for showing trending or popular stations on the home page.
 *
 * @param limit - Maximum number of stations to return (default: DEFAULT_PAGE_SIZE)
 * @param offset - Number of stations to skip for pagination (default: 0)
 * @returns Promise resolving to an array of Station objects
 *
 * @example
 * // Get top 30 stations
 * const trending = await getTopStations(30);
 *
 * // Get next page (stations 31-60)
 * const nextPage = await getTopStations(30, 30);
 */
export async function getTopStations(limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<Station[]> {
  return apiFetch<Station[]>('/json/stations/topclick', {
    limit,
    offset,
    hidebroken: true, // Exclude stations that are known to be offline
  });
}

/**
 * Searches for radio stations based on multiple criteria.
 *
 * This is the main search function that powers the search page.
 * You can filter by name, country, genre tag, codec, bitrate, etc.
 * Results are sorted by click count (popularity) by default.
 *
 * @param params - Search parameters object
 * @param params.name - Search by station name (partial match)
 * @param params.tag - Filter by genre tag (e.g., "rock", "jazz")
 * @param params.country - Filter by country name
 * @param params.countrycode - Filter by ISO 3166-1 country code (e.g., "US", "GB")
 * @param params.codec - Filter by audio codec (e.g., "MP3", "AAC")
 * @param params.bitrateMin - Minimum bitrate in kbps
 * @param params.bitrateMax - Maximum bitrate in kbps
 * @param params.has_geo_info - Only return stations with location data
 * @param params.is_https - Only return stations with HTTPS streams
 * @param params.order - Sort field (default: 'clickcount')
 * @param params.reverse - Sort descending if true (default: true)
 * @param params.offset - Pagination offset (default: 0)
 * @param params.limit - Maximum results (default: DEFAULT_PAGE_SIZE)
 * @returns Promise resolving to an array of matching Station objects
 *
 * @example
 * // Search for jazz stations in the USA
 * const stations = await searchStations({
 *   tag: 'jazz',
 *   countrycode: 'US',
 *   limit: 20
 * });
 */
export async function searchStations(params: SearchParams): Promise<Station[]> {
  return apiFetch<Station[]>('/json/stations/search', {
    name: params.name,
    tag: params.tag,
    country: params.country,
    countrycode: params.countrycode,
    codec: params.codec,
    bitrateMin: params.bitrateMin,
    bitrateMax: params.bitrateMax,
    has_geo_info: params.has_geo_info,
    is_https: params.is_https,
    order: params.order || 'clickcount',
    reverse: params.reverse ?? true,
    offset: params.offset || 0,
    limit: params.limit || DEFAULT_PAGE_SIZE,
    hidebroken: params.hidebroken ?? true,
  });
}

/**
 * Fetches the list of all countries that have radio stations.
 *
 * Returns countries sorted by station count (most stations first).
 * Each country includes the ISO 3166-1 code and station count.
 *
 * @returns Promise resolving to an array of Country objects
 *
 * @example
 * const countries = await getCountries();
 * // countries[0] might be { name: "Germany", iso_3166_1: "DE", stationcount: 5000 }
 */
export async function getCountries(): Promise<Country[]> {
  return apiFetch<Country[]>('/json/countries', {
    order: 'stationcount',
    reverse: true,
    hidebroken: true,
  });
}

/**
 * Fetches popular genre tags used by radio stations.
 *
 * Tags are user-defined genres like "rock", "jazz", "news", "classical".
 * Returns tags sorted by how many stations use them.
 *
 * @param limit - Maximum number of tags to return (default: 100)
 * @returns Promise resolving to an array of Tag objects
 *
 * @example
 * const tags = await getTags(50);
 * // tags[0] might be { name: "pop", stationcount: 10000 }
 */
export async function getTags(limit = 100): Promise<Tag[]> {
  return apiFetch<Tag[]>('/json/tags', {
    order: 'stationcount',
    reverse: true,
    limit,
    hidebroken: true,
  });
}

/**
 * Fetches radio stations from a specific country.
 *
 * Uses the ISO 3166-1 alpha-2 country code (e.g., "US" for USA, "GB" for UK).
 * Results are sorted by popularity (click count).
 *
 * @param countrycode - ISO 3166-1 alpha-2 country code
 * @param limit - Maximum number of stations to return (default: DEFAULT_PAGE_SIZE)
 * @param offset - Pagination offset (default: 0)
 * @returns Promise resolving to an array of Station objects
 *
 * @example
 * // Get top 30 stations from Brazil
 * const brazilStations = await getStationsByCountry('BR', 30);
 */
export async function getStationsByCountry(countrycode: string, limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<Station[]> {
  return apiFetch<Station[]>(`/json/stations/bycountrycodeexact/${encodeURIComponent(countrycode)}`, {
    limit,
    offset,
    hidebroken: true,
    order: 'clickcount',
    reverse: true,
  });
}

/**
 * Fetches a single station by its unique identifier (UUID).
 *
 * Each station in the Radio Browser database has a UUID that never changes.
 * This is used for sharing stations and deep linking.
 *
 * @param uuid - The station's unique identifier
 * @returns Promise resolving to a Station object, or null if not found
 *
 * @example
 * const station = await getStationByUUID('96202c3e-0601-11e8-ae97-52543be04c81');
 * if (station) {
 *   console.log(station.name); // "BBC Radio 1"
 * }
 */
export async function getStationByUUID(uuid: string): Promise<Station | null> {
  const stations = await apiFetch<Station[]>(`/json/stations/byuuid/${encodeURIComponent(uuid)}`);
  return stations[0] ?? null;
}

/**
 * Records that a user clicked/played a station.
 *
 * This is used by the Radio Browser API to track popularity.
 * The click count affects search rankings.
 * This is a "fire and forget" operation - errors are silently ignored.
 *
 * @param stationuuid - The UUID of the station that was played
 * @returns Promise that resolves when the request completes
 *
 * @example
 * // Track that user played a station (don't await - fire and forget)
 * trackStationClick(station.stationuuid);
 */
export async function trackStationClick(stationuuid: string): Promise<void> {
  try {
    await apiFetch(`/json/url/${encodeURIComponent(stationuuid)}`);
  } catch {
    // Click tracking is best-effort - don't fail if it doesn't work
  }
}

/**
 * Fetches radio stations that match a specific genre tag.
 *
 * Tags are genres like "rock", "jazz", "news", "classical", "80s", etc.
 * Results are sorted by popularity (click count).
 *
 * @param tag - The genre tag to search for
 * @param limit - Maximum number of stations to return (default: DEFAULT_PAGE_SIZE)
 * @param offset - Pagination offset (default: 0)
 * @returns Promise resolving to an array of Station objects
 *
 * @example
 * // Get 20 rock stations
 * const rockStations = await getStationsByTag('rock', 20);
 */
export async function getStationsByTag(tag: string, limit = DEFAULT_PAGE_SIZE, offset = 0): Promise<Station[]> {
  return apiFetch<Station[]>('/json/stations/bytag/' + encodeURIComponent(tag), {
    limit,
    offset,
    hidebroken: true,
    order: 'clickcount',
    reverse: true,
  });
}
