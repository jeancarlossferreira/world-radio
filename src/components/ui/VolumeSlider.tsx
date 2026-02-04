import { Volume2, VolumeX } from 'lucide-react';
import styles from './VolumeSlider.module.css';

interface VolumeSliderProps {
  volume: number;
  onChange: (v: number) => void;
}

export function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  return (
    <div className={styles.container}>
      <button
        className={styles.muteBtn}
        onClick={() => onChange(volume === 0 ? 0.7 : 0)}
        title={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={styles.slider}
      />
    </div>
  );
}
