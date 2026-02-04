import { createContext, useContext, type ReactNode } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import type { Station } from '@/types/station';

interface PlayerContextValue {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  error: string | null;
  play: (station: Station) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  togglePlay: (station?: Station) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer();
  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
