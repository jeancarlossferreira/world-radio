/**
 * @fileoverview Player context for global audio playback control.
 *
 * This module uses React Context to provide audio playback state and
 * controls to any component in the app, without prop drilling.
 *
 * Architecture:
 * - PlayerProvider wraps the app and manages the audio player instance
 * - usePlayer hook gives any component access to playback controls
 * - Internally uses the useAudioPlayer hook for actual audio logic
 *
 * Why use Context for the player?
 * - Multiple components need playback info (player bar, station cards, map)
 * - Only one audio element should exist (singleton pattern)
 * - Changes to playback state should update all listeners
 *
 * @example
 * // In main.tsx - wrap app with provider
 * <PlayerProvider>
 *   <App />
 * </PlayerProvider>
 *
 * // In any component - use the player
 * function StationCard({ station }) {
 *   const { isPlaying, currentStation, togglePlay } = usePlayer();
 *   const isThisPlaying = isPlaying && currentStation?.stationuuid === station.stationuuid;
 *
 *   return (
 *     <button onClick={() => togglePlay(station)}>
 *       {isThisPlaying ? 'Pause' : 'Play'}
 *     </button>
 *   );
 * }
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import type { Station } from '@/types/station';

/**
 * The shape of the player context value.
 *
 * State:
 * @property currentStation - The currently loaded station (null if none)
 * @property isPlaying - True if audio is actively playing
 * @property isLoading - True if buffering/connecting to stream
 * @property volume - Current volume level (0.0 to 1.0)
 * @property error - Error message if playback failed, null otherwise
 *
 * Actions:
 * @property play - Start playing a specific station
 * @property pause - Pause playback (station stays loaded)
 * @property resume - Resume paused playback
 * @property stop - Stop playback and clear station
 * @property setVolume - Adjust volume (0.0 to 1.0)
 * @property togglePlay - Smart toggle: play new station or pause/resume current
 */
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

/**
 * React Context for the audio player.
 * Initialized as null; will throw if used outside provider.
 */
const PlayerContext = createContext<PlayerContextValue | null>(null);

/**
 * Provider component that supplies player context to the app.
 *
 * This creates a single audio player instance (via useAudioPlayer)
 * and makes it available to all child components.
 *
 * Should wrap your entire app at the root level, alongside other providers.
 *
 * @param props.children - The app content that needs player access
 *
 * @example
 * <PlayerProvider>
 *   <I18nProvider>
 *     <App />
 *   </I18nProvider>
 * </PlayerProvider>
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  // useAudioPlayer creates and manages the Audio element
  const player = useAudioPlayer();

  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
}

/**
 * Hook to access the audio player from any component.
 *
 * Provides both state (what's playing, loading, errors) and
 * actions (play, pause, volume) for controlling playback.
 *
 * @throws Error if used outside of PlayerProvider
 * @returns The player context with state and control functions
 *
 * @example
 * function PlayerBar() {
 *   const { currentStation, isPlaying, pause, resume, volume, setVolume } = usePlayer();
 *
 *   if (!currentStation) return null;
 *
 *   return (
 *     <div>
 *       <span>Now playing: {currentStation.name}</span>
 *       <button onClick={isPlaying ? pause : resume}>
 *         {isPlaying ? 'Pause' : 'Play'}
 *       </button>
 *       <input
 *         type="range"
 *         min={0} max={1} step={0.1}
 *         value={volume}
 *         onChange={e => setVolume(Number(e.target.value))}
 *       />
 *     </div>
 *   );
 * }
 */
export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
