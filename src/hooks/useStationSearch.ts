/**
 * @fileoverview Custom React hook for searching radio stations.
 *
 * This hook provides a complete search solution with:
 * - Debounced search to avoid excessive API calls
 * - Pagination with "load more" functionality
 * - Country name to code conversion (e.g., "USA" → "US")
 * - Loading and error state management
 *
 * @example
 * function SearchPage() {
 *   const { stations, loading, search, loadMore, hasMore } = useStationSearch();
 *
 *   return (
 *     <>
 *       <input onChange={(e) => search({ name: e.target.value })} />
 *       <StationList stations={stations} />
 *       {hasMore && <button onClick={loadMore}>Load More</button>}
 *     </>
 *   );
 * }
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Station } from '@/types/station';
import type { SearchParams } from '@/types/api';
import { searchStations } from '@/lib/api';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { getCountryCodeFromName } from '@/lib/country-data';

/**
 * Custom hook that manages station search with debouncing and pagination.
 *
 * Key features:
 * - **Debouncing**: Waits 300ms after the last keystroke before searching,
 *   preventing excessive API calls while the user is still typing.
 * - **Pagination**: Tracks offset internally and provides a `loadMore` function
 *   to fetch the next page of results.
 * - **Smart country search**: Converts short country names (USA, UK) to
 *   ISO country codes that the API expects.
 *
 * How debouncing works:
 * 1. User types "jazz" (4 keystrokes in quick succession)
 * 2. Each keystroke calls `search()` which resets a 300ms timer
 * 3. Only after 300ms of no typing does the actual API call happen
 * 4. This prevents 4 API calls, doing just 1 instead
 *
 * @returns Object containing search state and control functions
 *
 * @example
 * const { stations, loading, error, hasMore, search, loadMore } = useStationSearch();
 *
 * // Search by name
 * search({ name: 'BBC' });
 *
 * // Search by country (supports short names)
 * search({ country: 'USA' }); // Converts to countrycode: 'US'
 *
 * // Load next page
 * if (hasMore) loadMore();
 */
export function useStationSearch() {
  // Reactive state that triggers re-renders when updated
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [params, setParams] = useState<SearchParams>({});

  /**
   * Refs are used here instead of state because:
   * - offsetRef: We don't want to re-render when offset changes
   * - debounceRef: setTimeout ID doesn't need to trigger renders
   */
  const offsetRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /**
   * Internal function that actually performs the API search.
   *
   * @param searchParams - The search criteria
   * @param append - If true, adds results to existing list (pagination)
   *                 If false, replaces the list (new search)
   */
  const doSearch = useCallback(async (searchParams: SearchParams, append = false) => {
    setLoading(true);
    setError(null);
    try {
      // For pagination, use current offset; for new search, start at 0
      const offset = append ? offsetRef.current : 0;

      // Convert short country names (USA, UK) to ISO codes (US, GB)
      // The Radio Browser API expects country codes, not names
      const finalParams = { ...searchParams };
      if (finalParams.country) {
        const code = getCountryCodeFromName(finalParams.country);
        if (code) {
          finalParams.countrycode = code;
          finalParams.country = undefined; // Clear the name to avoid conflicts
        }
      }

      const results = await searchStations({ ...finalParams, offset, limit: DEFAULT_PAGE_SIZE });

      // Append results for "load more", replace for new search
      if (append) {
        setStations(prev => [...prev, ...results]);
      } else {
        setStations(results);
      }

      // Update offset for next pagination request
      offsetRef.current = offset + results.length;

      // If we got fewer results than requested, there's no more data
      setHasMore(results.length === DEFAULT_PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Public search function with debouncing.
   *
   * Debouncing prevents excessive API calls by waiting for the user
   * to stop typing before actually searching. Each call resets the
   * 300ms timer, so rapid typing only triggers one search at the end.
   *
   * @param newParams - Search parameters from the UI
   */
  const search = useCallback((newParams: SearchParams) => {
    setParams(newParams);
    offsetRef.current = 0; // Reset pagination for new search

    // Clear any pending search timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Schedule the search after 300ms of inactivity
    debounceRef.current = setTimeout(() => doSearch(newParams), 300);
  }, [doSearch]);

  /**
   * Loads the next page of results.
   *
   * Uses the same search parameters but with an increased offset.
   * Only works if not already loading and there are more results.
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      doSearch(params, true); // true = append to existing results
    }
  }, [loading, hasMore, params, doSearch]);

  /**
   * Cleanup effect: cancels any pending debounced search when unmounting.
   * This prevents the "setState on unmounted component" warning.
   */
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { stations, loading, error, hasMore, search, loadMore };
}
