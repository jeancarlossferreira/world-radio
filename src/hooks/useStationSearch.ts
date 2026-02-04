import { useCallback, useEffect, useRef, useState } from 'react';
import type { Station } from '@/types/station';
import type { SearchParams } from '@/types/api';
import { searchStations } from '@/lib/api';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

export function useStationSearch() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [params, setParams] = useState<SearchParams>({});
  const offsetRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback(async (searchParams: SearchParams, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const offset = append ? offsetRef.current : 0;
      const results = await searchStations({ ...searchParams, offset, limit: DEFAULT_PAGE_SIZE });
      if (append) {
        setStations(prev => [...prev, ...results]);
      } else {
        setStations(results);
      }
      offsetRef.current = offset + results.length;
      setHasMore(results.length === DEFAULT_PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback((newParams: SearchParams) => {
    setParams(newParams);
    offsetRef.current = 0;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(newParams), 300);
  }, [doSearch]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      doSearch(params, true);
    }
  }, [loading, hasMore, params, doSearch]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { stations, loading, error, hasMore, search, loadMore };
}
