import { Heart } from 'lucide-react';
import { StationList } from '@/components/station/StationList';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFavorites } from '@/hooks/useFavorites';

export function FavoritesPage() {
  const { favorites, isFav, toggleFav } = useFavorites();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-5">
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
          <p className="text-sm text-base-content/60 mb-4">{favorites.length} station{favorites.length !== 1 ? 's' : ''}</p>
          <StationList stations={favorites} isFavorite={isFav} onToggleFavorite={toggleFav} />
        </>
      )}
    </div>
  );
}
