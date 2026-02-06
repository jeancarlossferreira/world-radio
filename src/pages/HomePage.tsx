import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import type { Station } from '@/types/station';
import { getTopStations, getStationsByTag } from '@/lib/api';
import { GENRE_TAGS } from '@/lib/constants';
import { StationList } from '@/components/station/StationList';
import { SearchBar } from '@/components/search/SearchBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/context/I18nContext';

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [trending, setTrending] = useState<Station[]>([]);
  const [genreStations, setGenreStations] = useState<Station[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isFav, toggleFav } = useFavorites();

  const loadTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTopStations(30);
      setTrending(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  const handleGenreClick = async (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre('');
      setGenreStations([]);
      return;
    }
    setSelectedGenre(genre);
    setGenreLoading(true);
    try {
      const data = await getStationsByTag(genre, 20);
      setGenreStations(data);
    } catch {
      setGenreStations([]);
    } finally {
      setGenreLoading(false);
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="AstroTune" className="h-48 rounded-2xl object-contain" />
      </div>
      <p className="text-center text-base-content/70 mb-4">{t('app.tagline')}</p>
      <div className="max-w-sm mx-auto mb-8">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          placeholder={t('search.placeholderHome')}
        />
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrendingUp size={20} />
          {t('page.browseByGenre')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {GENRE_TAGS.map(genre => (
            <button
              key={genre}
              className={`btn btn-xs ${selectedGenre === genre ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleGenreClick(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        {genreLoading && <LoadingSpinner size={24} />}
        {selectedGenre && genreStations.length > 0 && (
          <div className="mt-4">
            <StationList stations={genreStations} isFavorite={isFav} onToggleFavorite={toggleFav} />
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrendingUp size={20} />
          {t('page.trendingStations')}
        </h2>
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={loadTrending} />}
        {!loading && !error && (
          <StationList stations={trending} isFavorite={isFav} onToggleFavorite={toggleFav} />
        )}
      </section>
    </div>
  );
}
