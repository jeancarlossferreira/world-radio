import { useCallback, useState } from 'react';
import type { HistoryEntry } from '@/types/station';
import * as storage from '@/lib/storage';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(storage.getHistory);

  const refresh = useCallback(() => {
    setHistory(storage.getHistory());
  }, []);

  const clear = useCallback(() => {
    storage.clearHistory();
    setHistory([]);
  }, []);

  return { history, refresh, clear };
}
