import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Station } from '@/types/station';
import { getStationsByCountry } from '@/lib/api';
import { StationList } from '@/components/station/StationList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/context/I18nContext';

export function CountryDetailPage() {
  const { code } = useParams<{ code: string }>();
  const { t, localizeCountry } = useI18n();
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

  const countryName = code ? localizeCountry(code) : '';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="AstroTune" className="h-48 rounded-2xl object-contain" />
      </div>
      <Link to="/countries" className="btn btn-ghost btn-sm gap-1 mb-4">
        <ArrowLeft size={18} />
        {t('action.allCountries')}
      </Link>
      <h1 className="text-2xl font-bold mb-5 flex items-center gap-3">
        {code && (
          <img
            src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
            alt={countryName}
            className="rounded-sm"
            width={40}
            height={30}
          />
        )}
        {countryName}
      </h1>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={() => load(0)} />}
      {!loading && !error && (
        <>
          <StationList stations={stations} isFavorite={isFav} onToggleFavorite={toggleFav} />
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => load(stations.length)}
                disabled={loadingMore}
              >
                {loadingMore ? t('action.loading') : t('action.loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
