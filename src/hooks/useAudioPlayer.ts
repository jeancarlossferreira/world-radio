import { useCallback, useEffect, useRef, useState } from 'react';
import type { Station } from '@/types/station';
import { trackStationClick } from '@/lib/api';
import { addToHistory } from '@/lib/storage';

export interface AudioPlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  error: string | null;
}

export interface AudioPlayerActions {
  play: (station: Station) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  togglePlay: (station?: Station) => void;
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    currentStation: null,
    isPlaying: false,
    isLoading: false,
    volume: 0.7,
    error: null,
  });

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.7;
    audioRef.current = audio;

    audio.addEventListener('playing', () => {
      setState(s => ({ ...s, isPlaying: true, isLoading: false, error: null }));
    });
    audio.addEventListener('pause', () => {
      setState(s => ({ ...s, isPlaying: false }));
    });
    audio.addEventListener('waiting', () => {
      setState(s => ({ ...s, isLoading: true }));
    });
    audio.addEventListener('error', () => {
      setState(s => ({
        ...s,
        isPlaying: false,
        isLoading: false,
        error: 'Failed to load station. The stream may be unavailable.',
      }));
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback((station: Station) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = station.url_resolved || station.url;
    setState(s => ({
      ...s,
      currentStation: station,
      isLoading: true,
      isPlaying: false,
      error: null,
    }));
    audio.play().catch(() => {
      setState(s => ({
        ...s,
        isLoading: false,
        error: 'Playback blocked. Try clicking play again.',
      }));
    });

    trackStationClick(station.stationuuid);
    addToHistory(station);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = '';
    setState(s => ({ ...s, currentStation: null, isPlaying: false, isLoading: false, error: null }));
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setState(s => ({ ...s, volume: v }));
  }, []);

  const togglePlay = useCallback((station?: Station) => {
    if (station && station.stationuuid !== state.currentStation?.stationuuid) {
      play(station);
    } else if (state.isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [state.currentStation?.stationuuid, state.isPlaying, play, pause, resume]);

  return { ...state, play, pause, resume, stop, setVolume, togglePlay };
}
