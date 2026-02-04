import { useEffect } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { StationList } from '@/components/station/StationList';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFavorites } from '@/hooks/useFavorites';
import { useHistory } from '@/hooks/useHistory';
import styles from './HistoryPage.module.css';

export function HistoryPage() {
  const { history, refresh, clear } = useHistory();
  const { isFav, toggleFav } = useFavorites();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stations = history.map(h => h.station);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Clock size={24} />
            History
          </h1>
          {history.length > 0 && (
            <p className={styles.count}>{history.length} station{history.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        {history.length > 0 && (
          <button className={styles.clearBtn} onClick={clear}>
            <Trash2 size={16} />
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={<Clock size={40} />}
          title="No history yet"
          description="Stations you play will appear here"
        />
      ) : (
        <StationList stations={stations} isFavorite={isFav} onToggleFavorite={toggleFav} />
      )}
    </div>
  );
}
