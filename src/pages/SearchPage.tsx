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
import styles from './SearchPage.module.css';

export function SearchPage() {
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
    <div className={styles.page}>
      <h1 className={styles.title}>Search Stations</h1>
      <SearchBar value={name} onChange={setName} />
      <FilterPanel
        tag={tag}
        country={country}
        codec={codec}
        onTagChange={setTag}
        onCountryChange={setCountry}
        onCodecChange={setCodec}
      />

      <div className={styles.results}>
        {loading && stations.length === 0 && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && stations.length === 0 && (name || tag || country) && (
          <EmptyState
            icon={<Search size={40} />}
            title="No stations found"
            description="Try different search terms or adjust filters"
          />
        )}
        {stations.length > 0 && (
          <>
            <StationList stations={stations} isFavorite={isFav} onToggleFavorite={toggleFav} />
            {hasMore && (
              <button className={styles.loadMore} onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
