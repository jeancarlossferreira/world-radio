/**
 * @fileoverview Custom React hook for managing audio playback.
 *
 * This hook encapsulates all the logic for playing radio streams:
 * - Creating and managing an HTML5 Audio element
 * - Handling play, pause, stop, and volume controls
 * - Tracking playback state (playing, loading, errors)
 * - Recording station plays in history and API analytics
 *
 * The hook uses the HTML5 Audio API which supports streaming audio.
 * Most radio stations stream in MP3, AAC, or OGG format.
 *
 * @example
 * function PlayerComponent() {
 *   const { currentStation, isPlaying, play, pause } = useAudioPlayer();
 *
 *   return (
 *     <button onClick={() => isPlaying ? pause() : play(station)}>
 *       {isPlaying ? 'Pause' : 'Play'}
 *     </button>
 *   );
 * }
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Station } from '@/types/station';
import { trackStationClick } from '@/lib/api';
import { addToHistory } from '@/lib/storage';

/**
 * Represents the current state of the audio player.
 *
 * @property currentStation - The station currently loaded (null if none)
 * @property isPlaying - True if audio is actively playing
 * @property isLoading - True if audio is buffering/loading
 * @property volume - Current volume level (0.0 to 1.0)
 * @property error - Error message if playback failed, null otherwise
 */
export interface AudioPlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  error: string | null;
}

/**
 * Actions available to control the audio player.
 *
 * @property play - Start playing a specific station
 * @property pause - Pause the current playback
 * @property resume - Resume paused playback
 * @property stop - Stop playback and clear the current station
 * @property setVolume - Adjust the volume (0.0 to 1.0)
 * @property togglePlay - Smart toggle: play new station or pause/resume current
 */
export interface AudioPlayerActions {
  play: (station: Station) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  togglePlay: (station?: Station) => void;
}

/**
 * Custom hook that manages audio playback for radio streams.
 *
 * This is the core audio logic for the app. It creates an HTML5 Audio
 * element and exposes functions to control it, along with state that
 * tracks what's happening.
 *
 * Key concepts:
 * - Uses useRef to persist the Audio element across renders
 * - Uses useState to track playback state reactively
 * - Uses useCallback to memoize action functions
 * - Event listeners update state when audio events occur
 *
 * Browser autoplay policies:
 * - Browsers block audio.play() if there's no user interaction
 * - We catch this error and show a helpful message
 * - User clicking play again satisfies the interaction requirement
 *
 * @returns Object containing player state and control functions
 *
 * @example
 * const player = useAudioPlayer();
 *
 * // Play a station
 * player.play(station);
 *
 * // Check if playing
 * if (player.isPlaying) { ... }
 *
 * // Adjust volume (0.0 to 1.0)
 * player.setVolume(0.5);
 */
export function useAudioPlayer() {
  /**
   * Reference to the HTML5 Audio element.
   * Using useRef because we don't want re-renders when the audio element changes.
   * The same Audio instance persists for the lifetime of the component.
   */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Reactive state that components can use to render UI.
   * Any changes here will trigger re-renders in components using this hook.
   */
  const [state, setState] = useState<AudioPlayerState>({
    currentStation: null,
    isPlaying: false,
    isLoading: false,
    volume: 0.7, // Default 70% volume
    error: null,
  });

  /**
   * Effect that runs once on mount to create and configure the Audio element.
   *
   * We set up event listeners to sync the Audio element's state with our
   * React state. The Audio element fires events when:
   * - 'playing': Audio starts playing (after buffering)
   * - 'pause': Audio is paused
   * - 'waiting': Audio is buffering (loading more data)
   * - 'error': Something went wrong (stream offline, network error, etc.)
   *
   * The cleanup function (return) runs on unmount to stop audio and
   * prevent memory leaks.
   */
  useEffect(() => {
    // Create a new Audio element
    const audio = new Audio();
    audio.volume = 0.7;
    audioRef.current = audio;

    // When audio starts playing successfully
    audio.addEventListener('playing', () => {
      setState(s => ({ ...s, isPlaying: true, isLoading: false, error: null }));
    });

    // When audio is paused
    audio.addEventListener('pause', () => {
      setState(s => ({ ...s, isPlaying: false }));
    });

    // When audio is buffering (waiting for data)
    audio.addEventListener('waiting', () => {
      setState(s => ({ ...s, isLoading: true }));
    });

    // When an error occurs (stream unavailable, network error, etc.)
    audio.addEventListener('error', () => {
      setState(s => ({
        ...s,
        isPlaying: false,
        isLoading: false,
        error: 'Failed to load station. The stream may be unavailable.',
      }));
    });

    // Cleanup function: stop audio when component unmounts
    return () => {
      audio.pause();
      audio.src = ''; // Release the stream resource
    };
  }, []);

  /**
   * Starts playing a new radio station.
   *
   * This function:
   * 1. Stops any currently playing audio
   * 2. Sets the new stream URL
   * 3. Attempts to start playback
   * 4. Tracks the play in analytics and history
   *
   * If playback fails due to browser autoplay policy (NotAllowedError),
   * we show a friendly message. Other errors indicate stream problems.
   *
   * @param station - The station object to play
   */
  const play = useCallback((station: Station) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Stop current playback first
    audio.pause();

    // Set the stream URL (prefer resolved URL which handles redirects)
    audio.src = station.url_resolved || station.url;

    // Update state to show we're loading the new station
    setState(s => ({
      ...s,
      currentStation: station,
      isLoading: true,
      isPlaying: false,
      error: null,
    }));

    // Attempt to play - this returns a Promise
    audio.play().catch((err) => {
      // Check if blocked by browser autoplay policy
      const isAutoplayBlocked = err.name === 'NotAllowedError';
      setState(s => ({
        ...s,
        isLoading: false,
        error: isAutoplayBlocked
          ? 'Click play to start listening.'
          : 'Stream unavailable. Try another station.',
      }));
    });

    // Track the click for API analytics (fire and forget)
    trackStationClick(station.stationuuid);

    // Add to local listening history
    addToHistory(station);
  }, []);

  /**
   * Pauses the current playback.
   * The station remains loaded so you can resume later.
   */
  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  /**
   * Resumes paused playback.
   * Only works if a station is already loaded.
   */
  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  /**
   * Completely stops playback and clears the current station.
   * Use this when the user wants to close/clear the player.
   */
  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = ''; // Clear the source

    // Reset all state
    setState(s => ({
      ...s,
      currentStation: null,
      isPlaying: false,
      isLoading: false,
      error: null,
    }));
  }, []);

  /**
   * Adjusts the playback volume.
   *
   * @param v - Volume level from 0.0 (muted) to 1.0 (full volume)
   */
  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setState(s => ({ ...s, volume: v }));
  }, []);

  /**
   * Smart play/pause toggle.
   *
   * Behavior:
   * - If a different station is provided, play that station
   * - If currently playing the same station, pause it
   * - If paused, resume playback
   *
   * This is the main function used by play buttons throughout the app.
   *
   * @param station - Optional station to play. If omitted, toggles current.
   */
  const togglePlay = useCallback((station?: Station) => {
    // If a new station is provided that's different from current, play it
    if (station && station.stationuuid !== state.currentStation?.stationuuid) {
      play(station);
    }
    // If currently playing, pause
    else if (state.isPlaying) {
      pause();
    }
    // If paused, resume
    else {
      resume();
    }
  }, [state.currentStation?.stationuuid, state.isPlaying, play, pause, resume]);

  // Return state and actions as a single object
  return { ...state, play, pause, resume, stop, setVolume, togglePlay };
}
