import { Play, Pause, Square, Radio } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { VolumeSlider } from '@/components/ui/VolumeSlider';
import styles from './PlayerBar.module.css';

export function PlayerBar() {
  const { currentStation, isPlaying, isLoading, volume, error, togglePlay, stop, setVolume } = usePlayer();

  if (!currentStation) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.stationInfo}>
        <div className={styles.artwork}>
          {currentStation.favicon ? (
            <img
              src={currentStation.favicon}
              alt=""
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : null}
          <div className={styles.fallback}><Radio size={18} /></div>
        </div>
        <div className={styles.text}>
          <div className={styles.name}>{currentStation.name}</div>
          <div className={styles.meta}>
            {error ? (
              <span className={styles.error}>{error}</span>
            ) : isLoading ? (
              <span>Connecting...</span>
            ) : (
              <span>{currentStation.country}{currentStation.state ? ` · ${currentStation.state}` : ''}{currentStation.bitrate > 0 ? ` · ${currentStation.bitrate} kbps` : ''}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.playBtn} onClick={() => togglePlay()}>
          {isLoading ? (
            <div className={styles.loadingDot} />
          ) : isPlaying ? (
            <Pause size={20} fill="white" />
          ) : (
            <Play size={20} fill="white" />
          )}
        </button>
        <button className={styles.stopBtn} onClick={stop} title="Stop">
          <Square size={16} />
        </button>
      </div>

      <div className={styles.volumeArea}>
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </div>
  );
}
