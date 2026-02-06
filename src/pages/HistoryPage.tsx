import { useEffect } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { StationList } from '@/components/station/StationList';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFavorites } from '@/hooks/useFavorites';
import { useHistory } from '@/hooks/useHistory';
import { useI18n } from '@/context/I18nContext';

export function HistoryPage() {
  const { history, refresh, clear } = useHistory();
  const { isFav, toggleFav } = useFavorites();
  const { t } = useI18n();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stations = history.map(h => h.station);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-center mb-6">
        <img src="/logo.png" alt="AstroTune" className="h-48 rounded-2xl object-contain" />
      </div>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock size={24} />
            {t('page.history')}
          </h1>
          {history.length > 0 && (
            <p className="text-sm text-base-content/60 mt-1">
              {t('stations.count', { count: history.length, plural: history.length !== 1 ? 's' : '' })}
            </p>
          )}
        </div>
        {history.length > 0 && (
          <button className="btn btn-ghost btn-sm text-error gap-1" onClick={clear}>
            <Trash2 size={16} />
            {t('action.clearHistory')}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={<Clock size={40} />}
          title={t('empty.noHistory')}
          description={t('empty.noHistoryDesc')}
        />
      ) : (
        <StationList stations={stations} isFavorite={isFav} onToggleFavorite={toggleFav} />
      )}
    </div>
  );
}
