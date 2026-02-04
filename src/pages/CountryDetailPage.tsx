import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Station } from '@/types/station';
import { getStationsByCountry } from '@/lib/api';
import { StationList } from '@/components/station/StationList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useFavorites } from '@/hooks/useFavorites';
import styles from './CountryDetailPage.module.css';

export function CountryDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { isFav, toggleFav } = useFavorites();

  const load = useCallback(async (offset = 0) => {
    if (!code) return;
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const data = await getStationsByCountry(code, 30, offset);
      if (offset === 0) setStations(data);
      else setStations(prev => [...prev, ...data]);
      setHasMore(data.length === 30);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [code]);

  useEffect(() => {
    load(0);
  }, [load]);

  const countryName = stations[0]?.country || code?.toUpperCase() || '';

  return (
    <div className={styles.page}>
      <Link to="/countries" className={styles.back}>
        <ArrowLeft size={18} />
        All Countries
      </Link>
      <h1 className={styles.title}>{countryName}</h1>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={() => load(0)} />}
      {!loading && !error && (
        <>
          <StationList stations={stations} isFavorite={isFav} onToggleFavorite={toggleFav} />
          {hasMore && (
            <button
              className={styles.loadMore}
              onClick={() => load(stations.length)}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
