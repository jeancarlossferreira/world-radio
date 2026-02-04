import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Radio } from 'lucide-react';
import type { Station } from '@/types/station';
import { getTopStations, getStationsByTag } from '@/lib/api';
import { GENRE_TAGS } from '@/lib/constants';
import { StationList } from '@/components/station/StationList';
import { SearchBar } from '@/components/search/SearchBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useFavorites } from '@/hooks/useFavorites';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Radio size={40} className={styles.heroIcon} />
          <h1>World Radio</h1>
          <p>Listen to radio stations from around the world</p>
          <div className={styles.heroSearch}>
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for stations, genres, or countries..."
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <TrendingUp size={20} />
          Browse by Genre
        </h2>
        <div className={styles.genres}>
          {GENRE_TAGS.map(genre => (
            <button
              key={genre}
              className={`${styles.genreChip} ${selectedGenre === genre ? styles.genreActive : ''}`}
              onClick={() => handleGenreClick(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        {genreLoading && <LoadingSpinner size={24} />}
        {selectedGenre && genreStations.length > 0 && (
          <div className={styles.genreResults}>
            <StationList stations={genreStations} isFavorite={isFav} onToggleFavorite={toggleFav} />
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <TrendingUp size={20} />
          Trending Stations
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
