import { Volume2, VolumeX } from 'lucide-react';

interface VolumeSliderProps {
  volume: number;
  onChange: (v: number) => void;
}

export function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="btn btn-ghost btn-circle btn-xs"
        onClick={() => onChange(volume === 0 ? 0.7 : 0)}
        title={volume === 0 ? 'Unmute' : 'Mute'}
        aria-label="Volume"
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
        className="range range-xs range-primary w-24"
        aria-label="Volume"
      />
    </div>
  );
}
