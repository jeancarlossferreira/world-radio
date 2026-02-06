import { Heart } from 'lucide-react';
import { StationList } from '@/components/station/StationList';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/context/I18nContext';

export function FavoritesPage() {
  const { favorites, isFav, toggleFav } = useFavorites();
  const { t } = useI18n();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="AstroTune" className="h-48 rounded-2xl object-contain" />
      </div>
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-5">
        <Heart size={24} />
        {t('page.favorites')}
      </h1>
      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart size={40} />}
          title={t('empty.noFavorites')}
          description={t('empty.noFavoritesDesc')}
        />
      ) : (
        <>
          <p className="text-sm text-base-content/60 mb-4">
            {t('stations.count', { count: favorites.length, plural: favorites.length !== 1 ? 's' : '' })}
          </p>
          <StationList stations={favorites} isFavorite={isFav} onToggleFavorite={toggleFav} />
        </>
      )}
    </div>
  );
}
