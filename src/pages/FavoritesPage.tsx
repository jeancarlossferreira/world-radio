import { Heart } from 'lucide-react';
import { StationList } from '@/components/station/StationList';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFavorites } from '@/hooks/useFavorites';
import styles from './FavoritesPage.module.css';

export function FavoritesPage() {
  const { favorites, isFav, toggleFav } = useFavorites();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        <Heart size={24} />
        Favorites
      </h1>
      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart size={40} />}
          title="No favorites yet"
          description="Click the heart icon on any station to save it here"
        />
      ) : (
        <>
          <p className={styles.count}>{favorites.length} station{favorites.length !== 1 ? 's' : ''}</p>
          <StationList stations={favorites} isFavorite={isFav} onToggleFavorite={toggleFav} />
        </>
      )}
    </div>
  );
}
