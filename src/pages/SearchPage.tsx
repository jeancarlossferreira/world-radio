import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { StationList } from '@/components/station/StationList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStationSearch } from '@/hooks/useStationSearch';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/context/I18nContext';

export function SearchPage() {
  const { t } = useI18n();
  const [urlParams] = useSearchParams();
  const initialQuery = urlParams.get('q') || '';
  const [name, setName] = useState(initialQuery);
  const [tag, setTag] = useState('');
  const [country, setCountry] = useState('');
  const [codec, setCodec] = useState('');
  const { stations, loading, error, hasMore, search, loadMore } = useStationSearch();
  const { isFav, toggleFav } = useFavorites();

  useEffect(() => {
    if (name || tag || country || codec) {
      search({ name, tag, country, codec });
    }
  }, [name, tag, country, codec, search]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-5">{t('page.searchStations')}</h1>
      <SearchBar value={name} onChange={setName} />
      <FilterPanel
        tag={tag}
        country={country}
        codec={codec}
        onTagChange={setTag}
        onCountryChange={setCountry}
        onCodecChange={setCodec}
      />

      <div className="mt-6">
        {loading && stations.length === 0 && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && stations.length === 0 && (name || tag || country) && (
          <EmptyState
            icon={<Search size={40} />}
            title={t('empty.noStationsFound')}
            description={t('empty.noStationsFoundDesc')}
          />
        )}
        {stations.length > 0 && (
          <>
            <StationList stations={stations} isFavorite={isFav} onToggleFavorite={toggleFav} />
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button className="btn btn-ghost btn-sm" onClick={loadMore} disabled={loading}>
                  {loading ? t('action.loading') : t('action.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
